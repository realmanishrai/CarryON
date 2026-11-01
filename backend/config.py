from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional
from pathlib import Path
from dotenv import load_dotenv
import os

# Explicitly load .env from project root or backend folder with override=True
# so that local project configuration takes precedence over conflicting ambient OS variables
root_env = Path(__file__).resolve().parent.parent / ".env"
backend_env = Path(__file__).resolve().parent / ".env"

if root_env.exists():
    load_dotenv(dotenv_path=root_env, override=True)
elif backend_env.exists():
    load_dotenv(dotenv_path=backend_env, override=True)

class Settings(BaseSettings):
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4o-mini"
    DATABASE_URL: str = "sqlite:///./carryon.db"
    CORS_ORIGINS: List[str] = ["*"]
    HOST: str = "127.0.0.1"
    PORT: int = 8000

    model_config = SettingsConfigDict(
        env_file=str(root_env) if root_env.exists() else ".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

