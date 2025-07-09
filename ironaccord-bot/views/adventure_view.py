import discord
from ai.mixtral_agent import MixtralAgent
from utils.async_utils import run_blocking


class AdventureView(discord.ui.View):
    def __init__(self, agent: MixtralAgent, user: discord.User) -> None:
        super().__init__(timeout=300)
        self.agent = agent
        self.user = user
        self.phase = 0
        self.player_class = None

        self.add_item(self.ContinueButton(self, label="Begin"))

    async def _get_narrative(self, prompt: str, interaction: discord.Interaction) -> None:
        """Query the LLM and update the message with the response."""
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
        await interaction.edit_original_response(embed=embed, view=self)

    async def _handle_next_phase(self, interaction: discord.Interaction) -> None:
        """Advance the adventure based on the current phase."""
        self.phase += 1
        user_name = self.user.display_name

        prompts = {
            1: f"Your persona is Deckard Cain/Deadpool. Start the story for a new player named {user_name}. Begin with 'The world burned under the march of metal', but then immediately break the fourth wall to introduce yourself as their witty guide through this whole... game thing.",
            2: f"As the narrator, tell {user_name} about the Machine War. Keep it dramatic but sprinkle in meta-commentary about it being 'classic video game backstory stuff'. Keep it brief.",
            3: f"Explain the two factions, Iron Accord and Neon Dharma, to {user_name}. Frame it as their first big choice. Tell them to 'pick a side' by clicking a button below, hinting that their choice has 'like, actual consequences... probably'.",
            4: f"The player {user_name} has chosen the {self.player_class} class. Describe them meeting an old, one-eyed mechanic named 'Griz' in Brasshaven. Griz needs them to handle a 'starter quest': clearing malfunctioning automatons from his workshop. Make Griz gruff but likable.",
            5: f"Narrate the beginning of the fight in Griz's workshop for {user_name}. Describe two clunky, sparking automatons turning towards them. The player easily dodges the first clumsy attack. End by prompting them to fight back by clicking the button.",
            6: f"The player, {user_name}, attacks! As a {self.player_class}, narrate them landing a powerful, cinematic blow that staggers one of the automatons. Describe the sparks and crunching metal.",
            7: f"Narrate {user_name} finishing off both automatons in a cool final move. They are victorious! Griz is impressed. The narration should feel like a triumphant, over-the-top end to their first tutorial fight. Tell them their real journey is about to begin."
        }

        if self.phase == 3:
            await self._get_narrative(prompts[self.phase], interaction)
            self.clear_items()
            self.add_item(self.ClassChoiceButton(self, "Brawler", "\U0001F44A"))
            self.add_item(self.ClassChoiceButton(self, "Tinkerer", "\U0001F527"))
            await interaction.edit_original_response(view=self)
        elif self.phase in prompts:
            await self._get_narrative(prompts[self.phase], interaction)
            if self.phase == 5:
                self.clear_items()
                self.add_item(self.ContinueButton(self, "Attack!", discord.ButtonStyle.danger))
            elif self.phase == 7:
                self.clear_items()
                self.add_item(discord.ui.Button(label="To be continued...", style=discord.ButtonStyle.secondary, disabled=True))
                await interaction.edit_original_response(view=self)
        else:
            await interaction.edit_original_response(content="Something went wrong.", view=None)

    # --- UI Components ---
    class ContinueButton(discord.ui.Button):
        def __init__(self, view: "AdventureView", label: str = "Continue", style: discord.ButtonStyle = discord.ButtonStyle.success) -> None:
            super().__init__(label=label, style=style)
            self.outer_view = view

        async def callback(self, interaction: discord.Interaction) -> None:
            self.disabled = True
            self.label = "Thinking..."
            await interaction.response.edit_message(view=self.outer_view)
            await self.outer_view._handle_next_phase(interaction)

    class ClassChoiceButton(discord.ui.Button):
        def __init__(self, view: "AdventureView", class_name: str, emoji: str) -> None:
            super().__init__(label=class_name, style=discord.ButtonStyle.primary, emoji=emoji)
            self.outer_view = view
            self.class_name = class_name

        async def callback(self, interaction: discord.Interaction) -> None:
            self.outer_view.player_class = self.class_name
            for item in self.outer_view.children:
                item.disabled = True
            await interaction.response.edit_message(view=self.outer_view)
            self.outer_view.clear_items()
            self.outer_view.add_item(self.outer_view.ContinueButton(self.outer_view, "Continue"))
            await self.outer_view._handle_next_phase(interaction)
