import os

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "sqlite:///kag_local.db"  # fallback for quick start
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
