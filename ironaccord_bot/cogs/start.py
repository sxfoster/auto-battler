import discord
from discord.ext import commands
from discord import app_commands

from ..services.background_quiz_service import BackgroundQuizService
from ..views.background_quiz_view import BackgroundQuizView


class StartCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot
        self.quiz_service = BackgroundQuizService()

    @app_commands.command(
        name="start",
        description="Begin your journey and discover your place in the Iron Accord.",
    )
    async def start(self, interaction: discord.Interaction):
        """Kick off the interactive background quiz."""
        await interaction.response.defer(ephemeral=True)

        try:
            user_id = interaction.user.id
            session = await self.quiz_service.start_quiz(user_id)
            if not session:
                await interaction.followup.send(
                    content="There was an error generating the quiz. Please try again later.",
                    ephemeral=True,
                )
                return

            view = BackgroundQuizView(self.quiz_service, user_id)
            first_question = session.get_current_question_text()
            await interaction.followup.send(content=first_question, view=view, ephemeral=True)
        except Exception as exc:  # pragma: no cover - safety net
            print(f"Error starting quiz: {exc}")
            await interaction.followup.send(
                content="A critical error occurred while starting your journey. The archivists have been notified.",
                ephemeral=True,
            )


async def setup(bot: commands.Bot):
    await bot.add_cog(StartCog(bot))
