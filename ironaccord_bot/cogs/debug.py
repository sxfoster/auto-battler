import json
import discord
from discord import app_commands
from discord.ext import commands

from ai.ai_agent import AIAgent
from services.mission_engine_service import MissionEngineService


class DebugCog(commands.Cog):
    """Developer utilities."""

    def __init__(self, bot: commands.Bot) -> None:
        self.bot = bot
        self.agent = AIAgent()
        self.engine = MissionEngineService(self.agent)

        self.group = app_commands.Group(name="debug", description="Debug commands")
        self.group.command(name="mission", description="Generate a mission for testing")(self.mission)
        bot.tree.add_command(self.group)

    async def mission(self, interaction: discord.Interaction, background: str):
        """Generate mission data using a player background."""
        await interaction.response.defer(ephemeral=True)
        try:
            mission = await self.engine.generate_mission(background)
        except Exception as exc:  # pragma: no cover - log unexpected errors
            print(f"Error during mission generation: {exc}")
            mission = None

        if not mission:
            await interaction.followup.send("Mission generation failed.", ephemeral=True)
            return

        data = json.dumps(mission, indent=2)
        if len(data) > 1990:
            data = data[:1990] + "..."
        await interaction.followup.send(f"```json\n{data}\n```", ephemeral=True)


async def setup(bot: commands.Bot):
    await bot.add_cog(DebugCog(bot))
