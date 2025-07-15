import discord

class MissionView(discord.ui.View):
    """Simple view for presenting a mission scene with multiple choices."""

    def __init__(self, narrative_text: str, choices: list[str]):
        super().__init__(timeout=300)
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
            view.selected_choice = self.label_text
            for item in view.children:
                item.disabled = True
            await interaction.response.edit_message(
                content=f"You chose: {self.label_text}", view=view
            )
            view.stop()
