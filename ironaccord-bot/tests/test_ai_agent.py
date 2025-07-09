import pytest

from ironaccord_bot.ai.ai_agent import AIAgent
from ironaccord_bot.services.ollama_service import OllamaService


@pytest.mark.asyncio
async def test_agent_delegates_to_service(monkeypatch):
    async def fake_get(prompt):
        return "result"

    service = OllamaService()
    monkeypatch.setattr(service, "get_narrative", fake_get)

    agent = AIAgent(service=service)
    result = await agent.get_narrative("hi")
    assert result == "result"
