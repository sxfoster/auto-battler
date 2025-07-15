import pytest
from services import mission_engine_service as mes


@pytest.mark.asyncio
async def test_generate_opening(monkeypatch, tmp_path):
    (tmp_path / "demo.json").write_text('{"title": "Demo"}')
    monkeypatch.setattr(mes, "MISSIONS_PATH", tmp_path)

    async def fake_completion(self, prompt):
        return '{"text": "intro", "choices": ["a", "b"]}'

    agent = type('A', (), {'get_completion': fake_completion})()
    svc = mes.MissionEngineService(agent)
    result = await svc.generate_opening("Scout", "demo")

    assert result == {"text": "intro", "choices": ["a", "b"]}


@pytest.mark.asyncio
async def test_generate_opening_llm_error(monkeypatch, tmp_path):
    (tmp_path / "demo.json").write_text('{"title": "Demo"}')
    monkeypatch.setattr(mes, "MISSIONS_PATH", tmp_path)

    async def fake_completion(self, prompt):
        raise RuntimeError('fail')

    agent = type('A', (), {'get_completion': fake_completion})()
    svc = mes.MissionEngineService(agent)
    result = await svc.generate_opening("Scout", "demo")

    assert result is None


def test_load_template_missing(monkeypatch, tmp_path):
    monkeypatch.setattr(mes, "MISSIONS_PATH", tmp_path)
    svc = mes.MissionEngineService(agent=None)  # type: ignore[arg-type]
    assert svc.load_template("nope") is None
