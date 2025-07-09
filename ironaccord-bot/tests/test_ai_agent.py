import pytest

from ironaccord_bot.ai.ai_agent import AIAgent


class DummyService:
    def __init__(self):
        self.calls = []

    async def get_narrative(self, prompt: str) -> str:
        self.calls.append(("narrative", prompt))
        return "story"

    async def get_gm_response(self, prompt: str) -> str:
        self.calls.append(("gm", prompt))
        return "gm_reply"


@pytest.mark.asyncio
async def test_get_narrative_prepends_world(tmp_path):
    world_file = tmp_path / "world.md"
    world_file.write_text("lore")
    agent = AIAgent(world_bible_path=str(world_file))
    dummy = DummyService()
    agent.ollama_service = dummy

    result = await agent.get_narrative("Prompt")

    assert result == "story"
    assert dummy.calls[0][0] == "narrative"
    assert dummy.calls[0][1].startswith("WORLD CONTEXT:\nlore\n\nSTORY PROMPT:\nPrompt")


@pytest.mark.asyncio
async def test_get_gm_response_passes_through(monkeypatch):
    agent = AIAgent(world_bible_path="missing_file")
    dummy = DummyService()
    agent.ollama_service = dummy

    result = await agent.get_gm_response("hello")

    assert result == "gm_reply"
    assert dummy.calls == [("gm", "hello")]
