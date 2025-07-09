import discord
from discord.ext import commands
from discord import app_commands

from views.adventure_view import AdventureView
from ai.mixtral_agent import MixtralAgent


class StartCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot
        self.agent = MixtralAgent()

    @app_commands.command(name="start", description="Begin your journey in the world of Iron Accord.")
    async def start(self, interaction: discord.Interaction):
        await interaction.response.send_message(
            "Loading your adventure...",
            ephemeral=True
        )

        view = AdventureView(agent=self.agent, user=interaction.user)
        await view._handle_next_phase(await interaction.original_response())

async def setup(bot: commands.Bot):
    await bot.add_cog(StartCog(bot))
