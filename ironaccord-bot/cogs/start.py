import discord
from discord.ext import commands
from discord import app_commands

from views.adventure_view import AdventureView
from ai.mixtral_agent import MixtralAgent
from utils.async_utils import run_blocking


class StartCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot
        self.agent = MixtralAgent()

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

        narrative_text = await run_blocking(
            self.agent.query,
            prompt,
            context=f"adventure_phase_1_user_{user_name}"
        )

        embed = discord.Embed(
            title=f"The Adventure of {user_name}",
            description=narrative_text,
            color=discord.Color.dark_gold()
        )

        view = AdventureView(agent=self.agent, user=interaction.user)
        await interaction.followup.send(embed=embed, view=view, ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(StartCog(bot))
