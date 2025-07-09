import os
import logging
import asyncio
import requests

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - [LLM_TRACE] - %(message)s",
)

class OllamaService:
    """Client for interacting with local Ollama models."""

    def __init__(self, base_url: str | None = None, narrator_model: str = "narrator", gm_model: str = "gm") -> None:
        self.base_url = base_url or os.getenv("OLLAMA_API_URL", "http://localhost:11434/v1")
        self.narrator_model = narrator_model
        self.gm_model = gm_model

    async def _post(self, model: str, prompt: str) -> str:
        url = self.base_url.rstrip("/") + "/chat/completions"
        payload = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "stream": False,
        }
        logging.info("Sending prompt to %s model: \"%s...\"", model, prompt[:80])
        response = await asyncio.to_thread(requests.post, url, json=payload, timeout=30)
        response.raise_for_status()
        data = response.json()
        text = data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
        logging.info("Response from %s model: \"%s...\"", model, text[:80])
        return text

    async def get_narrative(self, prompt: str) -> str:
        """Generate narrative text."""
        return await self._post(self.narrator_model, prompt)

    async def get_gm_response(self, prompt: str) -> str:
        """Generate GM-style text."""
        return await self._post(self.gm_model, prompt)
