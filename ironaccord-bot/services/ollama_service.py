import os
import httpx
import logging
import json

# --- Constants ---
OLLAMA_API_URL = os.getenv("OLLAMA_API_URL", "http://localhost:11434/api/generate")
NARRATOR_MODEL = "mixtral:8x7b-instruct-v0.1-q4_0"  # The creative storyteller
GM_MODEL = "phi3:mini"  # The fast, logical game master

class OllamaService:
    """Handle interactions with the local Ollama API."""

    def __init__(self) -> None:
        self.client = httpx.AsyncClient(timeout=300.0)

    async def _generate_response(self, model_name: str, prompt: str) -> str:
        payload = {"model": model_name, "prompt": prompt, "stream": False}
        try:
            logging.info(f"Sending request to Ollama model: {model_name}")
            response = await self.client.post(OLLAMA_API_URL, json=payload)
            if response.status_code >= 400:
                logging.error(
                    "Ollama API returned status %s for model %s", response.status_code, model_name
                )
                return f"Error: Ollama API responded with status code {response.status_code}."

            data = response.json()
            return data.get("response", "Error: 'response' key not found in Ollama output.")
        except httpx.RequestError as e:
            logging.error(f"Ollama API request error for model {model_name}: {e}")
            return f"Error: Could not connect to the Ollama API at {OLLAMA_API_URL}. Is Ollama running?"
        except json.JSONDecodeError:
            logging.error(f"Failed to decode JSON response from Ollama for model {model_name}.")
            return "Error: Received an invalid response from the Ollama server."
        except Exception as e:  # pragma: no cover - safety net
            logging.error(f"An unexpected error occurred while contacting Ollama for model {model_name}: {e}")
            return "An unexpected error occurred. Please check the bot logs."

    async def get_narrative(self, prompt: str) -> str:
        """Get a creative, narrative response."""
        return await self._generate_response(NARRATOR_MODEL, prompt)

    async def get_gm_response(self, prompt: str) -> str:
        """Get a fast, logical response."""
        return await self._generate_response(GM_MODEL, prompt)
