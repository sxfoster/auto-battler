import pytest
import json
from services import mission_engine_service as mes


@pytest.mark.asyncio
async def test_generate_opening(monkeypatch, tmp_path):
    (tmp_path / "demo.json").write_text('{"title": "Demo"}')
    monkeypatch.setattr(mes, "MISSIONS_PATH", tmp_path)

    async def fake_narrative(self, prompt):
        return "A scene\n1. A\n2. B"

    async def fake_gm(self, prompt):
        return json.dumps({
            "outcome_text": "intro",
            "choices": [
                {"id": 1, "text": "a"},
                {"id": 2, "text": "b"}
            ],
            "status_effect": None
        })

    agent = type('A', (), {'get_narrative': fake_narrative, 'get_gm_response': fake_gm})()
    svc = mes.MissionEngineService(agent)
    result = await svc.generate_opening("Scout", "demo")

    assert result == {
        "text": "intro",
        "choices": [
            {"id": 1, "text": "a"},
            {"id": 2, "text": "b"}
        ],
        "status_effect": None
    }


@pytest.mark.asyncio
async def test_generate_opening_llm_error(monkeypatch, tmp_path):
    (tmp_path / "demo.json").write_text('{"title": "Demo"}')
    monkeypatch.setattr(mes, "MISSIONS_PATH", tmp_path)

    async def fake_narrative(self, prompt):
        raise RuntimeError('fail')

    agent = type('A', (), {'get_narrative': fake_narrative})()
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

    narratives = iter([
        "Start scene\n1. A\n2. B",
        "Next scene\n1. C\n2. D",
        "Final scene"
    ])

    gm_responses = iter([
        json.dumps({"outcome_text": "start", "choices": [{"id": 1, "text": "a"}, {"id": 2, "text": "b"}]}),
        json.dumps({"outcome_text": "next", "choices": [{"id": 1, "text": "c"}, {"id": 2, "text": "d"}]}),
        json.dumps({"outcome_text": "done", "status": "complete"})
    ])

    async def fake_narrative(self, prompt):
        return next(narratives)

    async def fake_gm(self, prompt):
        return next(gm_responses)

    agent = type('A', (), {'get_narrative': fake_narrative, 'get_gm_response': fake_gm})()
    svc = mes.MissionEngineService(agent)

    async def fake_mech(self, user_id, choice):
        return {"outcome_summary": choice}

    monkeypatch.setattr(mes.MissionEngineService, "_resolve_action_mechanics", fake_mech)

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

    narratives = iter([
        "Scene start\n1. A\n2. B",
        "Messy narrative"
    ])

    gm_responses = iter([
        json.dumps({"outcome_text": "start", "choices": [{"id": 1, "text": "a"}, {"id": 2, "text": "b"}]}),
        'Before JSON {junk} ```json\n{"outcome_text": "next", "choices": [{"id": 1, "text": "c"}, {"id": 2, "text": "d"}]}\n``` After'
    ])

    async def fake_narrative(self, prompt):
        return next(narratives)

    async def fake_gm(self, prompt):
        return next(gm_responses)

    agent = type('A', (), {'get_narrative': fake_narrative, 'get_gm_response': fake_gm})()
    svc = mes.MissionEngineService(agent)

    async def fake_mech(self, user_id, choice):
        return {"outcome_summary": choice}

    monkeypatch.setattr(mes.MissionEngineService, "_resolve_action_mechanics", fake_mech)


    opening = await svc.start_mission(1, "Scout", "demo")
    assert opening["text"] == "start"

    nxt = await svc.advance_mission(1, "a")
    assert nxt == {
        "text": "next",
        "choices": [
            {"id": 1, "text": "c"},
            {"id": 2, "text": "d"}
        ]
    }
