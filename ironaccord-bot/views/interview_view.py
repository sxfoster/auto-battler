import discord
from ironaccord_bot.interview_config import QUESTIONS

class InterviewView(discord.ui.View):
    """Interactive interview conducted by Edraz."""

    def __init__(self, cog: "StartCog") -> None:
        super().__init__(timeout=300)
        self.cog = cog
        self.index = 0
        self.answers: list[str] = []
        self._populate_buttons()

    def _populate_buttons(self) -> None:
        self.clear_items()
        for idx, (label, _) in enumerate(QUESTIONS[self.index]["options"]):
            self.add_item(self.ChoiceButton(label, idx))

    def _current_question(self) -> str:
        return QUESTIONS[self.index]["text"]

    def _compile_summary(self) -> str:
        return f"Signal Profile: {', '.join(self.answers)}"

    class ChoiceButton(discord.ui.Button):
        def __init__(self, label: str, idx: int):
            super().__init__(label=label, style=discord.ButtonStyle.primary)
            self.idx = idx

        async def callback(self, interaction: discord.Interaction) -> None:
            view: "InterviewView" = self.view  # type: ignore[assignment]
            q = QUESTIONS[view.index]
            _, phrase = q["options"][self.idx]
            transition = q.get("transition", "")
            transition = transition.format(choice=phrase)
            view.answers.append(phrase)
            for child in view.children:
                child.disabled = True
            await interaction.response.edit_message(view=view)

            view.index += 1
            if view.index >= len(QUESTIONS):
                await view.cog.handle_character_description(
                    interaction, view._compile_summary()
                )
                view.stop()
                return

            view._populate_buttons()
            embed = discord.Embed(
                title="Edraz, Chronicler of the Accord",
                description=f"{transition}\n\n**{view._current_question()}**",
                color=discord.Color.dark_gold(),
            )
            await interaction.edit_original_response(embed=embed, view=view)
