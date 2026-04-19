import asyncio
import json

import websockets
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from server.core.config import settings

router = APIRouter()

OPENAI_REALTIME_URL = "wss://api.openai.com/v1/realtime?intent=transcription"


def _log(*args):
    print("[STT]", *args, flush=True)


def _session_update_payload() -> dict:
    # Despite the docs showing a flat shape, the live API rejects it with
    # "Missing required parameter: 'session'" — so we nest under `session`.
    return {
        "type": "transcription_session.update",
        "session": {
            "input_audio_format": "pcm16",
            "input_audio_transcription": {"model": "gpt-4o-transcribe"},
            "turn_detection": {
                "type": "server_vad",
                "threshold": 0.5,
                "prefix_padding_ms": 300,
                "silence_duration_ms": 300,
            },
            "input_audio_noise_reduction": {"type": "near_field"},
        },
    }


@router.websocket("")
async def stt_socket(client_ws: WebSocket):
    await client_ws.accept()
    _log("client WS accepted")

    api_key = getattr(settings, "OPENAI_API_KEY", None)
    if not api_key:
        _log("ERROR: OPENAI_API_KEY not configured")
        await client_ws.send_json(
            {"type": "error", "message": "OPENAI_API_KEY not configured on server"}
        )
        await client_ws.close()
        return

    headers = [
        ("Authorization", f"Bearer {api_key}"),
        ("OpenAI-Beta", "realtime=v1"),
    ]

    try:
        _log("connecting to OpenAI Realtime...")
        async with websockets.connect(
            OPENAI_REALTIME_URL,
            additional_headers=headers,
            max_size=16 * 1024 * 1024,
        ) as upstream:
            _log("upstream connected; sending transcription_session.update")
            await upstream.send(json.dumps(_session_update_payload()))

            chunk_count = {"n": 0}

            async def pump_client_to_upstream():
                try:
                    while True:
                        msg = await client_ws.receive()
                        if msg.get("type") == "websocket.disconnect":
                            _log("client disconnected")
                            break
                        text = msg.get("text")
                        if text is None:
                            continue
                        try:
                            payload = json.loads(text)
                        except json.JSONDecodeError:
                            continue

                        mtype = payload.get("type")
                        if mtype == "audio":
                            chunk_count["n"] += 1
                            if chunk_count["n"] == 1:
                                _log(
                                    f"first audio chunk forwarded (b64 len={len(payload.get('data', ''))})"
                                )
                            elif chunk_count["n"] % 50 == 0:
                                _log(f"forwarded {chunk_count['n']} audio chunks")
                            await upstream.send(
                                json.dumps(
                                    {
                                        "type": "input_audio_buffer.append",
                                        "audio": payload.get("data", ""),
                                    }
                                )
                            )
                        elif mtype == "commit":
                            await upstream.send(
                                json.dumps({"type": "input_audio_buffer.commit"})
                            )
                except WebSocketDisconnect:
                    _log("client disconnected (exception)")

            async def pump_upstream_to_client():
                try:
                    async for raw in upstream:
                        try:
                            evt = json.loads(raw)
                        except json.JSONDecodeError:
                            continue
                        etype = evt.get("type", "")
                        if etype.endswith("input_audio_transcription.delta"):
                            await client_ws.send_json(
                                {"type": "delta", "text": evt.get("delta", "")}
                            )
                        elif etype.endswith("input_audio_transcription.completed"):
                            _log(f"final transcript: {evt.get('transcript', '')!r}")
                            await client_ws.send_json(
                                {"type": "final", "text": evt.get("transcript", "")}
                            )
                        elif etype == "error" or etype.endswith(".error"):
                            err = evt.get("error", evt) if isinstance(evt.get("error", evt), dict) else {}
                            code = err.get("code")
                            msg = err.get("message")
                            # Benign: server_vad already auto-committed, so our
                            # defensive manual commit on stop hits an empty buffer.
                            if code == "input_audio_buffer_commit_empty":
                                _log("ignoring benign empty-commit error (server_vad already flushed)")
                            else:
                                _log(f"UPSTREAM ERROR event: {evt}")
                                await client_ws.send_json(
                                    {"type": "error", "message": msg or "upstream error"}
                                )
                        else:
                            # log every non-delta upstream event once for diagnostics
                            _log(f"upstream event: {etype}")
                except websockets.ConnectionClosed as e:
                    _log(f"upstream closed: {e}")

            # When either side closes, cancel the other so we don't hang on
            # a half-open upstream during shutdown.
            t_c2u = asyncio.create_task(pump_client_to_upstream())
            t_u2c = asyncio.create_task(pump_upstream_to_client())
            done, pending = await asyncio.wait(
                {t_c2u, t_u2c}, return_when=asyncio.FIRST_COMPLETED
            )
            for t in pending:
                t.cancel()
            for t in pending:
                try:
                    await t
                except (asyncio.CancelledError, Exception):
                    pass
    except Exception as e:
        _log(f"PROXY EXCEPTION: {type(e).__name__}: {e}")
        try:
            await client_ws.send_json({"type": "error", "message": f"{type(e).__name__}: {e}"})
        except Exception:
            pass
    finally:
        try:
            await client_ws.close()
        except Exception:
            pass
        _log("session ended")
