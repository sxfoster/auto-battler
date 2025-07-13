import discord
from typing import Iterable
from . import InterviewView  # for typing only
from services.background_quiz_service import BackgroundQuizService


class BackgroundQuizView(discord.ui.View):
    """Interactive background questionnaire."""

    def __init__(self, cog: "StartCog", questions: list[dict], service: BackgroundQuizService) -> None:
        super().__init__(timeout=300)
        self.cog = cog
        self.questions = questions
        self.service = service
        self.index = 0
        self.answers: list[str] = []
        if questions:
            self._populate_buttons()

    def _populate_buttons(self) -> None:
        self.clear_items()
        for idx, opt in enumerate(self.questions[self.index]["options"]):
            if isinstance(opt, dict):
                label = opt.get("text") or str(opt)
            else:
                label = str(opt)
            self.add_item(self.ChoiceButton(label, idx))

    def _current_question(self) -> str:
        return self.questions[self.index]["text"]

    class ChoiceButton(discord.ui.Button):
        def __init__(self, label: str, idx: int):
            super().__init__(label=label, style=discord.ButtonStyle.primary)
            self.idx = idx

        async def callback(self, interaction: discord.Interaction) -> None:  # pragma: no cover - interactive UI
            view: "BackgroundQuizView" = self.view  # type: ignore[assignment]
            q = view.questions[view.index]
            opt = q["options"][self.idx]
            if isinstance(opt, dict):
                phrase = opt.get("phrase") or opt.get("text")
            elif isinstance(opt, (list, tuple)) and len(opt) >= 2:
                phrase = opt[1]
            else:
                phrase = opt
            view.answers.append(str(phrase))
            for child in view.children:
                child.disabled = True
            await interaction.response.edit_message(view=view)

            view.index += 1
            if view.index >= len(view.questions):
                summary = await view.service.evaluate_answers(view.answers)
                await view.cog.handle_character_description(interaction, summary)
                view.stop()
                return

            view._populate_buttons()
            embed = discord.Embed(
                title="Edraz, Chronicler of the Accord",
                description=f"{view._current_question()}",
                color=discord.Color.dark_gold(),
            )
            await interaction.edit_original_response(embed=embed, view=view)
