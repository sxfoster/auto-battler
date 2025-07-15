import pytest

discord = pytest.importorskip("discord")

from ironaccord_bot.views.mission_view import MissionView


class DummyResponse:
    def __init__(self):
        self.kwargs = None

    async def edit_message(self, **kwargs):
        self.kwargs = kwargs


class DummyInteraction:
    def __init__(self):
        self.response = DummyResponse()


@pytest.mark.asyncio
async def test_choice_disables_buttons_and_records_selection():
    view = MissionView("scene", ["A", "B"])
    interaction = DummyInteraction()
    button = view.children[0]
    await button.callback(interaction)

    assert view.selected_choice == "A"
    assert all(child.disabled for child in view.children)
    assert interaction.response.kwargs["content"] == "You chose: A"


@pytest.mark.asyncio
async def test_update_scene_repopulates_buttons():
    view = MissionView("one", ["A", "B"])
    view.update_scene("two", ["X"])
    assert view.narrative_text == "two"
    assert view.choices == ["X"]
    assert len(view.children) == 1
