from datetime import datetime

from pydantic import BaseModel, Field


class RecordingResponse(BaseModel):
    id: str
    filename: str
    duration_seconds: float
    sample_rate: int
    created_at: datetime
    waveform_base64: str
    spectrum_base64: str
    spectrogram_base64: str | None = None
    mel_spectrogram_base64: str | None = None
    waveform_data: list[dict] | None = None
    spectrum_data: list[dict] | None = None


class RecordingListItem(BaseModel):
    id: str
    filename: str
    duration_seconds: float
    sample_rate: int
    created_at: datetime
    waveform_base64: str
    spectrum_base64: str
    spectrogram_base64: str | None = None


class RecordingListResponse(BaseModel):
    recordings: list[RecordingListItem]
    total: int
