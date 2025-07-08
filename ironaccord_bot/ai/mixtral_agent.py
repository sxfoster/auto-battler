import os
import requests

class MixtralAgent:
    """Simple client for querying a local Mixtral LLM endpoint."""

    def __init__(self, base_url: str | None = None) -> None:
        self.base_url = base_url or os.getenv("MIXTRAL_API_URL", "http://localhost:1234/v1")

    def query(self, prompt: str, max_tokens: int = 200) -> str:
        """Send a prompt to the Mixtral API and return the generated text."""
        url = self.base_url.rstrip("/") + "/chat/completions"
        payload = {
            "model": "mixtral",
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": max_tokens,
        }
        response = requests.post(url, json=payload, timeout=30)
        response.raise_for_status()
        data = response.json()
        return data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()

