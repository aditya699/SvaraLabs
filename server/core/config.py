from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APPNAME: str = "svaralabs"
    MONGO_URI: str
    MONGO_DB_NAME: str = "svaralabs"
    MODEL_PATH: str = "DL/Day1/audio_cnn.pth"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
