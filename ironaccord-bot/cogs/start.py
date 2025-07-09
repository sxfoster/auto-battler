import discord
from discord.ext import commands
from discord import app_commands
from views.adventure_view import AdventureView
from utils.embed import create_embed

from ai.ai_agent import AIAgent


class StartCog(commands.Cog):
    """Handle the '/start' command and onboarding flow."""

    def __init__(self, bot: commands.Bot):
        self.bot = bot
        self.bot.agent = AIAgent()

    @app_commands.command(name="start", description="Begin your adventure in the Iron Accord.")
    async def start(self, interaction: discord.Interaction):
        await interaction.response.defer()

        prompt = (
            "You are the narrator for a grim-dark, post-apocalyptic TTRPG called Iron Accord. "
            "Write a compelling, short (2-3 paragraphs) opening scene for a new player. "
            "They have just woken up in a desolate, rusty metal landscape with no memory of how they got there. "
            "Set a tone of mystery, danger, and survival."
        )
        story_text = await self.bot.agent.get_narrative(prompt)

        embed = create_embed(
            title="A Memory, Lost to Rust...",
            description=story_text,
            color=discord.Color.dark_red(),
        )

        view = AdventureView(agent=self.bot.agent, user=interaction.user)

        await interaction.followup.send(embed=embed, view=view)


def setup(bot: commands.Bot):
    bot.add_cog(StartCog(bot))
