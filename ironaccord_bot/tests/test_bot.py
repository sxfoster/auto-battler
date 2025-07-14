import pytest

from ironaccord_bot.bot import IronAccordBot

class DummyService:
    pass

class DummyAgent:
    def __init__(self):
        self.ollama_service = DummyService()

class DummyRAG:
    pass


def test_bot_exposes_ollama_service(monkeypatch):
    monkeypatch.setattr('ironaccord_bot.bot.RAGService', lambda: DummyRAG())
    monkeypatch.setattr('ironaccord_bot.bot.AIAgent', DummyAgent)
    bot = IronAccordBot()
    assert bot.ollama_service is bot.ai_agent.ollama_service
