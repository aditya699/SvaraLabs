from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from server.core.config import settings
from server.db.mongo import connect_db, close_db
from server.predictions.model import load_model, get_model
from server.predictions.queue import init_queue, get_queue
from server.predictions.routes import router as predictions_router
from server.recordings.routes import router as recordings_router
from server.stt.routes import router as stt_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    load_model(settings.MODEL_PATH)
    init_queue(get_model())
    await get_queue().start()
    yield
    await get_queue().stop()
    await close_db()


app = FastAPI(title="Svara Labs", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(recordings_router, prefix="/api/v1/recordings", tags=["recordings"])
app.include_router(predictions_router, prefix="/api/v1/predictions", tags=["predictions"])
app.include_router(stt_router, prefix="/api/v1/stt", tags=["stt"])


@app.get("/health")
async def health():
    return {"status": "ok"}
