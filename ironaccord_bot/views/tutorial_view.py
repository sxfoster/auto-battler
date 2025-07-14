import discord
import requests

from ai.ai_agent import AIAgent
from utils.embed import simple
from models import database as db


class NameInputModal(discord.ui.Modal):
    """Modal for entering a custom character name."""

    name = discord.ui.TextInput(label="Character Name", max_length=32)

    def __init__(self, view: "TutorialView") -> None:
        super().__init__(title="Choose Your Name")
        self.view = view

    async def on_submit(self, interaction: discord.Interaction) -> None:
        await interaction.response.defer(ephemeral=True, thinking=True)
        await self.view.handle_name(interaction, self.name.value)


class TutorialView(discord.ui.View):
    """Guided onboarding view presented after /start."""

    def __init__(self, user: discord.User) -> None:
        super().__init__()
        self.user = user
        self.agent = AIAgent()

    @discord.ui.button(label="Begin", style=discord.ButtonStyle.primary)
    async def begin(self, interaction: discord.Interaction, button: discord.ui.Button) -> None:
        if interaction.user.id != self.user.id:
            await interaction.response.send_message("This is not your prompt.", ephemeral=True)
            return
        modal = NameInputModal(self)
        await interaction.response.send_modal(modal)

    async def handle_name(self, interaction: discord.Interaction, name: str) -> None:
        """Persist the player's chosen name and continue the tutorial."""
        discord_id = str(self.user.id)
        res = await db.query('SELECT id FROM players WHERE discord_id = %s', [discord_id])
        if res['rows']:
            await db.query('UPDATE players SET name = %s WHERE discord_id = %s', [name, discord_id])
        else:
            await db.query('INSERT INTO players (discord_id, name) VALUES (%s, %s)', [discord_id, name])

        prompt = (
            f"A new Iron Accord player just chose the name '{name}'. "
            f"Welcome them to Brasshaven in one gritty paragraph and instruct them to select a faction next."
        )
        try:
            text = await self.agent.get_narrative(prompt)
        except Exception as exc:  # pragma: no cover - unexpected
            print(f"Error in tutorial name step: {exc}")
            text = "An unexpected error occurred during narration."

        embed = simple(f"Welcome, {name}", description=text)
        from ..cogs.start import FactionView  # local import to avoid circular
        view = FactionView(self.user)
        await interaction.followup.send(embed=embed, view=view, ephemeral=True)
