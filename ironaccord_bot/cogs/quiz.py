import discord
from discord import app_commands
from discord.ext import commands

from ..services.quiz_content_service import QuizContentService
from ..services.quiz_service import QuizService
from ..views.quiz_view import QuizView


class QuizCog(commands.Cog):
    """Cog providing the /startquiz command."""

    def __init__(self, bot: commands.Bot):
        self.bot = bot
        self.content_service = QuizContentService()
        self.quiz_service = QuizService(self.content_service)

    @app_commands.command(name="startquiz", description="Starts the background sorting quiz.")
    async def startquiz(self, interaction: discord.Interaction):
        self.quiz_service.start_quiz(interaction.user.id)
        question = self.quiz_service.get_next_question_for_user(interaction.user.id)
        view = QuizView(self.quiz_service, question["choices"])
        await interaction.response.send_message(question["text"], view=view, ephemeral=True)


async def setup(bot: commands.Bot):
    await bot.add_cog(QuizCog(bot))

