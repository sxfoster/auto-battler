import asyncio
import os
import discord
from ai.mixtral_agent import MixtralAgent
from utils.async_utils import run_blocking

# Prompts used for each narrative phase
PROMPTS = {
    2: "As Edraz, tell {user_name} about the Machine War. Keep it dramatic but sprinkle in meta-commentary about it being 'classic video game backstory stuff'. Keep it brief.",
    3: "As Edraz, welcome {user_name} to the Iron Accord. Explain that in the city of Brasshaven, everyone has a role. Frame their first real choice not as 'which faction?', but 'what kind of survivor will you be?'. Introduce the choice between being a 'Brawler' (hands-on, forceful) or a 'Tinkerer' (clever, mechanical) using the buttons below.",
    4: "You have chosen the {player_class} class. As Edraz, give a brief, flavourful confirmation of their choice. Tell {user_name} that a local mechanic, Griz, needs help and that it's a good first test. Urge them to continue.",
    5: "As Edraz, narrate the beginning of the fight in Griz's workshop for {user_name}. Describe two clunky, sparking automatons turning towards them. The player easily dodges the first clumsy attack. End by prompting them to fight back by clicking the button.",
    6: "The player, {user_name}, attacks! As a {player_class}, narrate them landing a powerful, cinematic blow that staggers one of the automatons. Describe the sparks and crunching metal.",
    7: "As Edraz, narrate {user_name} finishing off both automatons in a cool final move. They are victorious! Griz is impressed. The narration should feel like a triumphant, over-the-top end to their first tutorial fight. Tell them their real journey is about to begin."
}


class AdventureView(discord.ui.View):
    def __init__(self, agent: MixtralAgent, user: discord.User):
        super().__init__(timeout=300)
        self.agent = agent
        self.user = user
        self.phase = 1
        self.player_class: str | None = None
        self.prefetch_task: asyncio.Task | None = None

        # add the first continue button
        self.add_item(self.ContinueButton())

    async def _prefetch_for_phase(self, phase: int) -> None:
        """Start generating text for the given phase in the background."""
        # During tests, avoid network requests by returning an already-completed task
        if os.getenv("PYTEST_CURRENT_TEST"):
            loop = asyncio.get_running_loop()
            fut = loop.create_future()
            fut.set_result("")
            self.prefetch_task = fut
            return

        user_name = self.user.display_name
        template = PROMPTS.get(phase)
        if not template:
            self.prefetch_task = None
            return

        prompt = template.format(user_name=user_name, player_class=self.player_class)
        context = f"adventure_phase_{phase}_user_{user_name}"
        self.prefetch_task = asyncio.create_task(
            run_blocking(self.agent.query, prompt, context)
        )

    async def _update_message_with_narrative(self, narrative_text: str, interaction: discord.Interaction) -> None:
        embed = discord.Embed(
            title=f"The Adventure of {self.user.display_name}",
            description=narrative_text,
            color=discord.Color.dark_gold()
        )
        await interaction.edit_original_response(embed=embed, view=self)

    # --- UI Components ---
    class ContinueButton(discord.ui.Button):
        def __init__(self):
            super().__init__(label="Continue", style=discord.ButtonStyle.success)

        async def callback(self, interaction: discord.Interaction):
            view: "AdventureView" = self.view
            if not view.prefetch_task:
                await interaction.response.send_message("No more content.", ephemeral=True)
                return

            self.disabled = True
            self.label = "Loading..."
            await interaction.response.edit_message(view=view)

            narrative_text = await view.prefetch_task
            view.phase += 1
            await view._update_message_with_narrative(narrative_text, interaction)

            # Schedule the next phase
            asyncio.create_task(view._prefetch_for_phase(view.phase + 1))

            if view.phase == 3:
                view.clear_items()
                view.add_item(view.ClassChoiceButton("Brawler", "\U0001F44A"))
                view.add_item(view.ClassChoiceButton("Tinkerer", "\U0001F527"))
            elif view.phase == 7:
                view.clear_items()
                view.add_item(discord.ui.Button(label="To be continued...", style=discord.ButtonStyle.secondary, disabled=True))
            else:
                self.disabled = False
                if view.phase == 5:
                    self.label = "Attack!"
                    self.style = discord.ButtonStyle.danger
                else:
                    self.label = "Continue"
                    self.style = discord.ButtonStyle.success

            await interaction.edit_original_response(view=view)

    class ClassChoiceButton(discord.ui.Button):
        def __init__(self, class_name: str, emoji: str):
            super().__init__(label=class_name, style=discord.ButtonStyle.primary, emoji=emoji)
            self.class_name = class_name

        async def callback(self, interaction: discord.Interaction):
            view: "AdventureView" = self.view
            view.player_class = self.class_name

            if not view.prefetch_task:
                await interaction.response.send_message("Error: Content not ready.", ephemeral=True)
                return

            for item in view.children:
                item.disabled = True
            await interaction.response.edit_message(view=view)

            narrative_text = await view.prefetch_task
            view.phase += 1  # phase becomes 4
            await view._update_message_with_narrative(narrative_text, interaction)

            asyncio.create_task(view._prefetch_for_phase(view.phase + 1))

            view.clear_items()
            view.add_item(view.ContinueButton())
            await interaction.edit_original_response(view=view)
