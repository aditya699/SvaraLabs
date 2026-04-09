from datetime import datetime

from pydantic import BaseModel, Field


class RecordingResponse(BaseModel):
    id: str
    filename: str
    duration_seconds: float
    sample_rate: int
    created_at: datetime
    waveform_base64: str


class RecordingListItem(BaseModel):
    id: str
    filename: str
    duration_seconds: float
    sample_rate: int
    created_at: datetime
    waveform_base64: str


class RecordingListResponse(BaseModel):
    recordings: list[RecordingListItem]
    total: int
