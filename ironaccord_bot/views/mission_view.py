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
        self.message_text = text

        # Create a button for each choice using its text
        for choice_data in choices:
            label = choice_data.get("text", "Invalid Choice")
            self.add_item(self.MissionButton(label=label, choice_data=choice_data))

    class MissionButton(discord.ui.Button):
        def __init__(self, label: str, choice_data: Dict):
            super().__init__(label=label[:80], style=discord.ButtonStyle.secondary)
            self.choice_data = choice_data

        async def callback(self, interaction: discord.Interaction):
            view: "MissionView" = self.view
            if interaction.user.id != view.user_id:
                await interaction.response.send_message("This is not your mission.", ephemeral=True)
                return

            # Disable all buttons to prevent multiple selections
            for item in view.children:
                item.disabled = True
            await interaction.response.edit_message(view=view)

            result_text = await view.mission_service.make_mission_choice(view.user_id, self.choice_data)
            await interaction.followup.send(result_text, ephemeral=True)
            view.stop()

