import discord
from discord import app_commands
from discord.ext import commands
import requests

from utils.async_utils import run_blocking

from models import database as db
from models.audit_service import log_auth_fail
from utils.embed import simple
from ai.mixtral_agent import MixtralAgent

class GmCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot
        self.group = app_commands.Group(name='gm', description='Game master tools')
        self.group.command(name='reset')(self.reset)
        codex = app_commands.Group(name='codex', description='Codex commands')
        codex.command(name='unlock')(self.codex_unlock)
        self.group.add_command(codex)
        flag = app_commands.Group(name='flag', description='Flag commands')
        flag.command(name='set')(self.flag_set)
        self.group.add_command(flag)
        self.group.command(name='narrate')(self.narrate)
        bot.tree.add_command(self.group)

    def is_gm(self, interaction: discord.Interaction) -> bool:
        member = interaction.guild.get_member(interaction.user.id) if interaction.guild else None
        roles = member.roles if member else []
        return any(r.name in ('GM', 'Developer') for r in roles)

    async def reset(self, interaction: discord.Interaction, player: discord.User):
        if not self.is_gm(interaction):
            await log_auth_fail(interaction.user, 'gm reset')
            await interaction.response.send_message('Unauthorized.', ephemeral=True)
            return
        rows = await db.query('SELECT id FROM players WHERE discord_id = %s', [str(player.id)])
        if not rows['rows']:
            await interaction.response.send_message(embed=simple('Player not found.'), ephemeral=True)
            return
        player_id = rows['rows'][0]['id']
        tables = ['user_stats','user_weapons','user_armors','user_ability_cards','user_flags','codex_entries','mission_log']
        for t in tables:
            await db.query(f'DELETE FROM {t} WHERE player_id = %s', [player_id])
        await db.query('DELETE FROM players WHERE id = %s', [player_id])
        await interaction.response.send_message(embed=simple('Player reset.'), ephemeral=True)

    async def codex_unlock(self, interaction: discord.Interaction, player: discord.User, entry: str):
        if not self.is_gm(interaction):
            await log_auth_fail(interaction.user, 'gm codex unlock')
            await interaction.response.send_message('Unauthorized.', ephemeral=True)
            return
        rows = await db.query('SELECT id FROM players WHERE discord_id = %s', [str(player.id)])
        if not rows['rows']:
            await interaction.response.send_message(embed=simple('Player not found.'), ephemeral=True)
            return
        player_id = rows['rows'][0]['id']
        await db.query('INSERT INTO codex_entries (player_id, entry_key) VALUES (%s, %s) ON DUPLICATE KEY UPDATE unlocked_at = NOW()', [player_id, entry])
        await interaction.response.send_message(embed=simple('Codex updated.'), ephemeral=True)

    async def flag_set(self, interaction: discord.Interaction, player: discord.User, flag_id: str):
        if not self.is_gm(interaction):
            await log_auth_fail(interaction.user, 'gm flag set')
            await interaction.response.send_message('Unauthorized.', ephemeral=True)
            return
        rows = await db.query('SELECT id FROM players WHERE discord_id = %s', [str(player.id)])
        if not rows['rows']:
            await interaction.response.send_message(embed=simple('Player not found.'), ephemeral=True)
            return
        player_id = rows['rows'][0]['id']
        await db.query('INSERT INTO user_flags (player_id, flag) VALUES (%s, %s) ON DUPLICATE KEY UPDATE timestamp = CURRENT_TIMESTAMP', [player_id, flag_id])
        await interaction.response.send_message(embed=simple('Flag applied.'), ephemeral=True)

    async def narrate(self, interaction: discord.Interaction, prompt: str):
        if not self.is_gm(interaction):
            await log_auth_fail(interaction.user, 'gm narrate')
            await interaction.response.send_message('Unauthorized.', ephemeral=True)
            return

        # Immediately defer to avoid the 3-second interaction timeout.
        await interaction.response.defer(ephemeral=True, thinking=True)

        agent = MixtralAgent()

        # Append a strict instruction so the LLM replies with only one concise paragraph.
        constrained_prompt = (
            f"{prompt}\n\n"
            f"(IMPORTANT: Your entire response MUST be a single, concise paragraph. "
            f"Do not write a second paragraph.)"
        )

        try:
            # Run the blocking request in a thread so the bot stays responsive.
            text = await run_blocking(agent.query, constrained_prompt)
        except requests.exceptions.ConnectionError:
            print("LOG: Failed to connect to the Mixtral/LLM server.")
            text = (
                "Error: Could not connect to the narration service. Is the LLM server running?"
            )
        except Exception as exc:
            print(f"Error in /gm narrate command: {exc}")
            text = "An unexpected error occurred during narration."

        await interaction.followup.send(text)

async def setup(bot: commands.Bot):
    await bot.add_cog(GmCog(bot))

