import discord
from discord import app_commands
from discord.ext import commands

from ..models import database as db
from ..models import character_service
from ..utils.embed import simple

class CharacterCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot
        self.group = app_commands.Group(name="character", description="Character management")
        self.group.command(name="create", description="Create a new character")(
            self.create
        )
        self.group.command(name="view", description="View your character stats")(
            self.view
        )
        bot.tree.add_command(self.group)

    async def create(self, interaction: discord.Interaction, faction: str):
        discord_id = str(interaction.user.id)
        name = interaction.user.name
        res = await db.query('SELECT id FROM players WHERE discord_id = %s', [discord_id])
        if res['rows']:
            await interaction.response.send_message(embed=simple('Character already exists.'), ephemeral=True)
            return
        await db.query('INSERT INTO players (discord_id, name) VALUES (%s, %s)', [discord_id, name])
        menu = discord.ui.Select(custom_id='stat_select', placeholder='Choose a stat', options=[
            discord.SelectOption(label='Might', value='MGT'),
            discord.SelectOption(label='Agility', value='AGI'),
            discord.SelectOption(label='Fortitude', value='FOR'),
            discord.SelectOption(label='Intuition', value='INTU'),
            discord.SelectOption(label='Resolve', value='RES'),
            discord.SelectOption(label='Ingenuity', value='ING')
        ])
        view = discord.ui.View()
        view.add_item(menu)
        embed = simple(f"Welcome to the {faction}!", [
            {"name": "Next Step", "value": "Select one stat to increase by +1."}
        ])
        await interaction.response.send_message(embed=embed, view=view, ephemeral=True)

    async def view(self, interaction: discord.Interaction):
        sheet = await character_service.get_character_sheet(str(interaction.user.id))
        if not sheet:
            await interaction.response.send_message(embed=simple('You have no character.'), ephemeral=True)
            return
        stats = '\n'.join(f"{k}: {v}" for k, v in sheet['stats'].items())
        gear = '\n'.join([
            f"\U0001F5E1 {sheet['gear']['weapon'] or 'None'}",
            f"\U0001F6E1 {sheet['gear']['armor'] or 'None'}",
            f"\U0001F4DC {sheet['gear']['ability'] or 'None'}"
        ])
        flags = ', '.join(sheet['flags']) or 'None'
        codex = ', '.join(sheet['codex']) or 'None'
        embed = simple('Character Sheet', [
            {"name": "Level", "value": str(sheet['level']), "inline": True},
            {"name": "Stats", "value": stats},
            {"name": "Equipped Gear", "value": gear},
            {"name": "Active Effects", "value": flags},
            {"name": "Codex", "value": codex}
        ])
        await interaction.response.send_message(embed=embed, ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(CharacterCog(bot))

