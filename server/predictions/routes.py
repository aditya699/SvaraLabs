from fastapi import APIRouter, File, HTTPException, UploadFile

from server.predictions.queue import get_queue
from server.predictions.schemas import PredictionResponse
from server.predictions.utils import audio_to_mel_spectrogram

router = APIRouter()


@router.post("", response_model=PredictionResponse)
async def predict_command(file: UploadFile = File(...)):
    if not file.content_type or "audio" not in file.content_type:
        if not (file.filename and file.filename.endswith(".wav")):
            raise HTTPException(status_code=400, detail="Only audio files accepted")

    audio_bytes = await file.read()
    if len(audio_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty audio file")

    mel = audio_to_mel_spectrogram(audio_bytes)
    result = await get_queue().predict(mel)
    return PredictionResponse(**result)
