import discord
from discord.ext import commands
from discord import app_commands

from ai.ai_agent import AIAgent
from services.opening_scene_service import OpeningSceneService
from views.opening_scene_view import OpeningSceneView
from views.background_quiz_view import BackgroundQuizView
from services.background_quiz_service import BackgroundQuizService
from models import character_service
import logging


EDRAZ_GREETING = (
    "Signal acquired. I am Edraz, the Chronicler. I read the static between the worlds, "
    "and today it led me to you. Your story is unwritten, a blank slate in the great archive. "
    "Before we begin, I need to tune into your signal."
)

EDRAZ_IMAGE_URL = "https://example.com/edraz-sanctum.png"


class StartCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot
        self.agent = AIAgent()
        self.rag_service = getattr(bot, "rag_service", None)
        self.quiz_service = BackgroundQuizService(self.agent)

    @app_commands.command(
        name="start", description="Begin your journey in the world of Iron Accord."
    )
    async def start(self, interaction: discord.Interaction):
        """Begin the Edraz interview question flow."""
        await interaction.response.defer(ephemeral=True)

        try:
            questions = await self.quiz_service.generate_questions()
        except Exception as exc:  # pragma: no cover - unexpected failure
            logging.error("Failed generating quiz questions: %s", exc, exc_info=True)
            await interaction.followup.send(
                "An error occurred while generating the quiz.", ephemeral=True
            )
            return

        if not questions:
            await interaction.followup.send(
                "An error occurred while generating the quiz.", ephemeral=True
            )
            return

        view = BackgroundQuizView(self, questions)
        embed = discord.Embed(
            title="Edraz, Chronicler of the Accord",
            description=f"{EDRAZ_GREETING}\n\n**{view._current_question()}**",
            color=discord.Color.dark_gold(),
        )
        embed.set_image(url=EDRAZ_IMAGE_URL)

        await interaction.followup.send(embed=embed, view=view, ephemeral=True)

    async def handle_background_result(
        self, interaction: discord.Interaction, background: str, explanation: str
    ) -> None:
        """Narrate the chosen background then continue to the opening scene."""
        try:
            await character_service.set_player_background(
                str(interaction.user.id), background
            )
        except Exception as exc:  # pragma: no cover - db failure
            logging.error("Failed to store background: %s", exc, exc_info=True)
        try:
            narration = await self.agent.get_narrative(explanation)
        except Exception:  # pragma: no cover - network failure
            narration = explanation

        embed = discord.Embed(
            title=f"Background Chosen: {background}",
            description=narration,
            color=discord.Color.dark_gold(),
        )
        await interaction.followup.send(embed=embed, ephemeral=True)

        await self.handle_character_description(interaction, explanation)

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
