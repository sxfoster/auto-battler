from __future__ import annotations
import os
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import yaml


@dataclass
class Settings:
    """Application configuration settings."""

    ollama_api_url: str = "http://localhost:11434/api/generate"
    narrator_model: str = "mixtral:8x7b-instruct-v0.1-q4_0"
    gm_model: str = "phi3:mini"


def _load_yaml_config(path: Path) -> dict[str, Any]:
    if not path.exists():
        return {}
    try:
        with path.open("r", encoding="utf-8") as f:
            return yaml.safe_load(f) or {}
    except Exception:
        return {}


def load_settings() -> Settings:
    """Load settings from ``config.yaml`` and environment variables."""

    base = Path(__file__).resolve().parent
    data = _load_yaml_config(base / "config.yaml")

    return Settings(
        ollama_api_url=os.getenv(
            "OLLAMA_API_URL", data.get("ollama_api_url", Settings.ollama_api_url)
        ),
        narrator_model=os.getenv(
            "OLLAMA_NARRATOR_MODEL",
            data.get("narrator_model", Settings.narrator_model),
        ),
        gm_model=os.getenv(
            "OLLAMA_GM_MODEL", data.get("gm_model", Settings.gm_model)
        ),
    )


settings = load_settings()
