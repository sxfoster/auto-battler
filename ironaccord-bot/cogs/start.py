import discord
from discord.ext import commands
from discord import app_commands

from views.adventure_view import AdventureView
from ai.ai_agent import AIAgent
import asyncio


class StartCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot
        self.agent = AIAgent()

    @app_commands.command(name="start", description="Begin your journey in the world of Iron Accord.")
    async def start(self, interaction: discord.Interaction):
        # Give the LLM time to respond
        await interaction.response.defer(ephemeral=True)

        user_name = interaction.user.display_name
        prompt = (
            f"Your name is Edraz. Start the story for a new player named {user_name}. "
            "Begin with 'The world burned under the march of metal', but then immediately "
            "break the fourth wall to introduce yourself as their witty guide through this whole... game thing."
        )

        narrative_text = await self.agent.get_narrative(prompt)

        embed = discord.Embed(
            title=f"The Adventure of {user_name}",
            description=narrative_text,
            color=discord.Color.dark_gold()
        )

        view = AdventureView(agent=self.agent, user=interaction.user)
        # Start prefetching the next phase in the background
        asyncio.create_task(view._prefetch_for_phase(2))
        await interaction.followup.send(embed=embed, view=view, ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(StartCog(bot))
