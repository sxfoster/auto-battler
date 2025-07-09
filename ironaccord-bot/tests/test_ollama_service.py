import pytest
import httpx
from unittest.mock import AsyncMock, patch

from services.ollama_service import OllamaService

# Mark all tests in this file as asyncio
pytestmark = pytest.mark.asyncio

@pytest.fixture
def ollama_service():
    """Pytest fixture to create an instance of OllamaService for each test."""
    return OllamaService()

async def test_get_narrative_success(ollama_service: OllamaService):
    """
    Tests a successful call to the get_narrative method, ensuring it
    correctly processes a valid API response.
    """
    mock_prompt = "Tell me a story."
    mock_response_text = "Once upon a time..."
    
    # Mock the JSON response from the Ollama API
    mock_api_response = {"response": mock_response_text}

    # Patch the post method of the httpx.AsyncClient
    with patch.object(ollama_service.client, 'post', new_callable=AsyncMock) as mock_post:
        # Configure the mock to return a successful response object
        mock_response = httpx.Response(200, json=mock_api_response)
        mock_post.return_value = mock_response

        # Call the method we are testing
        result = await ollama_service.get_narrative(mock_prompt)

        # Assertions
        mock_post.assert_called_once()  # Ensure the post method was called
        assert result == mock_response_text # Ensure we got the correct text back

async def test_get_gm_response_success(ollama_service: OllamaService):
    """
    Tests a successful call to the get_gm_response method.
    """
    mock_prompt = "Confirm choice."
    mock_response_text = "Choice confirmed."
    mock_api_response = {"response": mock_response_text}

    with patch.object(ollama_service.client, 'post', new_callable=AsyncMock) as mock_post:
        mock_response = httpx.Response(200, json=mock_api_response)
        mock_post.return_value = mock_response

        result = await ollama_service.get_gm_response(mock_prompt)

        mock_post.assert_called_once()
        assert result == mock_response_text

async def test_api_connection_error(ollama_service: OllamaService):
    """
    Tests how the service handles a connection error when trying to reach Ollama.
    """
    mock_prompt = "This will fail."

    with patch.object(ollama_service.client, 'post', new_callable=AsyncMock) as mock_post:
        # Configure the mock to raise a connection error
        mock_post.side_effect = httpx.ConnectError("Connection refused")

        result = await ollama_service.get_narrative(mock_prompt)

        # Assert that the method returns a user-friendly error message
        assert "Error: Could not connect to the Ollama API" in result
