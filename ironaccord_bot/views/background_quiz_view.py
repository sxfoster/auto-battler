import discord
from dataclasses import dataclass, field
from typing import List, Dict


@dataclass
class QuizSession:
    """Represents an active background quiz for a player."""

    questions: List[Dict]
    background_map: Dict[str, str]
    background_text: Dict[str, str]
    answers: List[str] = field(default_factory=list)
    current_question_index: int = 0

    def get_current_question_text(self) -> str:
        q = self.questions[self.current_question_index]
        question = q.get("question", "")
        answers = q.get("answers", [])
        answer_lines = "\n".join(answers)
        return f"{question}\n{answer_lines}"

    def record_answer(self, label: str) -> None:
        self.answers.append(label)
        self.current_question_index += 1

    def is_finished(self) -> bool:
        return self.current_question_index >= len(self.questions)


from ..services.mission_engine_service import MissionEngineService
from .mission_view import MissionView


class BackgroundQuizView(discord.ui.View):
    """Discord UI for progressing through the background quiz."""

    def __init__(self, quiz_service, mission_service: MissionEngineService, user_id: int, template: str = "salvage_run"):
        super().__init__(timeout=300)
        self.quiz_service = quiz_service
        self.mission_service = mission_service
        self.user_id = user_id
        self.template = template

    async def handle_answer(self, interaction: discord.Interaction, answer_label: str):
        session, next_question = await self.quiz_service.record_answer_and_get_next(
            self.user_id, answer_label
        )

        if not session.is_finished():
            await interaction.response.edit_message(content=next_question, view=self)
        else:
            await interaction.response.edit_message(content="Edraz is considering your answers...", view=None)
            final_text, background = await self.quiz_service.evaluate_result(self.user_id)
            await interaction.followup.send(final_text, ephemeral=True)
            opening = await self.mission_service.start_mission(self.user_id, background, self.template)
            if opening:
                view = MissionView(self.mission_service, self.user_id, opening.get("text", ""), opening.get("choices", []))
                await interaction.followup.send(opening.get("text", ""), view=view, ephemeral=True)
            else:
                await interaction.followup.send("Failed to start mission.", ephemeral=True)
            self.stop()

    @discord.ui.button(label="A", style=discord.ButtonStyle.secondary, custom_id="answer_a")
    async def answer_a(self, interaction: discord.Interaction, button: discord.ui.Button):
        await self.handle_answer(interaction, "A")

    @discord.ui.button(label="B", style=discord.ButtonStyle.secondary, custom_id="answer_b")
    async def answer_b(self, interaction: discord.Interaction, button: discord.ui.Button):
        await self.handle_answer(interaction, "B")

    @discord.ui.button(label="C", style=discord.ButtonStyle.secondary, custom_id="answer_c")
    async def answer_c(self, interaction: discord.Interaction, button: discord.ui.Button):
        await self.handle_answer(interaction, "C")
