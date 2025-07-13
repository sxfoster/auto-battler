import discord
from typing import List, Dict, Any

class BackgroundQuizView(discord.ui.View):
    """Interactive view that walks the player through a background quiz."""

    def __init__(self, cog: "StartCog", questions: List[Dict[str, Any]]) -> None:
        super().__init__(timeout=300)
        self.cog = cog
        self.questions = questions
        self.index = 0
        self.answers: List[str] = []
        self._populate_buttons()

    def _populate_buttons(self) -> None:
        self.clear_items()
        for idx, choice in enumerate(self.questions[self.index]["choices"]):
            self.add_item(self.ChoiceButton(choice, idx))

    def _current_question(self) -> str:
        return self.questions[self.index]["text"]

    class ChoiceButton(discord.ui.Button):
        def __init__(self, text: str, idx: int) -> None:
            super().__init__(label=text, style=discord.ButtonStyle.primary, custom_id=f"bg_choice_{idx}")
            self.choice_text = text

        async def callback(self, interaction: discord.Interaction) -> None:
            view: "BackgroundQuizView" = self.view  # type: ignore[assignment]
            for item in view.children:
                item.disabled = True
            await interaction.response.edit_message(view=view)
            view.answers.append(self.choice_text)
            view.index += 1
            if view.index >= len(view.questions):
                result = await view.cog.quiz_service.evaluate_answers(view.questions, view.answers)
                if not result:
                    await interaction.followup.send(
                        "An error occurred while evaluating your answers.", ephemeral=True
                    )
                    view.stop()
                    return
                background = result.get("background", "Unknown")
                explanation = result.get("explanation", "")
                await view.cog.handle_background_result(interaction, background, explanation)
                view.stop()
                return

            view._populate_buttons()
            embed = discord.Embed(
                title="Edraz, Chronicler of the Accord",
                description=f"**{view._current_question()}**",
                color=discord.Color.dark_gold(),
            )
            await interaction.edit_original_response(embed=embed, view=view)
