import asyncio
import discord
import logging
from typing import List, Dict

logger = logging.getLogger(__name__)


class MissionView(discord.ui.View):
    """A view to display mission choices to the player."""

    def __init__(self, mission_service, user_id: int, text: str, choices: List[Dict]):
        super().__init__(timeout=600)
        self.mission_service = mission_service
        self.user_id = user_id

        # Format the message to include all choices in-text
        choice_lines = []
        for idx, choice_data in enumerate(choices):
            label = chr(65 + idx)  # A, B, C
            choice_text = choice_data.get("text", "Invalid Choice")
            choice_lines.append(f"**{label}.** {choice_text}")
            self.add_item(
                self.MissionButton(
                    label=label,
                    custom_id=f"mission_choice:{choice_data.get('id', idx)}",
                    choice_data=choice_data,
                )
            )

        formatted_choices = "\n".join(choice_lines)
        self.message_text = f"{text}\n\n{formatted_choices}" if formatted_choices else text

    class MissionButton(discord.ui.Button):
        def __init__(self, label: str, custom_id: str, choice_data: Dict):
            super().__init__(
                label=label,
                style=discord.ButtonStyle.secondary,
                custom_id=custom_id,
            )
            self.choice_data = choice_data

        async def callback(self, interaction: discord.Interaction):
            view: "MissionView" = self.view
            if interaction.user.id != view.user_id:
                await interaction.response.send_message(
                    "This is not your mission.", ephemeral=True
                )
                return
            
            # Disable all buttons to prevent multiple selections
            for item in view.children:
                item.disabled = True
            await interaction.response.edit_message(
                content="*Deciding what happens next...*", view=view
            )

            choice_text = self.choice_data.get("text", "No choice text found.")
            mechanics = await view.mission_service._resolve_action_mechanics(
                view.user_id, choice_text
            )

            if not mechanics:
                await interaction.edit_original_response(
                    content="An error occurred while processing your action.",
                    view=None,
                )
                view.stop()
                return

            await interaction.edit_original_response(
                content=mechanics.get("outcome_summary", "..."), view=view
            )

            async def update_with_full_narrative():
                narrative = await view.mission_service._generate_narrative_description(
                    view.user_id, choice_text, mechanics
                )
                if narrative is None:
                    await interaction.edit_original_response(
                        content="An error occurred while generating the narrative.",
                        view=None,
                    )
                    return

                new_choices = [
                    {"id": idx + 1, "text": text}
                    for idx, text in enumerate(mechanics.get("new_choices", []))
                ]
                new_view = MissionView(
                    mission_service=view.mission_service,
                    user_id=view.user_id,
                    text=narrative,
                    choices=new_choices,
                )
                await interaction.edit_original_response(
                    content=new_view.message_text, view=new_view
                )

            asyncio.create_task(update_with_full_narrative())
            view.stop()
