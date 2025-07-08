import discord
import requests

from ai.mixtral_agent import MixtralAgent
from utils.async_utils import run_blocking
from utils.embed import simple


class SimpleTutorialView(discord.ui.View):
    """Lightweight multi-phase tutorial view."""

    PROMPTS = [
        (
            "You are the Game Master for a gritty, steampunk survival game called Iron Accord. "
            "Welcome a new player to the city of Brasshaven in a single dramatic paragraph."
        ),
        "Briefly describe the two major factions and prompt the player to continue.",
    ]

    def __init__(self, user: discord.User) -> None:
        super().__init__()
        self.user = user
        self.agent = MixtralAgent()
        self.phase = 0

    async def get_current_embed(self) -> discord.Embed:
        """Generate narration for the current phase."""
        prompt = self.PROMPTS[self.phase]
        try:
            text = await run_blocking(self.agent.query, prompt)
        except requests.exceptions.ConnectionError:
            print("LOG: Failed to connect to the Mixtral/LLM server.")
            text = (
                "Error: Could not connect to the narration service. Is the LLM server running?"
            )
        except Exception as exc:
            print(f"Error generating tutorial text: {exc}")
            text = "An unexpected error occurred during narration."
        return simple("The World You've Entered...", description=text)

    @discord.ui.button(label="Continue", style=discord.ButtonStyle.primary)
    async def continue_button(self, interaction: discord.Interaction, button: discord.ui.Button) -> None:
        if interaction.user.id != self.user.id:
            await interaction.response.send_message("This is not your prompt.", ephemeral=True)
            return
        if self.phase + 1 >= len(self.PROMPTS):
            await interaction.response.edit_message(view=None)
            return
        self.phase += 1
        embed = await self.get_current_embed()
        await interaction.response.edit_message(embed=embed, view=self)
