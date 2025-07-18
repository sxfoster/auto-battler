import logging
import json

import httpx
from ironaccord_bot.config import load_settings

# --- Default Settings ---
_DEFAULT_SETTINGS = load_settings()

logger = logging.getLogger(__name__)


class OllamaService:
    """Handle interactions with the local Ollama API."""

    def __init__(self) -> None:
        self.client = httpx.AsyncClient(timeout=300.0)
        cfg = load_settings()
        self.api_url = cfg.ollama_api_url
        self.narrator_model = cfg.narrator_model
        self.gm_model = cfg.gm_model

    async def _generate_response(self, model_name: str, prompt: str) -> str:
        payload = {"model": model_name, "prompt": prompt, "stream": False}
        try:
            logger.debug("OLLAMA_PAYLOAD: %s", json.dumps(payload))
            logger.info(f"Sending request to Ollama model: {model_name}")

            response = await self.client.post(self.api_url, json=payload)
            try:
                response.raise_for_status()
            except RuntimeError:
                # Raised when the response lacks a request (e.g. in tests)
                if response.status_code >= 400:
                    raise httpx.HTTPStatusError(
                        "Invalid status", request=None, response=response
                    )

            data = response.json()
            response_text = data.get(
                "response", "Error: 'response' key not found in Ollama output."
            )
            logger.info(f"Received response from {model_name}.")
            logger.debug("OLLAMA_RESPONSE: %s", response_text)
            return response_text

        except httpx.HTTPStatusError as e:
            logger.error(
                "Ollama API returned status %s for model %s. Response: %s",
                e.response.status_code,
                model_name,
                e.response.text,
                exc_info=True,
            )
            return f"Error: The language model service returned an error (HTTP {e.response.status_code})."
        except httpx.RequestError as e:
            logger.error(
                f"Ollama API request error for model {model_name}: {e}",
                exc_info=True,
            )
            return f"Error: Could not connect to the Ollama API at {self.api_url}. Is it running?"
        except json.JSONDecodeError:
            logger.error(
                f"Failed to decode JSON response from Ollama for model {model_name}.",
                exc_info=True,
            )
            return "Error: Received an invalid response from the language model server."
        except Exception as e:  # pragma: no cover - safety net
            logger.error(
                f"An unexpected error occurred while contacting Ollama: {e}",
                exc_info=True,
            )
            return "An unexpected error occurred. Please check the bot logs."

    async def get_narrative(self, prompt: str) -> str:
        """Get a creative, narrative response."""
        return await self._generate_response(self.narrator_model, prompt)

    async def get_gm_response(self, prompt: str) -> str:
        """Get a fast, logical response."""
        return await self._generate_response(self.gm_model, prompt)

    async def send_request(self, prompt: str, models: list[str]) -> str:
        """Send ``prompt`` to the first available model in ``models``."""
        for model in models:
            try:
                return await self._generate_response(model, prompt)
            except Exception as exc:  # pragma: no cover - fallback to next model
                logger.error("Model %s failed: %s", model, exc, exc_info=True)
                continue
        return ""

    async def stream_request(self, prompt: str, models: list[str]):
        """Stream the response for ``prompt`` from the first working model."""
        for model in models:
            payload = {"model": model, "prompt": prompt, "stream": True}
            try:
                logger.info("Streaming request to model %s", model)
                async with self.client.stream("POST", self.api_url, json=payload) as resp:
                    resp.raise_for_status()
                    async for line in resp.aiter_lines():
                        if not line:
                            continue
                        try:
                            data = json.loads(line)
                            chunk = data.get("response", "")
                            if chunk:
                                yield chunk
                        except json.JSONDecodeError:
                            continue
                return
            except Exception as exc:  # pragma: no cover - fallback
                logger.error("Streaming failed for %s: %s", model, exc, exc_info=True)
                continue
