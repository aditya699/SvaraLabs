from pydantic import BaseModel
from typing import Literal


class AudioChunk(BaseModel):
    type: Literal["audio"]
    data: str  # base64-encoded PCM16 little-endian mono @ 16 kHz


class Commit(BaseModel):
    type: Literal["commit"]


class DeltaMessage(BaseModel):
    type: Literal["delta"] = "delta"
    text: str


class FinalMessage(BaseModel):
    type: Literal["final"] = "final"
    text: str


class ErrorMessage(BaseModel):
    type: Literal["error"] = "error"
    message: str
