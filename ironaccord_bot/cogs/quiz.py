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

    async def send_quiz_question(self, interaction: discord.Interaction, user_id: int):
        """Fetch and send the next quiz question for ``user_id``."""
        question_data = self.quiz_service.get_next_question_for_user(user_id)
        if not question_data:
            await interaction.followup.send("An error occurred with the quiz.", ephemeral=True)
            return

        formatted_text = (
            f"**Question {self.quiz_service.active_quizzes[user_id]['question_number']}/5:**\n\n"
            f"{question_data['text']}\n\n"
        )
        button_labels = ["A", "B", "C"]
        choices = {}
        for i, (bg, text) in enumerate(question_data["choices"].items()):
            formatted_text += f"**{button_labels[i]}:** {text}\n"
            choices[bg] = text

        view = QuizView(self.bot, self.quiz_service, choices)

        if interaction.response.is_done():
            await interaction.followup.send(formatted_text, view=view, ephemeral=True)
        else:
            await interaction.response.send_message(formatted_text, view=view, ephemeral=True)

    @app_commands.command(name="startquiz", description="Starts the background sorting quiz.")
    async def startquiz(self, interaction: discord.Interaction):
        self.quiz_service.start_quiz(interaction.user.id)
        await self.send_quiz_question(interaction, user_id=interaction.user.id)


async def setup(bot: commands.Bot):
    await bot.add_cog(QuizCog(bot))

