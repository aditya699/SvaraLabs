from motor.motor_asyncio import AsyncIOMotorClient
from server.core.config import settings

_client: AsyncIOMotorClient | None = None
_db = None


async def connect_db():
    global _client, _db
    _client = AsyncIOMotorClient(settings.MONGO_URI)
    _db = _client[settings.MONGO_DB_NAME]


async def close_db():
    global _client, _db
    if _client:
        _client.close()
        _client = None
        _db = None


def get_db():
    return _db
