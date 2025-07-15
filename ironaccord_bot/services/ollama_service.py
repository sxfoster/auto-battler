import os
import httpx
import logging
import json

# --- Constants ---
OLLAMA_API_URL = os.getenv("OLLAMA_API_URL", "http://localhost:11434/api/generate")
NARRATOR_MODEL = os.getenv(
    "OLLAMA_NARRATOR_MODEL",
    "mixtral:8x7b-instruct-v0.1-q4_0",
)  # The creative storyteller
GM_MODEL = os.getenv("OLLAMA_GM_MODEL", "phi3:mini")  # The fast, logical game master

logger = logging.getLogger(__name__)


class OllamaService:
    """Handle interactions with the local Ollama API."""

    def __init__(self) -> None:
        self.client = httpx.AsyncClient(timeout=300.0)

    async def _generate_response(self, model_name: str, prompt: str) -> str:
        payload = {"model": model_name, "prompt": prompt, "stream": False}
        try:
            logger.debug("OLLAMA_PAYLOAD: %s", json.dumps(payload))
            logger.info(f"Sending request to Ollama model: {model_name}")

            response = await self.client.post(OLLAMA_API_URL, json=payload)
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
            return f"Error: Could not connect to the Ollama API at {OLLAMA_API_URL}. Is it running?"
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
        return await self._generate_response(NARRATOR_MODEL, prompt)

    async def get_gm_response(self, prompt: str) -> str:
        """Get a fast, logical response."""
        return await self._generate_response(GM_MODEL, prompt)
