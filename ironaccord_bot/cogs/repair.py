import discord
from discord import app_commands
from discord.ext import commands

from ironaccord_bot.utils.embed import simple
from ironaccord_bot.models import mission_service, player_service, database as db

class RepairCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @app_commands.command(name='repair', description='Repair all of your gear')
    async def repair(self, interaction: discord.Interaction):
        player_id = await mission_service.get_player_id(str(interaction.user.id))
        if not player_id:
            await interaction.response.send_message(embed=simple('You have no character.'), ephemeral=True)
            return
        state = await player_service.get_player_state(player_id)
        if state != 'idle':
            await interaction.response.send_message(embed=simple('You are busy and cannot repair right now.'), ephemeral=True)
            return
        await db.query('UPDATE user_weapons SET durability = 100 WHERE player_id = %s', [player_id])
        await db.query('UPDATE user_armors SET durability = 100 WHERE player_id = %s', [player_id])
        await db.query('UPDATE user_ability_cards SET durability = 100 WHERE player_id = %s', [player_id])
        await interaction.response.send_message(embed=simple('All equipment repaired!'), ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(RepairCog(bot))

