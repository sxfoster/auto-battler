import discord

from ..services.quiz_service import QuizService


class QuizButton(discord.ui.Button):
    def __init__(self, label: str, choice_background: str):
        # The background is stored in the custom_id so we can map it in the callback
        super().__init__(
            label=label,
            style=discord.ButtonStyle.secondary,
            custom_id=f"quiz_answer_{choice_background}",
        )

    async def callback(self, interaction: discord.Interaction):
        view: "QuizView" = self.view
        for item in view.children:
            item.disabled = True
        await interaction.response.edit_message(view=view)

        chosen_background = self.custom_id.split("_")[-1]
        is_over = view.quiz_service.record_answer(interaction.user.id, chosen_background)

        if is_over:
            final_bg = view.quiz_service.get_final_result(interaction.user.id)
            await interaction.followup.send(
                f"**Diagnostic Complete.**\nYour background is: **{final_bg}**\n\n*Welcome to the Iron Accord.*",
                ephemeral=True,
            )
            view.stop()
        else:
            quiz_cog = view.bot.get_cog("QuizCog")
            if quiz_cog:
                await quiz_cog.send_quiz_question(interaction, interaction.user.id)


class QuizView(discord.ui.View):
    def __init__(self, bot: discord.Client, quiz_service: QuizService, choices: dict):
        super().__init__(timeout=300)
        self.bot = bot
        self.quiz_service = quiz_service

        button_labels = ["A", "B", "C"]
        for i, (background, _text) in enumerate(choices.items()):
            self.add_item(QuizButton(label=button_labels[i], choice_background=background))

