import discord
from discord.ext import commands
from discord import app_commands

from ai.ai_agent import AIAgent
from services.opening_scene_service import OpeningSceneService
from views.opening_scene_view import OpeningSceneView
from views.oracle_view import OracleView


class StartCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot
        self.agent = AIAgent()
        self.rag_service = getattr(bot, "rag_service", None)

    @app_commands.command(name="start", description="Begin your journey in the world of Iron Accord.")
    async def start(self, interaction: discord.Interaction):
        """Begin the Wasteland Oracle question flow."""
        view = OracleView(self)
        embed = discord.Embed(
            title="The Wasteland Oracle",
            description=(
                "A crackle of static breaks the silence. A voice, smooth and calm, "
                "echoes from a forgotten frequency... it's the Oracle. He has a question for you.\n\n"
                f"**{view._current_question()}**"
            ),
            color=discord.Color.dark_gold(),
        )
        await interaction.response.send_message(embed=embed, view=view, ephemeral=True)

    async def handle_character_description(
        self, interaction: discord.Interaction, text: str
    ) -> None:
        """Generate the opening scene from the player's answers."""
        service = OpeningSceneService(self.agent, self.rag_service)
        result = await service.generate_opening(text)

        if not result:
            await interaction.followup.send(
                "An error occurred while generating the scene.", ephemeral=True
            )
            return

        scene = result.get("scene", "")
        question = result.get("question", "")
        choices = result.get("choices", [])

        embed = discord.Embed(
            title="A Fateful Encounter",
            description=f"{scene}\n\n**{question}**",
            color=discord.Color.dark_gold(),
        )

        view = OpeningSceneView(self.agent, scene, question, choices)
        await interaction.followup.send(embed=embed, view=view, ephemeral=True)


async def setup(bot: commands.Bot):
    await bot.add_cog(StartCog(bot))
