import discord
from discord import app_commands
from discord.ext import commands

from utils.embed import simple

class HelpCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @app_commands.command(name="help", description="List available commands")
    async def help(self, interaction: discord.Interaction):
        embed = simple("Available Commands", [
            {"name": "/start", "value": "Create your character"},
            {"name": "/ping", "value": "Check bot responsiveness"},
            {"name": "/help", "value": "Show this help message"}
        ])
        await interaction.response.send_message(embed=embed, ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(HelpCog(bot))
