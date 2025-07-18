import logging
import json

import httpx
from ironaccord_bot.config import load_settings

# --- Default Settings ---
_DEFAULT_SETTINGS = load_settings()

logger = logging.getLogger(__name__)


class OllamaService:
    """Wrapper around the local Ollama API used by the bot.

    The service exposes convenience helpers for the two models used by the
    application – a slower "narrator" model for descriptive text and a faster
    "game master" model for mechanical resolution.  All requests are dispatched
    through a shared :class:`httpx.AsyncClient` instance.
    """

    def __init__(self) -> None:
        """Initialize the HTTP client and model names from configuration."""
        self.client = httpx.AsyncClient(timeout=300.0)
        cfg = load_settings()
        self.api_url = cfg.ollama_api_url
        self.narrator_model = cfg.narrator_model
        self.gm_model = cfg.gm_model

    async def _generate_response(self, model_name: str, prompt: str) -> str:
        """Send ``prompt`` to ``model_name`` and return the text response.

        Args:
            model_name: Identifier of the Ollama model to query.
            prompt: Prompt string to send to the model.

        Returns:
            The plain text response returned by the model, or an error message
            if the call fails.
        """
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
        """Generate narrative prose from the storyteller model.

        Args:
            prompt: The full prompt to send to the narrator model.

        Returns:
            The generated narrative text or an error string.
        """
        return await self._generate_response(self.narrator_model, prompt)

    async def get_gm_response(self, prompt: str) -> str:
        """Query the fast rules-focused model used for mechanics.

        Args:
            prompt: Prompt describing the rules question.

        Returns:
            The text returned by the game master model or an error string.
        """
        return await self._generate_response(self.gm_model, prompt)

    async def send_request(self, prompt: str, models: list[str]) -> str:
        """Send ``prompt`` to the first working model in ``models``.

        Args:
            prompt: Prompt text to deliver to the model.
            models: Ordered list of model names to try.

        Returns:
            The text response from the first model that succeeds, or an empty
            string if all models fail.
        """
        for model in models:
            try:
                return await self._generate_response(model, prompt)
            except Exception as exc:  # pragma: no cover - fallback to next model
                logger.error("Model %s failed: %s", model, exc, exc_info=True)
                continue
        return ""

    async def stream_request(self, prompt: str, models: list[str]):
        """Yield streaming chunks for ``prompt`` using the first working model.

        Args:
            prompt: Prompt text to deliver to the model.
            models: Ordered list of models to attempt.

        Yields:
            Individual text chunks from the streaming API as they arrive.
        """
        for model in models:
            payload = {"model": model, "prompt": prompt, "stream": True}
            try:
                logger.info("Streaming request to model %s", model)
                async with self.client.stream(
                    "POST", self.api_url, json=payload
                ) as resp:
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
