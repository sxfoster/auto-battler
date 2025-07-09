import discord
from discord.ext import commands
from discord import app_commands

from views.simple_tutorial_view import SimpleTutorialView
from ai.mixtral_agent import MixtralAgent
from utils.async_utils import run_blocking


class StartCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot
        self.agent = MixtralAgent()

    @app_commands.command(name="start", description="Begin your journey in the world of Iron Accord.")
    async def start(self, interaction: discord.Interaction):
        await interaction.response.defer(ephemeral=True)

        # --- Phase 1: The Spark of Memory ---
        user_name = interaction.user.display_name
        prompt = (
            f"You are the Game Master for 'Iron Accord'. Write a short, evocative opening for a new player named '{user_name}'. "
            "Use the phrase 'The world burned under the march of metal' to introduce the world's harsh reality."
        )

        narrative_text = await run_blocking(
            self.agent.query,
            prompt,
            context=f"start_tutorial_phase_1_user_{user_name}"
        )

        embed = discord.Embed(
            title="The World You've Entered...",
            description=narrative_text,
            color=discord.Color.dark_red()
        )

        # Create the view and send it with the first message
        view = SimpleTutorialView(agent=self.agent, user=interaction.user)
        await interaction.followup.send(embed=embed, view=view, ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(StartCog(bot))
