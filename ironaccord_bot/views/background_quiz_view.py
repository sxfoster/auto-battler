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
        """Return the current question text along with the full answer text."""
        q_data = self.get_current_question()
        if not q_data:
            return "Quiz complete."

        question_text = q_data.get("question", "Error: Could not load question.")
        answers = q_data.get("answers", [])
        answer_lines = "\n".join(answers)
        return f"{question_text}\n\n{answer_lines}"

    def record_answer(self, label: str) -> None:
        """Record the selected answer key and advance the quiz."""
        self.answers.append(label)
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
        """Clear and add new buttons using generic labels."""
        self.clear_items()
        if not question_data:
            return

        answers = question_data.get("answers", [])
        for i, answer_text in enumerate(answers):
            original_label = answer_text.strip()[0]
            button_label = f"Choice {i + 1}"
            self.add_item(
                self.AnswerButton(display_label=button_label, answer_text=answer_text, original_label=original_label)
            )

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
        def __init__(self, display_label: str, answer_text: str, original_label: str):
            super().__init__(label=display_label, style=discord.ButtonStyle.secondary, custom_id=f"quiz_answer_{original_label}")
            self.answer_label = original_label

        async def callback(self, interaction: discord.Interaction):
            # Ensure the interaction is from the correct user
            view: "BackgroundQuizView" = self.view
            if interaction.user.id != view.user_id:
                await interaction.response.send_message("This is not your quiz to answer.", ephemeral=True)
                return
            
            await view.handle_answer(interaction, self.answer_label)
