import discord
from discord.ext import commands
from discord import app_commands

from ai.ai_agent import AIAgent
from services.opening_scene_service import OpeningSceneService
from views.opening_scene_view import OpeningSceneView
from views.interview_view import InterviewView
from interview_config import EDRAZ_GREETING, EDRAZ_IMAGE_URL


class StartCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot
        self.agent = AIAgent()
        self.rag_service = getattr(bot, "rag_service", None)
        self.opening_scene_service: OpeningSceneService | None = None

    @app_commands.command(name="start", description="Begin your journey in the world of Iron Accord.")
    async def start(self, interaction: discord.Interaction):
        """Begin the Edraz interview question flow."""
        self.opening_scene_service = OpeningSceneService(
            self.agent, self.rag_service
        )
        view = InterviewView(self)
        embed = discord.Embed(
            title="Edraz, Chronicler of the Accord",
            description=f"{EDRAZ_GREETING}\n\n**{view._current_question()}**",
            color=discord.Color.dark_gold(),
        )
        embed.set_image(url=EDRAZ_IMAGE_URL)
        await interaction.response.send_message(embed=embed, view=view, ephemeral=True)

    async def handle_character_description(
        self, interaction: discord.Interaction, text: str
    ) -> None:
        """Generate the opening scene from the player's answers."""
        if not self.opening_scene_service:
            self.opening_scene_service = OpeningSceneService(
                self.agent, self.rag_service
            )

        result = await self.opening_scene_service.generate_opening(text)

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
