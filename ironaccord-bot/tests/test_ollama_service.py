import pytest
import httpx
from unittest.mock import AsyncMock, patch

from services.ollama_service import OllamaService

pytestmark = pytest.mark.asyncio


@pytest.fixture
def ollama_service():
    return OllamaService()


async def test_get_narrative_success(ollama_service: OllamaService):
    mock_prompt = "Tell me a story."
    mock_response_text = "Once upon a time..."
    mock_api_response = {"response": mock_response_text}

    with patch.object(ollama_service.client, "post", new_callable=AsyncMock) as mock_post:
        mock_post.return_value = httpx.Response(200, json=mock_api_response)

        result = await ollama_service.get_narrative(mock_prompt)

        mock_post.assert_called_once()
        assert result == mock_response_text


async def test_get_gm_response_success(ollama_service: OllamaService):
    mock_prompt = "Confirm choice."
    mock_response_text = "Choice confirmed."
    mock_api_response = {"response": mock_response_text}

    with patch.object(ollama_service.client, "post", new_callable=AsyncMock) as mock_post:
        mock_post.return_value = httpx.Response(200, json=mock_api_response)

        result = await ollama_service.get_gm_response(mock_prompt)

        mock_post.assert_called_once()
        assert result == mock_response_text


async def test_api_connection_error(ollama_service: OllamaService):
    mock_prompt = "This will fail."

    with patch.object(ollama_service.client, "post", new_callable=AsyncMock) as mock_post:
        mock_post.side_effect = httpx.ConnectError("Connection refused")

        result = await ollama_service.get_narrative(mock_prompt)

        assert "Error: Could not connect to the Ollama API" in result
