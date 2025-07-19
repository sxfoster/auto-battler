import discord

from ..services.quiz_service import QuizService


class QuizButton(discord.ui.Button):
    def __init__(self, background_name: str, label: str):
        super().__init__(
            label=label,
            style=discord.ButtonStyle.secondary,
            custom_id=f"quiz_answer_{background_name}",
        )

    async def callback(self, interaction: discord.Interaction):
        view: "QuizView" = self.view
        for item in view.children:
            item.disabled = True
        await interaction.response.edit_message(view=view)
        chosen_background = self.custom_id.split("_")[-1]
        view.quiz_service.record_answer(interaction.user.id, chosen_background)
        state = view.quiz_service.active_quizzes.get(interaction.user.id)
        if not state or state["question_number"] > 5:
            final_bg = view.quiz_service.get_final_result(interaction.user.id)
            await interaction.followup.send(
                f"**Diagnostic Complete.**\nYour background is: **{final_bg}**\n\n*Welcome to the Iron Accord.*",
                ephemeral=True,
            )
            view.stop()
        else:
            next_q = view.quiz_service.get_next_question_for_user(interaction.user.id)
            next_view = QuizView(view.quiz_service, next_q["choices"])
            await interaction.followup.send(next_q["text"], view=next_view, ephemeral=True)


class QuizView(discord.ui.View):
    def __init__(self, quiz_service: QuizService, choices: dict):
        super().__init__(timeout=300)
        self.quiz_service = quiz_service
        button_labels = ["A", "B", "C"]
        for i, (bg, text) in enumerate(choices.items()):
            label = f"{button_labels[i]}: {text[:60]}..."
            self.add_item(QuizButton(background_name=bg, label=label))

