from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APPNAME: str = "svaralabs"
    MONGO_URI: str
    MONGO_DB_NAME: str = "svaralabs"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
