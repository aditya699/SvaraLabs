import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Mic, Square, Copy, Trash2, AudioLines } from "lucide-react";
import { openSttSocket } from "../api/stt";

const TARGET_SAMPLE_RATE = 16000;

function floatTo16BitPCM(float32) {
  const out = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return out;
}

function downsample(buffer, inputRate, outputRate) {
  if (outputRate === inputRate) return buffer;
  const ratio = inputRate / outputRate;
  const newLength = Math.round(buffer.length / ratio);
  const result = new Float32Array(newLength);
  let offsetResult = 0;
  let offsetBuffer = 0;
  while (offsetResult < newLength) {
    const nextOffsetBuffer = Math.round((offsetResult + 1) * ratio);
    let accum = 0;
    let count = 0;
    for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
      accum += buffer[i];
      count++;
    }
    result[offsetResult] = count > 0 ? accum / count : 0;
    offsetResult++;
    offsetBuffer = nextOffsetBuffer;
  }
  return result;
}

function int16ToBase64(int16) {
  const bytes = new Uint8Array(int16.buffer);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(
      null,
      bytes.subarray(i, Math.min(i + chunk, bytes.length))
    );
  }
  return btoa(binary);
}

export default function LiveTranscriber() {
  const [state, setState] = useState("idle"); // idle | recording | error
  const [partial, setPartial] = useState("");
  const [finalText, setFinalText] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const ctxRef = useRef(null);
  const sourceRef = useRef(null);
  const processorRef = useRef(null);
  const streamRef = useRef(null);
  const sockRef = useRef(null);

  useEffect(() => () => stop(), []); // cleanup on unmount

  async function start() {
    setErrorMsg("");
    setPartial("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      ctxRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      sourceRef.current = source;

      const processor = ctx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      const sock = openSttSocket({
        onDelta: (text) => setPartial((prev) => prev + text),
        onFinal: (text) => {
          setFinalText((prev) => (prev ? prev + " " + text : text));
          setPartial("");
        },
        onError: (err) => {
          console.error("STT error:", err);
          setErrorMsg(err?.message || "Connection error");
          setState("error");
        },
      });
      sockRef.current = sock;

      processor.onaudioprocess = (e) => {
        const input = e.inputBuffer.getChannelData(0);
        const down = downsample(input, ctx.sampleRate, TARGET_SAMPLE_RATE);
        const pcm = floatTo16BitPCM(down);
        sock.sendAudio(int16ToBase64(pcm));
      };

      source.connect(processor);
      processor.connect(ctx.destination);
      setState("recording");
    } catch (err) {
      console.error("Failed to start STT:", err);
      setErrorMsg(err?.message || "Could not access microphone");
      setState("error");
    }
  }

  function stop() {
    // Stop the audio pipeline so no more chunks are queued, but KEEP the WS
    // open long enough for OpenAI to flush a final transcript after commit.
    try {
      processorRef.current?.disconnect();
      sourceRef.current?.disconnect();
      if (ctxRef.current && ctxRef.current.state !== "closed") {
        ctxRef.current.close();
      }
      streamRef.current?.getTracks().forEach((t) => t.stop());
    } catch (e) {
      // ignore
    }
    processorRef.current = null;
    sourceRef.current = null;
    ctxRef.current = null;
    streamRef.current = null;

    const sock = sockRef.current;
    sockRef.current = null;
    if (sock) {
      // server_vad has already been committing utterances as the user pauses.
      // Keep the WS open ~5s so any in-flight final transcript can arrive
      // (user may hit Stop mid-utterance before VAD fires speech_stopped).
      setTimeout(() => {
        try { sock.close(); } catch { /* noop */ }
      }, 5000);
    }
    setState("idle");
  }

  function clear() {
    setFinalText("");
    setPartial("");
    setErrorMsg("");
  }

  function copy() {
    const text = (finalText + (partial ? " " + partial : "")).trim();
    if (text) navigator.clipboard?.writeText(text);
  }

  const recording = state === "recording";

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
            <AudioLines className="w-5 h-5 text-gold" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-serif text-brown">Live Transcription</h2>
            <p className="text-sm text-brown-muted">
              Streams audio to OpenAI Realtime (gpt-4o-transcribe) via a server proxy.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {!recording ? (
            <button onClick={start} className="btn-primary inline-flex items-center gap-2">
              <Mic className="w-4 h-4" /> Start speaking
            </button>
          ) : (
            <button onClick={stop} className="btn-primary inline-flex items-center gap-2">
              <Square className="w-4 h-4" /> Stop
            </button>
          )}
          <button onClick={copy} className="btn-secondary inline-flex items-center gap-2">
            <Copy className="w-4 h-4" /> Copy
          </button>
          <button onClick={clear} className="btn-secondary inline-flex items-center gap-2">
            <Trash2 className="w-4 h-4" /> Clear
          </button>
          {recording && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-gold/15 text-brown-accent">
              <motion.span
                className="w-1.5 h-1.5 rounded-full bg-gold"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
              Live
            </span>
          )}
        </div>

        {errorMsg && (
          <p className="mt-3 text-sm text-red-600">{errorMsg}</p>
        )}
      </div>

      <div className="card min-h-[180px]">
        <h3 className="text-sm font-medium text-brown-muted mb-2">Transcript</h3>
        <p className="text-brown leading-relaxed whitespace-pre-wrap">
          {finalText}
          {partial && (
            <span className="italic text-brown-muted">
              {finalText ? " " : ""}
              {partial}
            </span>
          )}
          {!finalText && !partial && (
            <span className="text-brown-muted">Press start and speak...</span>
          )}
        </p>
      </div>
    </div>
  );
}
