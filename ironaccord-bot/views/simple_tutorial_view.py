import discord
from ai.ai_agent import AIAgent
from utils.async_utils import run_blocking


class SimpleTutorialView(discord.ui.View):
    def __init__(self, agent: AIAgent, user: discord.User):
        super().__init__(timeout=300)
        self.agent = agent
        self.user = user
        self.phase = 1

    @discord.ui.button(label="Begin", style=discord.ButtonStyle.success)
    async def continue_button(self, interaction: discord.Interaction, button: discord.ui.Button):
        button.disabled = True
        button.label = "Thinking..."
        await interaction.response.edit_message(view=self)

        self.phase += 1

        user_name = self.user.display_name

        prompts = {
            2: f"As a narrator, describe the history of the Machine War and the Great Stand to a new player named {user_name}.",
            3: f"As a narrator, explain the two opposing factions, the Iron Accord and Neon Dharma, to {user_name}, framing the core conflict.",
            4: f"{user_name} has chosen the Iron Accord. As a narrator, describe the city of Brasshaven using sensory details to make it feel real and gritty."
        }

        if self.phase > 4:
            button.label = "To be continued..."
            await interaction.edit_original_response(
                content="The story will continue...",
                embed=None,
                view=self
            )
            return

        prompt = prompts.get(self.phase)

        # Generate the next piece of the story
        narrative_text = await run_blocking(
            self.agent.query,
            prompt,
            context=f"start_tutorial_phase_{self.phase}_user_{user_name}"
        )

        button.disabled = False
        button.label = "Continue"

        embed = discord.Embed(
            title=f"The Story Unfolds... (Part {self.phase})",
            description=narrative_text,
            color=discord.Color.orange()
        )

        await interaction.edit_original_response(embed=embed, view=self)
