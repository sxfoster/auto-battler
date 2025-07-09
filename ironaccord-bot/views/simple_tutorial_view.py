import discord
from ai.mixtral_agent import MixtralAgent
from utils.async_utils import run_blocking


class SimpleTutorialView(discord.ui.View):
    def __init__(self, agent: MixtralAgent):
        super().__init__(timeout=300)  # 5 minute timeout
        self.agent = agent
        self.phase = 1  # Start at Phase 1

    @discord.ui.button(label="Begin", style=discord.ButtonStyle.success)
    async def continue_button(self, interaction: discord.Interaction, button: discord.ui.Button):
        # Defer immediately to handle any LLM slowness
        await interaction.response.defer()

        self.phase += 1

        # Define the prompts for each phase
        prompts = {
            2: "As a narrator, describe the history of the Machine War and the Great Stand to a new player who has just entered the world.",
            3: "As a narrator, explain the two opposing factions that emerged after the war: the tech-rejecting Iron Accord and the tech-embracing Neon Dharma. Frame it so the player understands the core conflict.",
            4: "The player has chosen the Iron Accord. As a narrator, describe the city of Brasshaven, using sensory details like soot, steam, and the sound of forges. Make it feel like a real, gritty place."
        }

        if self.phase > 4:
            # End of the simple tutorial
            button.disabled = True
            await interaction.followup.send("The story will continue...", ephemeral=True)
            await interaction.edit_original_response(view=self)
            return

        # Get the new prompt and update the button label
        prompt = prompts.get(self.phase)
        button.label = "Continue"

        # Generate the next piece of the story
        narrative_text = await run_blocking(
            self.agent.query,
            prompt,
            context=f"start_tutorial_phase_{self.phase}"
        )

        # Create a new embed for the next phase
        embed = discord.Embed(
            title=f"The Story Unfolds... (Part {self.phase})",
            description=narrative_text,
            color=discord.Color.orange()
        )

        # Send the new embed as a followup and update the original message with the button
        await interaction.followup.send(embed=embed, ephemeral=True)
        await interaction.edit_original_response(view=self)
