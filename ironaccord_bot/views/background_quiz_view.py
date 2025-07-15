import discord
from dataclasses import dataclass, field
from typing import List, Dict

from ..services.mission_engine_service import MissionEngineService
from .mission_view import MissionView


@dataclass
class QuizSession:
    """Represents an active background quiz for a player."""

    questions: List[Dict]
    background_map: Dict[str, str]
    background_text: Dict[str, str]
    answers: List[str] = field(default_factory=list)
    current_question_index: int = 0

    def get_current_question(self) -> Dict | None:
        """Returns the raw dictionary for the current question."""
        if self.is_finished():
            return None
        return self.questions[self.current_question_index]

    def get_current_question_text(self) -> str:
        """Returns the formatted text for the current question."""
        q_data = self.get_current_question()
        if not q_data:
            return "Quiz complete."
        question = q_data.get("question", "")
        # Answers are shown via buttons, so omit them from the text.
        return f"{question}"

    def record_answer(self, label: str) -> None:
        # Extract the letter (A, B, C, etc.) from the choice to record for scoring
        answer_key = label.strip()[0].upper()
        self.answers.append(answer_key)
        self.current_question_index += 1

    def is_finished(self) -> bool:
        return self.current_question_index >= len(self.questions)


class BackgroundQuizView(discord.ui.View):
    """Discord UI for progressing through the background quiz.
    MODIFIED to support a dynamic number of answer buttons."""

    def __init__(self, quiz_service, mission_service: MissionEngineService, user_id: int, template: str = "salvage_run"):
        super().__init__(timeout=300)
        self.quiz_service = quiz_service
        self.mission_service = mission_service
        self.user_id = user_id
        self.template = template
        # Initial button setup for the first question
        session = self.quiz_service.active_quizzes.get(user_id)
        if session:
            self._update_buttons_for_question(session.get_current_question())

    def _update_buttons_for_question(self, question_data: Dict):
        """Clears and adds new buttons based on the current question's answers."""
        self.clear_items()
        answers = question_data.get("answers", []) if question_data else []
        for answer_text in answers:
            label = answer_text.strip()[0]
            self.add_item(self.AnswerButton(label=label, answer_text=answer_text))

    async def handle_answer(self, interaction: discord.Interaction, answer_label: str):
        """Handles answer selection, question progression, and quiz completion."""
        for item in self.children:
            if isinstance(item, discord.ui.Button):
                item.disabled = True
        await interaction.response.edit_message(view=self)

        session, next_question_data = await self.quiz_service.record_answer_and_get_next(
            self.user_id, answer_label
        )

        if not session.is_finished() and next_question_data:
            self._update_buttons_for_question(next_question_data)
            await interaction.edit_original_response(
                content=session.get_current_question_text(), view=self
            )
        else:
            await interaction.edit_original_response(content="Edraz is considering your answers...", view=None)
            final_text, background = await self.quiz_service.evaluate_result(self.user_id)
            welcome_message = f"{final_text}\n\nWelcome to your new life, <@{self.user_id}>."
            await interaction.followup.send(welcome_message, ephemeral=True)

            opening = await self.mission_service.start_mission(self.user_id, background, self.template)
            if opening:
                view = MissionView(self.mission_service, self.user_id, opening.get("text", ""), opening.get("choices", []))
                await interaction.followup.send(opening.get("text", ""), view=view, ephemeral=True)
            else:
                await interaction.followup.send("Failed to start your first mission.", ephemeral=True)
            self.stop()

    class AnswerButton(discord.ui.Button):
        def __init__(self, label: str, answer_text: str):
            super().__init__(label=answer_text[:80], style=discord.ButtonStyle.secondary)
            self.answer_label = label

        async def callback(self, interaction: discord.Interaction):
            view: "BackgroundQuizView" = self.view
            await view.handle_answer(interaction, self.answer_label)

