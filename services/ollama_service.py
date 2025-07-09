import os
import httpx


class OllamaService:
    """Asynchronous client for interacting with an Ollama API."""

    def __init__(self, base_url: str | None = None) -> None:
        self.base_url = base_url or os.getenv("OLLAMA_API_URL", "http://localhost:11434")
        self.client = httpx.AsyncClient()

    async def _request(self, endpoint: str, prompt: str) -> str:
        url = self.base_url.rstrip('/') + endpoint
        try:
            response = await self.client.post(url, json={"prompt": prompt})
            if response.status_code == 200:
                data = response.json()
                return data.get("response", "")
            return f"Error: API responded with status {response.status_code}"
        except httpx.ConnectError:
            return "Error: Could not connect to the Ollama API"
        except Exception as exc:
            return f"Error: {exc}"

    async def get_narrative(self, prompt: str) -> str:
        """Retrieve narrative text from the Ollama API."""
        return await self._request("/api/generate", prompt)

    async def get_gm_response(self, prompt: str) -> str:
        """Retrieve a GM confirmation/response from the Ollama API."""
        return await self._request("/api/gm", prompt)

    async def close(self) -> None:
        await self.client.aclose()
