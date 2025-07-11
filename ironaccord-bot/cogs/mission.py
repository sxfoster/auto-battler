import json
from pathlib import Path
import discord
from discord import app_commands
from discord.ext import commands

from utils.embed import simple
from utils.mission_engine import resolve_choice
from models import mission_service

MISSIONS_PATH = Path(__file__).parent.parent / 'data' / 'missions'


class OptionView(discord.ui.View):
    """View presenting buttons for mission options."""

    class OptionButton(discord.ui.Button):
        def __init__(self, index: int, label: str):
            super().__init__(label=label, style=discord.ButtonStyle.primary)
            self.index = index

        async def callback(self, interaction: discord.Interaction) -> None:
            view: "OptionView" = self.view  # type: ignore[assignment]
            if interaction.user.id != view.user.id:
                await interaction.response.send_message(
                    "This is not your prompt.", ephemeral=True
                )
                return
            view.choice = self.index
            for child in view.children:
                child.disabled = True
            await interaction.response.edit_message(view=view)
            view.stop()

    def __init__(self, user: discord.User, options: list[dict]):
        super().__init__(timeout=120)
        self.user = user
        self.choice: int | None = None
        for idx, opt in enumerate(options):
            self.add_item(self.OptionButton(idx, opt.get("text", str(idx + 1))))

class MissionCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot
        self.group = app_commands.Group(name='mission', description='Mission commands')
        self.group.command(name='start', description='Start a mission')(self.start)
        self.group.command(name='create', description='Generate a mission')(self.create)
        bot.tree.add_command(self.group)

    def load_mission(self, name: str):
        file = MISSIONS_PATH / f'{name}.json'
        if not file.exists():
            return None
        with open(file, 'r', encoding='utf-8') as f:
            return json.load(f)

    async def start(self, interaction: discord.Interaction, name: str):
        mission = self.load_mission(name)
        if not mission:
            await interaction.response.send_message(embed=simple('Mission not found.'), ephemeral=True)
            return
        player_id = await mission_service.get_player_id(str(interaction.user.id))
        if not player_id:
            await interaction.response.send_message(embed=simple('You have no character.'), ephemeral=True)
            return
        thread = await interaction.channel.create_thread(name=mission['name'], auto_archive_duration=60)
        await thread.send(mission['intro'])
        log_id = await mission_service.start_mission(player_id, mission['id'])
        durability = 3
        for i, rnd in enumerate(mission['rounds']):
            opts = '\n'.join(f"{idx+1}. {o['text']}" for idx, o in enumerate(rnd['options']))
            view = OptionView(interaction.user, rnd['options'])
            await thread.send(f"{rnd['text']}\n{opts}", view=view)
            await view.wait()
            choice = view.choice if view.choice is not None else 0
            option = rnd['options'][choice]
            result = await resolve_choice(player_id, option)
            await thread.send(f"Outcome: {result['tier']}")
            mission_service.record_choice(log_id, i, choice, option.get('durability', 0))
            durability += option.get('durability', 0)
        outcome = 'success' if durability > 0 else 'fail'
        await mission_service.complete_mission(log_id, outcome, mission.get('rewards'), mission.get('codexFragment'), player_id)
        await thread.send(f"Mission complete with outcome: {outcome}")
        await interaction.response.send_message(embed=simple('Mission started! Check the thread.'), ephemeral=True)

    async def create(self, interaction: discord.Interaction):
        await interaction.response.defer(ephemeral=True)
        generator = getattr(self.bot, 'mission_generator', None)
        if not generator:
            await interaction.followup.send('Mission generator unavailable.', ephemeral=True)
            return
        context = await generator._collect_player_context(str(interaction.user.id))
        if context is None:
            await interaction.followup.send('Failed to load player context.', ephemeral=True)
            return
        mission = await generator.generate('default', '', context)
        if not mission:
            await interaction.followup.send('Failed to generate mission.', ephemeral=True)
            return
        pretty = json.dumps(mission, indent=2)
        await interaction.followup.send(f'```json\n{pretty}\n```', ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(MissionCog(bot))

