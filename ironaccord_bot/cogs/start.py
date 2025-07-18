import discord
from discord.ext import commands
import logging

from ironaccord_bot.services.quiz_content_service import QuizContentService
from ironaccord_bot.services.quiz_service import QuizService
from ironaccord_bot.views.quiz_view import QuizView

logger = logging.getLogger(__name__)



class StartCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot
        content_service = QuizContentService()
        self.quiz_service = QuizService(content_service)


    @commands.hybrid_command(
        name="start",
        description="Begin your journey and discover your place in the Iron Accord.",
    )
    async def start(self, ctx: commands.Context):
        """Kick off the interactive background quiz via slash or prefix."""
        user_id = ctx.author.id
        logger.info(
            f"User {user_id} started the quiz process via {'slash command' if ctx.interaction else 'prefix command'}."
        )

        if ctx.interaction:
            await ctx.interaction.response.send_message(
                "Edraz is consulting the archives to build your personalized story...",
                ephemeral=True,
            )
        else:
            await ctx.send(
                "Edraz is consulting the archives to build your personalized story..."
            )

        try:
            self.quiz_service.start_quiz(user_id)
            question = self.quiz_service.get_next_question_for_user(user_id)

            if question:
                logger.info(f"Quiz started for user {user_id}. Sending first question.")
                formatted_text = (
                    f"**Question {self.quiz_service.active_quizzes[user_id]['question_number']}/5:**\n\n"
                    f"{question['text']}\n\n"
                )
                button_labels = ["A", "B", "C"]
                choices = {}
                for i, (bg, text) in enumerate(question["choices"].items()):
                    formatted_text += f"**{button_labels[i]}:** {text}\n"
                    choices[bg] = text

                view = QuizView(self.bot, self.quiz_service, choices)

                if ctx.interaction:
                    await ctx.interaction.edit_original_response(
                        content=formatted_text,
                        view=view,
                    )
                else:
                    await ctx.send(formatted_text, view=view)
            else:
                logger.error("Quiz content unavailable for user %s", user_id)
                if ctx.interaction:
                    await ctx.interaction.edit_original_response(
                        content="Sorry, the quiz is currently unavailable.",
                        view=None,
                    )
                else:
                    await ctx.send("Sorry, the quiz is currently unavailable.")
        except Exception as exc:  # pragma: no cover - safety net
            logger.error(
                f"An unexpected error occurred in the start command for user {user_id}: {exc}",
                exc_info=True,
            )
            if ctx.interaction:
                await ctx.interaction.edit_original_response(
                    content="A critical error occurred. Please notify the developers.",
                    view=None,
                )
            else:
                await ctx.send("A critical error occurred. Please notify the developers.")


async def setup(bot: commands.Bot):
    await bot.add_cog(StartCog(bot))
