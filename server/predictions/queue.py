import asyncio
from dataclasses import dataclass

import torch

from server.predictions.model import AudioCNN, LABELS


@dataclass
class PredictionRequest:
    mel_tensor: torch.Tensor
    future: asyncio.Future


class BatchingQueue:
    def __init__(self, model: AudioCNN, batch_wait_ms: float = 10.0):
        self._queue: asyncio.Queue[PredictionRequest] = asyncio.Queue()
        self._model = model
        self._batch_wait = batch_wait_ms / 1000.0
        self._task: asyncio.Task | None = None

    async def start(self):
        self._task = asyncio.create_task(self._worker())

    async def stop(self):
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass

    async def predict(self, mel: torch.Tensor) -> dict:
        loop = asyncio.get_event_loop()
        future = loop.create_future()
        await self._queue.put(PredictionRequest(mel_tensor=mel, future=future))
        return await future

    async def _worker(self):
        loop = asyncio.get_event_loop()
        while True:
            first = await self._queue.get()
            batch = [first]

            # collect requests arriving within the 10ms window
            await asyncio.sleep(self._batch_wait)
            while not self._queue.empty():
                try:
                    batch.append(self._queue.get_nowait())
                except asyncio.QueueEmpty:
                    break

            # stack into [N, 1, 64, 101]
            tensors = torch.stack([req.mel_tensor for req in batch])

            # run inference off the event loop
            with torch.no_grad():
                outputs = await loop.run_in_executor(None, self._model, tensors)

            probs = torch.softmax(outputs, dim=1)
            for i, req in enumerate(batch):
                confidence, idx = probs[i].max(dim=0)
                req.future.set_result({
                    "label": LABELS[idx.item()],
                    "confidence": round(confidence.item(), 4),
                })


_queue: BatchingQueue | None = None


def init_queue(model: AudioCNN):
    global _queue
    _queue = BatchingQueue(model)


def get_queue() -> BatchingQueue:
    return _queue
