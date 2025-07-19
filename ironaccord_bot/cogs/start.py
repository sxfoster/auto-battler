import discord
import random
from pathlib import Path
from discord.ext import commands
import logging

from ironaccord_bot.services.background_quiz_service import BackgroundQuizService
from ironaccord_bot.services.mission_engine_service import MissionEngineService
from ironaccord_bot.services.ollama_service import OllamaService
from ironaccord_bot.views.background_quiz_view import BackgroundQuizView
from ironaccord_bot.ai.ai_agent import AIAgent

logger = logging.getLogger(__name__)

BACKGROUNDS_PATH = Path("data/backgrounds/iron_accord")


class StartCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot
        self.ollama_service = OllamaService()
        self.quiz_service = BackgroundQuizService(self.ollama_service)
        self.mission_service = MissionEngineService(AIAgent())

    def _load_random_backgrounds(self, count: int = 3) -> dict[str, str]:
        files = [p for p in BACKGROUNDS_PATH.glob("*.md") if p.name.lower() != "readme.md"]
        if len(files) < count:
            return {}
        chosen = random.sample(files, count)
        return {f.stem.replace("_", " ").title(): f.read_text(encoding="utf-8") for f in chosen}

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
            backgrounds = self._load_random_backgrounds()
            session = await self.quiz_service.start_quiz(user_id, backgrounds)

            if session:
                logger.info(f"Quiz generated for user {user_id}. Sending first question.")
                view = BackgroundQuizView(self.quiz_service, self.mission_service, user_id)
                if ctx.interaction:
                    await ctx.interaction.edit_original_response(
                        content=session.get_current_question_text(),
                        view=view,
                    )
                else:
                    await ctx.send(session.get_current_question_text(), view=view)
            else:
                logger.error(f"Failed to generate quiz for user {user_id} after all retries.")
                if ctx.interaction:
                    await ctx.interaction.edit_original_response(
                        content=(
                            "There was an error generating the quiz. The archives may be unstable. Please try again later."
                        ),
                        view=None,
                    )
                else:
                    await ctx.send(
                        "There was an error generating the quiz. The archives may be unstable. Please try again later."
                    )
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
