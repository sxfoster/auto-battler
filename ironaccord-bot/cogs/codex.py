import discord
from discord import app_commands
from discord.ext import commands

from models import database as db
from utils.embed import simple
from ai.mixtral_agent import MixtralAgent

class CodexCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot
        self.group = app_commands.Group(name='codex', description='Codex commands')
        self.group.command(name='list', description='Display your unlocked codex entries')(self.list)
        self.group.command(name='view', description='View a codex entry')(self.view)
        bot.tree.add_command(self.group)

    async def list(self, interaction: discord.Interaction):
        player_res = await db.query('SELECT id FROM players WHERE discord_id = %s', [str(interaction.user.id)])
        if not player_res['rows']:
            await interaction.response.send_message(embed=simple('You have no character.'), ephemeral=True)
            return
        player_id = player_res['rows'][0]['id']
        entries_res = await db.query('SELECT entry_key FROM codex_entries WHERE player_id = %s', [player_id])
        entries = [r['entry_key'] for r in entries_res['rows']]
        value = ', '.join(entries) if entries else 'None'
        await interaction.response.send_message(embed=simple('Codex', [{"name": 'Entries', "value": value}]), ephemeral=True)

    async def view(self, interaction: discord.Interaction, entry: str):
        player_res = await db.query('SELECT id FROM players WHERE discord_id = %s', [str(interaction.user.id)])
        if not player_res['rows']:
            await interaction.response.send_message(embed=simple('You have no character.'), ephemeral=True)
            return
        player_id = player_res['rows'][0]['id']
        check = await db.query('SELECT 1 FROM codex_entries WHERE player_id = %s AND entry_key = %s', [player_id, entry])
        if not check['rows']:
            await interaction.response.send_message(embed=simple('Entry not unlocked.'), ephemeral=True)
            return
        from data.codex import CODEX
        codex_data = CODEX.get(entry)
        if not codex_data:
            await interaction.response.send_message(embed=simple('Entry not found.'), ephemeral=True)
            return
        narrative = codex_data.get('narrative', 'No lore available.')
        embed = simple(codex_data['name'], [{"name": "Lore", "value": narrative}])
        try:
            agent = MixtralAgent()
            prompt = (
                f"As a weary member of the Iron Accord, I'm reading the Codex entry for '{codex_data['name']}'. "
                f"The entry says: '{narrative}'. Generate a single, short paragraph of my character's personal, gritty thoughts or memories about this."
            )
            reflection = agent.query(prompt)
            embed.add_field(name="Personal Reflection", value=f"_{reflection}_", inline=False)
        except Exception:
            pass
        await interaction.response.send_message(embed=embed, ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(CodexCog(bot))

