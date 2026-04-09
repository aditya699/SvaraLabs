from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, File, UploadFile, HTTPException, Query

from server.db.mongo import get_db
from server.recordings.schemas import RecordingResponse, RecordingListResponse, RecordingListItem
from server.recordings.utils import decode_audio, generate_waveform_png, png_to_base64

router = APIRouter()

COLLECTION = "recordings"


@router.post("", response_model=RecordingResponse)
async def create_recording(file: UploadFile = File(...)):
    if not file.content_type or "audio" not in file.content_type:
        if not (file.filename and file.filename.endswith(".wav")):
            raise HTTPException(status_code=400, detail="Only audio files are accepted")

    audio_bytes = await file.read()
    if len(audio_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty audio file")

    sample_rate, data = decode_audio(audio_bytes)
    duration = len(data) / sample_rate

    waveform_png = generate_waveform_png(data, sample_rate)
    waveform_b64 = png_to_base64(waveform_png)

    doc = {
        "filename": file.filename or "recording.wav",
        "duration_seconds": round(duration, 2),
        "sample_rate": sample_rate,
        "waveform_base64": waveform_b64,
        "created_at": datetime.now(timezone.utc),
    }

    db = get_db()
    result = await db[COLLECTION].insert_one(doc)

    return RecordingResponse(
        id=str(result.inserted_id),
        filename=doc["filename"],
        duration_seconds=doc["duration_seconds"],
        sample_rate=doc["sample_rate"],
        created_at=doc["created_at"],
        waveform_base64=doc["waveform_base64"],
    )


@router.get("", response_model=RecordingListResponse)
async def list_recordings(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    db = get_db()
    total = await db[COLLECTION].count_documents({})
    cursor = db[COLLECTION].find({}).sort("created_at", -1).skip(skip).limit(limit)
    recordings = []
    async for doc in cursor:
        recordings.append(
            RecordingListItem(
                id=str(doc["_id"]),
                filename=doc["filename"],
                duration_seconds=doc["duration_seconds"],
                sample_rate=doc["sample_rate"],
                created_at=doc["created_at"],
                waveform_base64=doc["waveform_base64"],
            )
        )
    return RecordingListResponse(recordings=recordings, total=total)


@router.get("/{recording_id}", response_model=RecordingResponse)
async def get_recording(recording_id: str):
    db = get_db()
    try:
        oid = ObjectId(recording_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid recording ID")

    doc = await db[COLLECTION].find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=404, detail="Recording not found")

    return RecordingResponse(
        id=str(doc["_id"]),
        filename=doc["filename"],
        duration_seconds=doc["duration_seconds"],
        sample_rate=doc["sample_rate"],
        created_at=doc["created_at"],
        waveform_base64=doc["waveform_base64"],
    )


@router.delete("/{recording_id}")
async def delete_recording(recording_id: str):
    db = get_db()
    try:
        oid = ObjectId(recording_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid recording ID")

    result = await db[COLLECTION].delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Recording not found")

    return {"detail": "Recording deleted"}
