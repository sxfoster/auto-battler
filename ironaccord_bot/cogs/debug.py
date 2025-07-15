import json
import discord
from discord import app_commands
from discord.ext import commands

from services.mission_engine_service import MissionEngineService


class DebugCog(commands.Cog):
    """Developer slash commands."""

    def __init__(self, bot: commands.Bot):
        self.bot = bot
        self.service = MissionEngineService(bot.ai_agent, bot.rag_service)

    @app_commands.command(name="generate_mission", description="Generate a mission for testing")
    async def generate_mission(self, interaction: discord.Interaction, background: str):
        await interaction.response.defer(ephemeral=True)
        mission = await self.service.generate_mission(background)
        if not mission:
            await interaction.followup.send("Mission generation failed.", ephemeral=True)
            return
        data = json.dumps(mission, indent=2)
        if len(data) > 1900:
            data = data[:1900] + "..."
        await interaction.followup.send(f"```json\n{data}\n```", ephemeral=True)


async def setup(bot: commands.Bot):
    await bot.add_cog(DebugCog(bot))
