import logging
import discord
from discord.ext import commands
from discord import app_commands

from ..services.quiz_content_service import QuizContentService


def slugify(text: str) -> str:
    """Convert ``text`` to a lowercase, underscore-separated slug."""
    return text.lower().replace(" ", "_")

logger = logging.getLogger(__name__)


class SimpleQuizView(discord.ui.View):
    def __init__(self, bot: commands.Bot, user_id: int):
        super().__init__(timeout=300)
        self.bot = bot
        self.user_id = user_id

    @discord.ui.button(label="A", style=discord.ButtonStyle.secondary, custom_id="quiz_A")
    async def button_a(self, interaction: discord.Interaction, button: discord.ui.Button):
        await self.handle_choice(interaction, 0)

    @discord.ui.button(label="B", style=discord.ButtonStyle.secondary, custom_id="quiz_B")
    async def button_b(self, interaction: discord.Interaction, button: discord.ui.Button):
        await self.handle_choice(interaction, 1)

    @discord.ui.button(label="C", style=discord.ButtonStyle.secondary, custom_id="quiz_C")
    async def button_c(self, interaction: discord.Interaction, button: discord.ui.Button):
        await self.handle_choice(interaction, 2)

    async def handle_choice(self, interaction: discord.Interaction, choice_index: int):
        for item in self.children:
            item.disabled = True
        await interaction.response.edit_message(view=self)

        quiz_cog = self.bot.get_cog("QuizCog")
        if quiz_cog:
            await quiz_cog.process_answer(interaction, self.user_id, choice_index)


class QuizCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot
        self.content_service = QuizContentService()
        self.active_quizzes: dict[int, dict] = {}

        # Explicit list of all possible background slugs. Using a hardcoded
        # list ensures the score dictionary always has the correct keys and
        # cannot go out of sync with the quiz data.
        self.ALL_BACKGROUNDS = [
            "cipher",
            "clockwork_guard",
            "communal_farmer",
            "field_healer",
            "guild_apprentice",
            "lore_keeper",
            "marshal",
            "salvage_scout",
            "steamwright",
            "street_urchin",
        ]

    @app_commands.command(name="startquiz", description="Starts the background sorting quiz.")
    async def startquiz(self, interaction: discord.Interaction):
        user_id = interaction.user.id
        logger.info(f"User {user_id} starting the quiz.")

        first_question = self.content_service.get_question_and_choices(1)

        # Initialize scores for every possible background to zero using the
        # predefined list. This removes any dependency on how the YAML file is
        # structured and prevents KeyError issues during scoring.
        scores = {bg: 0 for bg in self.ALL_BACKGROUNDS}

        self.active_quizzes[user_id] = {
            "question_number": 1,
            "scores": scores,
            "last_choices": first_question["choices"],
        }

        await self._send_question(interaction, user_id, first_question)

    async def _send_question(self, interaction: discord.Interaction, user_id: int, question_data: dict):
        qnum = self.active_quizzes[user_id]["question_number"]
        text = f"**Question {qnum}/5:**\n\n{question_data['text']}\n\n"
        labels = ["A", "B", "C"]
        for i, choice in enumerate(question_data["choices"]):
            text += f"**{labels[i]}:** {choice['text']}\n"

        view = SimpleQuizView(self.bot, user_id)
        if interaction.response.is_done():
            await interaction.followup.send(text, view=view, ephemeral=True)
        else:
            await interaction.response.send_message(text, view=view, ephemeral=True)

    async def process_answer(self, interaction: discord.Interaction, user_id: int, choice_index: int):
        state = self.active_quizzes.get(user_id)
        if not state:
            return

        background_raw = state["last_choices"][choice_index]["background"]
        background = slugify(background_raw)

        # Extra safety check: ensure the slug exists in the scores dict.
        if background not in state["scores"]:
            logger.error(
                "FATAL: Slug '%s' not found in scores dict! Dict keys: %s",
                background,
                list(state["scores"].keys()),
            )
            await interaction.followup.send(
                "A critical error occurred with the quiz data. Please contact an admin.",
                ephemeral=True,
            )
            return

        state["scores"][background] += 1
        state["question_number"] += 1

        if state["question_number"] > 5:
            scores = state["scores"]
            max_score = max(scores.values())
            winners = [bg for bg, score in scores.items() if score == max_score]
            winner_slug = winners[0]
            final_background = winner_slug.replace("_", " ").title()
            await interaction.followup.send(
                f"**Diagnostic Complete.**\nYour background is: **{final_background}**\n\n*Welcome to the Iron Accord.*",
                ephemeral=True,
            )
            del self.active_quizzes[user_id]
            return

        question_data = self.content_service.get_question_and_choices(state["question_number"])
        state["last_choices"] = question_data["choices"]
        await self._send_question(interaction, user_id, question_data)


async def setup(bot: commands.Bot):
    await bot.add_cog(QuizCog(bot))
