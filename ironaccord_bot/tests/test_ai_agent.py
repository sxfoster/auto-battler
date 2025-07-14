import pytest

from ironaccord_bot.ai.ai_agent import AIAgent
from ironaccord_bot.services.ollama_service import OllamaService


@pytest.mark.asyncio
async def test_agent_delegates_to_service(monkeypatch):
    async def fake_get(prompt):
        return "result"

    agent = AIAgent()
    monkeypatch.setattr(agent.ollama_service, "get_narrative", fake_get)
    result = await agent.get_narrative("hi")
    assert result == "result"


def test_structured_scene_prompt_includes_context():
    agent = AIAgent()
    location = {"name": "Rust Market"}
    npc = {"name": "Edraz"}
    prompt = agent.get_structured_scene_prompt(location, npc)
    assert isinstance(prompt, str)
    assert location["name"] in prompt
    assert npc["name"] in prompt
