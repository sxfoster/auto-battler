import discord
from ..services.mission_engine_service import MissionEngineService

class MissionView(discord.ui.View):
    """Simple view for presenting a mission scene with multiple choices."""

    def __init__(self, service: MissionEngineService, user_id: int, narrative_text: str, choices: list[str]):
        super().__init__(timeout=300)
        self.service = service
        self.user_id = user_id
        self.narrative_text = narrative_text
        self.choices = choices
        self.selected_choice: str | None = None
        self._populate_buttons()

    def _populate_buttons(self) -> None:
        self.clear_items()
        for idx, choice in enumerate(self.choices):
            self.add_item(self.ChoiceButton(choice, idx))

    def update_scene(self, narrative_text: str, choices: list[str]) -> None:
        """Reuse the view for a new scene by updating text and buttons."""
        self.narrative_text = narrative_text
        self.choices = choices
        self.selected_choice = None
        self._populate_buttons()

    class ChoiceButton(discord.ui.Button):
        def __init__(self, label: str, idx: int):
            super().__init__(label=label, style=discord.ButtonStyle.primary)
            self.label_text = label
            self.idx = idx

        async def callback(self, interaction: discord.Interaction) -> None:
            view: "MissionView" = self.view  # type: ignore[assignment]
            for item in view.children:
                item.disabled = True
            await interaction.response.edit_message(view=view)

            result = await view.service.advance_mission(view.user_id, self.label_text)
            if not result:
                await interaction.followup.send("An error occurred.", ephemeral=True)
                view.stop()
                return

            if result.get("status"):
                await interaction.edit_original_response(content=result.get("text", ""), view=None)
                view.stop()
            else:
                view.update_scene(result.get("text", ""), result.get("choices", []))
                await interaction.edit_original_response(content=result.get("text", ""), view=view)
