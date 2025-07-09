import discord
from ai.mixtral_agent import MixtralAgent
from utils.async_utils import run_blocking


class AdventureView(discord.ui.View):
    def __init__(self, agent: MixtralAgent, user: discord.User):
        super().__init__(timeout=300)
        self.agent = agent
        self.user = user
        self.phase = 1  # initial phase handled by the command
        self.player_class = None

        # add the first continue button
        self.add_item(self.ContinueButton())

    async def _get_narrative_and_update(self, prompt: str, interaction: discord.Interaction):
        """Generate narrative and edit the original message."""
        narrative_text = await run_blocking(
            self.agent.query,
            prompt,
            context=f"adventure_phase_{self.phase}_user_{self.user.display_name}"
        )
        embed = discord.Embed(
            title=f"The Adventure of {self.user.display_name}",
            description=narrative_text,
            color=discord.Color.dark_gold()
        )
        await interaction.response.edit_message(embed=embed, view=self)

    # --- UI Components ---

    class ContinueButton(discord.ui.Button):
        def __init__(self):
            super().__init__(label="Continue", style=discord.ButtonStyle.success)

        async def callback(self, interaction: discord.Interaction):
            view: "AdventureView" = self.view
            view.phase += 1

            # indicate thinking state
            self.disabled = True
            self.label = "Edraz is thinking..."
            await interaction.response.edit_message(view=view)

            user_name = view.user.display_name
            prompts = {
                2: f"As Edraz, tell {user_name} about the Machine War. Keep it dramatic but sprinkle in meta-commentary about it being 'classic video game backstory stuff'. Keep it brief.",
                3: f"As Edraz, explain the two factions, Iron Accord and Neon Dharma, to {user_name}. Frame it as their first big choice. Tell them to 'pick a side' by clicking a button below, hinting that their choice has 'like, actual consequences... probably'.",
                5: f"As Edraz, narrate the beginning of the fight in Griz's workshop for {user_name}. Describe two clunky, sparking automatons turning towards them. The player easily dodges the first clumsy attack. End by prompting them to fight back by clicking the button.",
                6: f"The player, {user_name}, attacks! As a {view.player_class}, narrate them landing a powerful, cinematic blow that staggers one of the automatons. Describe the sparks and crunching metal.",
                7: f"As Edraz, narrate {user_name} finishing off both automatons in a cool final move. They are victorious! Griz is impressed. The narration should feel like a triumphant, over-the-top end to their first tutorial fight. Tell them their real journey is about to begin."
            }

            if view.phase == 3:
                view.clear_items()
                view.add_item(view.ClassChoiceButton("Brawler", "\U0001F44A"))
                view.add_item(view.ClassChoiceButton("Tinkerer", "\U0001F527"))
                await view._get_narrative_and_update(prompts[view.phase], interaction)
            elif view.phase == 7:
                view.clear_items()
                view.add_item(discord.ui.Button(label="To be continued...", style=discord.ButtonStyle.secondary, disabled=True))
                await view._get_narrative_and_update(prompts[view.phase], interaction)
            elif view.phase in prompts:
                self.disabled = False
                if view.phase == 5:
                    self.label = "Attack!"
                    self.style = discord.ButtonStyle.danger
                else:
                    self.label = "Continue"
                    self.style = discord.ButtonStyle.success
                await view._get_narrative_and_update(prompts[view.phase], interaction)

    class ClassChoiceButton(discord.ui.Button):
        def __init__(self, class_name: str, emoji: str):
            super().__init__(label=class_name, style=discord.ButtonStyle.primary, emoji=emoji)
            self.class_name = class_name

        async def callback(self, interaction: discord.Interaction):
            view: "AdventureView" = self.view
            view.player_class = self.class_name
            view.phase = 4

            view.clear_items()
            thinking = discord.ui.Button(label="Edraz is thinking...", style=discord.ButtonStyle.secondary, disabled=True)
            view.add_item(thinking)
            await interaction.response.edit_message(view=view)

            prompt = f"The player {view.user.display_name} has chosen the {view.player_class} class. As Edraz, describe them meeting an old, one-eyed mechanic named 'Griz' in Brasshaven. Griz needs them to handle a 'starter quest': clearing malfunctioning automatons from his workshop. Make Griz gruff but likable."

            view.clear_items()
            view.add_item(view.ContinueButton())
            await view._get_narrative_and_update(prompt, interaction)
