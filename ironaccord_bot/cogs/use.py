import discord
from discord import app_commands
from discord.ext import commands

from models import mission_service, item_service
from utils.embed import simple

class UseCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @app_commands.command(name='use', description='Use an equipped item (reduces durability)')
    async def use(self, interaction: discord.Interaction):
        player_id = await mission_service.get_player_id(str(interaction.user.id))
        if not player_id:
            await interaction.response.send_message(embed=simple('You have no character.'), ephemeral=True)
            return
        await item_service.reduce_durability(player_id, 1)
        await interaction.response.send_message(embed=simple('You used the item.'), ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(UseCog(bot))

