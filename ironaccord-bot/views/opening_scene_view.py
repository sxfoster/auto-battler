import json
import logging
import discord
from ai.ai_agent import AIAgent

logger = logging.getLogger(__name__)

class OpeningSceneView(discord.ui.View):
    """Interactive short story view using the Lore Weaver model."""

    def __init__(
        self,
        agent: AIAgent,
        scene: str,
        question: str,
        choices: list[str],
        turns: int = 3,
    ):
        super().__init__(timeout=300)
        self.agent = agent
        self.turns = turns
        self.turn = 1
        self.history = [f"{scene}\n\n{question}"]
        self.embed_title = "A Fateful Encounter"
        self._populate_buttons(choices)

    def _populate_buttons(self, choices: list[str]) -> None:
        self.clear_items()
        for idx, choice in enumerate(choices):
            self.add_item(self.ChoiceButton(choice, idx))

    async def _advance_story(self, choice: str) -> dict | None:
        """Send the next prompt to the Lore Weaver and parse the JSON result."""
        history_text = "\n".join(self.history)
        prompt = (
            "You are the Lore Weaver, continuing a short interactive tale.\n"
            f"Story so far:\n{history_text}\n\n"
            f"The player chose: {choice}\n"
            "Write the next scene in two or three sentences. End with a new"
            " question and three numbered choices. Return JSON with keys"
            " 'scene', 'question', and 'choices'."
        )
        try:
            text = await self.agent.get_narrative(prompt)
        except Exception as exc:  # pragma: no cover - network or model failure
            logger.error("Lore Weaver call failed: %s", exc, exc_info=True)
            return None

        try:
            data = json.loads(text)
        except json.JSONDecodeError:
            logger.error("Lore Weaver returned invalid JSON: %s", text)
            return None

        scene = data.get("scene", "")
        question = data.get("question", "")
        self.history.append(f"Player chose: {choice}\n{scene}\n\n{question}")
        self.turn += 1
        return data

    class ChoiceButton(discord.ui.Button):
        def __init__(self, text: str, idx: int):
            super().__init__(
                label=text,
                style=discord.ButtonStyle.primary,
                custom_id=f"opening_choice_{idx}",
            )
            self.choice_text = text

        async def callback(self, interaction: discord.Interaction) -> None:
            view: "OpeningSceneView" = self.view
            for item in view.children:
                item.disabled = True
            await interaction.response.edit_message(view=view)

            result = await view._advance_story(self.choice_text)
            if not result:
                await interaction.followup.send(
                    "An error occurred while continuing the story.", ephemeral=True
                )
                return

            scene = result.get("scene", "")
            question = result.get("question", "")
            choices = result.get("choices", [])

            embed = discord.Embed(
                title=view.embed_title,
                description=f"{scene}\n\n**{question}**",
                color=discord.Color.dark_gold(),
            )

            if view.turn > view.turns:
                # Story complete
                view.clear_items()
                embed.set_footer(text="The End")
            else:
                view._populate_buttons(choices)

            await interaction.message.edit(embed=embed, view=view)
