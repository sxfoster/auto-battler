import discord
from discord import app_commands
from discord.ext import commands

from ..models import database as db
from ..utils.embed import simple

class EquipCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @app_commands.command(name="equip", description="Equip an item by ID")
    @app_commands.describe(item_id="ID of the item", type="Item type")
    @app_commands.choices(type=[
        app_commands.Choice(name="Weapon", value="weapon"),
        app_commands.Choice(name="Armor", value="armor"),
        app_commands.Choice(name="Ability", value="ability")
    ])
    async def equip(self, interaction: discord.Interaction, type: app_commands.Choice[str], item_id: int):
        player_rows = await db.query('SELECT id FROM players WHERE discord_id = %s', [str(interaction.user.id)])
        if not player_rows['rows']:
            await interaction.response.send_message(embed=simple('You have no character.'), ephemeral=True)
            return
        player_id = player_rows['rows'][0]['id']
        table = 'user_weapons' if type.value == 'weapon' else 'user_armors' if type.value == 'armor' else 'user_ability_cards'
        column = 'equipped_weapon_id' if type.value == 'weapon' else 'equipped_armor_id' if type.value == 'armor' else 'equipped_ability_id'
        owned = await db.query(f'SELECT name FROM {table} WHERE id = %s AND player_id = %s', [item_id, player_id])
        if not owned['rows']:
            await interaction.response.send_message(embed=simple('You do not own that item.'), ephemeral=True)
            return
        await db.query(f'UPDATE players SET {column} = %s WHERE id = %s', [item_id, player_id])
        await interaction.response.send_message(embed=simple(f"Equipped {owned['rows'][0]['name']}!"), ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(EquipCog(bot))

