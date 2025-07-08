import logging
import pytest
import requests

from ironaccord_bot.ai.mixtral_agent import MixtralAgent


class DummyResponse:
    def __init__(self, text):
        self.text = text

    def raise_for_status(self):
        pass

    def json(self):
        return {"choices": [{"message": {"content": self.text}}]}


def test_query_logs_success(monkeypatch, caplog):
    agent = MixtralAgent(base_url="http://test")

    def fake_post(url, json, timeout):
        return DummyResponse("hello world")

    monkeypatch.setattr(requests, "post", fake_post)
    with caplog.at_level(logging.INFO):
        result = agent.query("prompt text", context="test_context")

    assert result == "hello world"
    messages = [r.message for r in caplog.records]
    assert any("Sending prompt" in m for m in messages)
    assert any("SUCCESS" in m for m in messages)


def test_query_logs_failure(monkeypatch, caplog):
    agent = MixtralAgent(base_url="http://test")

    def fake_post(url, json, timeout):
        raise requests.exceptions.Timeout("boom")

    monkeypatch.setattr(requests, "post", fake_post)
    with caplog.at_level(logging.INFO), pytest.raises(requests.exceptions.Timeout):
        agent.query("fail", context="bad")

    messages = [r.message for r in caplog.records]
    assert any("FAILURE" in m for m in messages)
