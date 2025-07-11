import discord

class OracleView(discord.ui.View):
    """Interactive questionnaire presented by the Wasteland Oracle."""

    QUESTIONS = [
        {
            "text": "The old world is buried in rust and ruin. How do you see it?",
            "options": [
                ("A tragic loss", "a tragic loss."),
                ("A deserved end", "a deserved end."),
                ("A blank slate", "a blank slate."),
                ("A puzzle to be solved", "a puzzle to be solved."),
            ],
        },
        {
            "text": "A starving family finds your last provisions. What do you do?",
            "options": [
                ("Share what you can", "share what little you have with those in need."),
                ("Demand payment for it", "demand something in return for your aid."),
                ("Take it by force", "take it back by force, keeping it for yourself."),
                ("Ignore them", "turn away and ignore their plight."),
            ],
        },
        {
            "text": "You find a terminal proclaiming 'The \\u2018Accord\\u2019 is a lie.' How do you react?",
            "options": [
                ("Try to learn more", "seek the truth behind conspiracies."),
                ("Destroy the terminal", "destroy the evidence and move on."),
                ("Dismiss it as nonsense", "dismiss such warnings as nonsense."),
                ("Use the info for leverage", "use such secrets as leverage over others."),
            ],
        },
        {
            "text": "What do you value most in a companion?",
            "options": [
                ("Unwavering Loyalty", "unwavering loyalty"),
                ("Brutal Honesty", "brutal honesty"),
                ("Sharp Intellect", "sharp intellect"),
                ("Survival Skills", "practical survival skills"),
            ],
        },
    ]

    def __init__(self, cog: "StartCog") -> None:
        super().__init__(timeout=300)
        self.cog = cog
        self.index = 0
        self.answers: list[str] = []
        self._populate_buttons()

    def _populate_buttons(self) -> None:
        self.clear_items()
        for idx, (label, _) in enumerate(self.QUESTIONS[self.index]["options"]):
            self.add_item(self.ChoiceButton(label, idx))

    def _current_question(self) -> str:
        return self.QUESTIONS[self.index]["text"]

    def _compile_summary(self) -> str:
        return (
            f"This person sees the old world as {self.answers[0]} "
            f"They {self.answers[1]} "
            f"They {self.answers[2]} "
            f"They value {self.answers[3]} in a companion."
        )

    class ChoiceButton(discord.ui.Button):
        def __init__(self, label: str, idx: int):
            super().__init__(label=label, style=discord.ButtonStyle.primary)
            self.idx = idx

        async def callback(self, interaction: discord.Interaction) -> None:
            view: "OracleView" = self.view  # type: ignore[assignment]
            q = view.QUESTIONS[view.index]
            _, phrase = q["options"][self.idx]
            view.answers.append(phrase)
            for child in view.children:
                child.disabled = True
            await interaction.response.edit_message(view=view)

            view.index += 1
            if view.index >= len(view.QUESTIONS):
                await view.cog.handle_character_description(
                    interaction, view._compile_summary()
                )
                view.stop()
                return

            view._populate_buttons()
            embed = discord.Embed(
                title="The Wasteland Oracle",
                description=f"**{view._current_question()}**",
                color=discord.Color.dark_gold(),
            )
            await interaction.edit_original_response(embed=embed, view=view)

