import discord
from discord import app_commands
from discord.ext import commands

from ..models import database as db
from ..utils.embed import simple

class CodexCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @app_commands.command(name='codex', description='Display your unlocked codex entries')
    async def codex(self, interaction: discord.Interaction):
        player_res = await db.query('SELECT id FROM players WHERE discord_id = %s', [str(interaction.user.id)])
        if not player_res['rows']:
            await interaction.response.send_message(embed=simple('You have no character.'), ephemeral=True)
            return
        player_id = player_res['rows'][0]['id']
        entries_res = await db.query('SELECT entry_key FROM codex_entries WHERE player_id = %s', [player_id])
        entries = [r['entry_key'] for r in entries_res['rows']]
        value = ', '.join(entries) if entries else 'None'
        await interaction.response.send_message(embed=simple('Codex', [{"name": 'Entries', "value": value}]), ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(CodexCog(bot))

