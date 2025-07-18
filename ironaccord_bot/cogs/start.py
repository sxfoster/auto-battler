import discord
from discord.ext import commands
import logging

from .quiz import QuizCog, SimpleQuizView

logger = logging.getLogger(__name__)



class StartCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot


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
            quiz_cog = self.bot.get_cog("QuizCog")
            if not quiz_cog:
                raise RuntimeError("QuizCog not loaded")

            question = quiz_cog.content_service.get_question_and_choices(1)
            scores = {c["background"]: 0 for c in question["choices"]}
            quiz_cog.active_quizzes[user_id] = {
                "question_number": 1,
                "scores": scores,
                "last_choices": question["choices"],
            }

            logger.info(f"Quiz started for user {user_id}. Sending first question.")
            formatted_text = f"**Question 1/5:**\n\n{question['text']}\n\n"
            labels = ["A", "B", "C"]
            for i, choice in enumerate(question["choices"]):
                formatted_text += f"**{labels[i]}:** {choice['text']}\n"

            view = SimpleQuizView(self.bot, user_id)

            if ctx.interaction:
                await ctx.interaction.edit_original_response(content=formatted_text, view=view)
            else:
                await ctx.send(formatted_text, view=view)
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
