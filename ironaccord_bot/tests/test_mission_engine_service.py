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


@pytest.mark.asyncio
async def test_start_and_advance(monkeypatch, tmp_path):
    (tmp_path / "demo.json").write_text('{"title": "Demo"}')
    monkeypatch.setattr(mes, "MISSIONS_PATH", tmp_path)

    responses = iter([
        '{"text": "start", "choices": ["a", "b"]}',
        '{"text": "next", "choices": ["c", "d"]}',
        '{"text": "done", "status": "complete"}',
    ])

    async def fake_completion(self, prompt):
        return next(responses)

    agent = type('A', (), {'get_completion': fake_completion})()
    svc = mes.MissionEngineService(agent)
    opening = await svc.start_mission(1, "Scout", "demo")
    assert opening["text"] == "start"

    nxt = await svc.advance_mission(1, "a")
    assert nxt["text"] == "next"
    done = await svc.advance_mission(1, "c")
    assert done["status"] == "complete"


@pytest.mark.asyncio
async def test_advance_handles_extra_text(monkeypatch, tmp_path):
    (tmp_path / "demo.json").write_text('{"title": "Demo"}')
    monkeypatch.setattr(mes, "MISSIONS_PATH", tmp_path)

    responses = iter([
        '{"text": "start", "choices": ["a", "b"]}',
        'Before JSON {junk} ```json\n{"text": "next", "choices": ["c", "d"]}\n``` After',
    ])

    async def fake_completion(self, prompt):
        return next(responses)

    agent = type('A', (), {'get_completion': fake_completion})()
    svc = mes.MissionEngineService(agent)

    opening = await svc.start_mission(1, "Scout", "demo")
    assert opening["text"] == "start"

    nxt = await svc.advance_mission(1, "a")
    assert nxt == {"text": "next", "choices": ["c", "d"]}
