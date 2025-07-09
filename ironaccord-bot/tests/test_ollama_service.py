import pytest
import httpx

from ironaccord_bot.services.ollama_service import OllamaService


class DummyResponse:
    def __init__(self, data):
        self._data = data

    def raise_for_status(self):
        pass

    def json(self):
        return self._data


@pytest.mark.asyncio
async def test_get_narrative_success(monkeypatch):
    service = OllamaService()

    async def fake_post(url, json):
        return DummyResponse({"response": "hello"})

    monkeypatch.setattr(service.client, "post", fake_post)

    result = await service.get_narrative("prompt")
    assert result == "hello"


@pytest.mark.asyncio
async def test_get_narrative_request_error(monkeypatch):
    service = OllamaService()

    async def fake_post(url, json):
        raise httpx.RequestError("boom")

    monkeypatch.setattr(service.client, "post", fake_post)

    result = await service.get_narrative("prompt")
    assert result.startswith("Error")
