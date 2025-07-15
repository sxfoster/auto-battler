import discord
import logging
from dataclasses import dataclass, field
from typing import Dict, List

from ironaccord_bot.services.mission_engine_service import MissionEngineService
from ironaccord_bot.views.mission_view import MissionView

logger = logging.getLogger(__name__)


@dataclass
class QuizSession:
    """
    Represents an active background quiz for a player.
    MODIFIED: Methods are updated to support the new dynamic view.
    """
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
        """
        Returns the formatted text for the current question.
        MODIFIED: This now ONLY returns the question text.
        """
        q_data = self.get_current_question()
        if not q_data:
            return "Quiz complete."
        return q_data.get("question", "Error: Could not load question.")

    def record_answer(self, label: str) -> None:
        """Records the selected answer and advances the quiz."""
        answer_key = label.strip()[0].upper()
        self.answers.append(answer_key)
        self.current_question_index += 1

    def is_finished(self) -> bool:
        """Checks if the quiz has been completed."""
        return self.current_question_index >= len(self.questions)


class BackgroundQuizView(discord.ui.View):
    """
    Discord UI for progressing through the background quiz.
    MODIFIED: This entire class is refactored to be dynamic.
    """

    def __init__(self, quiz_service, mission_service: MissionEngineService, user_id: int, template: str = "salvage_run"):
        super().__init__(timeout=300)
        self.quiz_service = quiz_service
        self.mission_service = mission_service
        self.user_id = user_id
        self.template = template
        
        session = self.quiz_service.active_quizzes.get(user_id)
        if session:
            self._update_buttons_for_question(session.get_current_question())

    def _update_buttons_for_question(self, question_data: Dict):
        """Clears and adds new buttons based on the current question's answers."""
        self.clear_items()
        if not question_data:
            return
            
        answers = question_data.get("answers", [])
        for answer_text in answers:
            # Extract the letter (A, B, C, etc.) from the start of the answer
            label = answer_text.strip()[0]
            self.add_item(self.AnswerButton(label=label, answer_text=answer_text))

    async def handle_answer(self, interaction: discord.Interaction, answer_label: str):
        """Handles answer selection, question progression, and quiz completion."""
        # Disable buttons on the current view to prevent multiple clicks
        for item in self.children:
            if isinstance(item, discord.ui.Button):
                item.disabled = True
        await interaction.response.edit_message(view=self)

        session, next_question_data = await self.quiz_service.record_answer_and_get_next(
            self.user_id, answer_label
        )

        if not session.is_finished() and next_question_data:
            # If there's a next question, update the buttons and edit the message
            self._update_buttons_for_question(next_question_data)
            await interaction.edit_original_response(
                content=session.get_current_question_text(), view=self
            )
        else:
            # Quiz is finished, show a thinking message
            await interaction.edit_original_response(content="Edraz is considering your answers...", view=None)
            final_text, background = await self.quiz_service.evaluate_result(self.user_id)

            # MODIFICATION: Tag the user in the final welcome message
            welcome_message = f"{final_text}\n\nWelcome to your new life, <@{self.user_id}>."
            await interaction.followup.send(welcome_message, ephemeral=True)

            # Start the first mission
            opening = await self.mission_service.start_mission(self.user_id, background, self.template)
            if opening:
                view = MissionView(self.mission_service, self.user_id, opening.get("text", ""), opening.get("choices", []))
                await interaction.followup.send(opening.get("text", ""), view=view, ephemeral=True)
            else:
                await interaction.followup.send("Failed to start your first mission.", ephemeral=True)
            self.stop()

    # A generic button class to be created dynamically for each answer
    class AnswerButton(discord.ui.Button):
        def __init__(self, label: str, answer_text: str):
            # Use the first 80 characters of the answer as the button label
            super().__init__(label=answer_text[:80], style=discord.ButtonStyle.secondary, custom_id=f"quiz_answer_{label}")
            self.answer_label = label

        async def callback(self, interaction: discord.Interaction):
            # Ensure the interaction is from the correct user
            view: "BackgroundQuizView" = self.view
            if interaction.user.id != view.user_id:
                await interaction.response.send_message("This is not your quiz to answer.", ephemeral=True)
                return
            
            await view.handle_answer(interaction, self.answer_label)
