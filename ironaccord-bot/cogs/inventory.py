import discord
from discord import app_commands
from discord.ext import commands

from models import database as db
from utils.embed import simple

class InventoryCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @app_commands.command(name="inventory", description="View your equipped items and backpack")
    async def inventory(self, interaction: discord.Interaction):
        discord_id = str(interaction.user.id)
        player_res = await db.query('SELECT id, equipped_weapon_id, equipped_armor_id, equipped_ability_id FROM players WHERE discord_id = %s', [discord_id])
        if not player_res['rows']:
            await interaction.response.send_message(embed=simple('You have no character.'), ephemeral=True)
            return
        player = player_res['rows'][0]
        player_id = player['id']
        weapon_res, armor_res, ability_res = await db.query('SELECT id, name FROM user_weapons WHERE player_id = %s', [player_id]), await db.query('SELECT id, name FROM user_armors WHERE player_id = %s', [player_id]), await db.query('SELECT id, name FROM user_ability_cards WHERE player_id = %s', [player_id])
        weapons = weapon_res['rows']
        armors = armor_res['rows']
        abilities = ability_res['rows']
        equipped_weapon = next((w for w in weapons if w['id'] == player['equipped_weapon_id']), None)
        equipped_armor = next((a for a in armors if a['id'] == player['equipped_armor_id']), None)
        equipped_ability = next((a for a in abilities if a['id'] == player['equipped_ability_id']), None)
        embed = simple('Inventory', [
            {"name": "Equipped Weapon", "value": equipped_weapon['name'] if equipped_weapon else 'None', "inline": True},
            {"name": "Equipped Armor", "value": equipped_armor['name'] if equipped_armor else 'None', "inline": True},
            {"name": "Equipped Ability", "value": equipped_ability['name'] if equipped_ability else 'None', "inline": True},
            {"name": "Weapons", "value": ', '.join(w['name'] for w in weapons) or 'None'},
            {"name": "Armors", "value": ', '.join(a['name'] for a in armors) or 'None'},
            {"name": "Ability Cards", "value": ', '.join(a['name'] for a in abilities) or 'None'}
        ])
        await interaction.response.send_message(embed=embed, ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(InventoryCog(bot))

