import discord

class OpeningSceneView(discord.ui.View):
    """Display the opening scene choices returned by the Lore Weaver."""

    def __init__(self, choices: list[str]):
        super().__init__(timeout=300)
        for idx, choice in enumerate(choices):
            self.add_item(self.ChoiceButton(choice, idx))

    class ChoiceButton(discord.ui.Button):
        def __init__(self, text: str, idx: int):
            super().__init__(
                label=text,
                style=discord.ButtonStyle.primary,
                custom_id=f"opening_choice_{idx}",
            )
            self.choice_text = text

        async def callback(self, interaction: discord.Interaction) -> None:
            view: "OpeningSceneView" = self.view
            for item in view.children:
                item.disabled = True
            await interaction.response.edit_message(view=view)
            await interaction.followup.send(
                f"You chose: {self.choice_text}", ephemeral=True
            )
