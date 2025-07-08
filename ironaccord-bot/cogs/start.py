import asyncio
import discord
from discord import app_commands
from discord.ext import commands

from ai.mixtral_agent import MixtralAgent
from utils.embed import simple
from models import database as db
from models import player_service


class StartCog(commands.Cog):
    def __init__(self, bot: commands.Bot) -> None:
        self.bot = bot

    @app_commands.command(name="start", description="Begin your adventure")
    async def start(self, interaction: discord.Interaction):
        # Generate a short intro using the Mixtral agent
        agent = MixtralAgent()
        loop = asyncio.get_running_loop()
        intro = await loop.run_in_executor(None, agent.query,
                                            "Provide a one sentence intro to welcome a new player.")
        embed = simple(intro)
        view = IntroView(interaction.user)
        await interaction.response.send_message(embed=embed, view=view, ephemeral=True)


class IntroView(discord.ui.View):
    def __init__(self, user: discord.User) -> None:
        super().__init__()
        self.user = user

    @discord.ui.button(label="Begin", style=discord.ButtonStyle.primary)
    async def begin(self, interaction: discord.Interaction, button: discord.ui.Button):
        if interaction.user.id != self.user.id:
            await interaction.response.send_message("This is not your prompt.", ephemeral=True)
            return
        embed = simple("Choose your faction")
        view = FactionView(self.user)
        await interaction.response.edit_message(embed=embed, view=view)


class FactionView(discord.ui.View):
    def __init__(self, user: discord.User) -> None:
        super().__init__()
        self.user = user

    async def _set_faction(self, interaction: discord.Interaction, faction: str):
        discord_id = str(self.user.id)
        name = self.user.name
        res = await db.query('SELECT id FROM players WHERE discord_id = %s', [discord_id])
        if res['rows']:
            await player_service.store_faction(discord_id, faction)
        else:
            await db.query(
                'INSERT INTO players (discord_id, name, faction) VALUES (%s, %s, %s)',
                [discord_id, name, faction]
            )
        embed = simple(f"Welcome to the {faction}!", [{"name": "Next Step", "value": "Select one stat to increase."}])
        view = StatSelectView(self.user)
        await interaction.response.edit_message(embed=embed, view=view)

    @discord.ui.button(label="Iron Accord", style=discord.ButtonStyle.primary)
    async def iron(self, interaction: discord.Interaction, button: discord.ui.Button):
        await self._set_faction(interaction, "Iron Accord")

    @discord.ui.button(label="Neon Dharma", style=discord.ButtonStyle.secondary)
    async def neon(self, interaction: discord.Interaction, button: discord.ui.Button):
        await self._set_faction(interaction, "Neon Dharma")


class StatSelect(discord.ui.Select):
    def __init__(self, user: discord.User) -> None:
        options = [
            discord.SelectOption(label='Might', value='MGT'),
            discord.SelectOption(label='Agility', value='AGI'),
            discord.SelectOption(label='Fortitude', value='FOR'),
            discord.SelectOption(label='Intuition', value='INTU'),
            discord.SelectOption(label='Resolve', value='RES'),
            discord.SelectOption(label='Ingenuity', value='ING'),
        ]
        super().__init__(custom_id='stat_select', placeholder='Choose a stat', min_values=1, max_values=1, options=options)
        self.user = user

    async def callback(self, interaction: discord.Interaction):
        if interaction.user.id != self.user.id:
            await interaction.response.send_message("This menu isn't for you.", ephemeral=True)
            return
        await player_service.store_stat_selection(str(self.user.id), list(self.values))
        embed = simple('Character creation complete!', [{"name": "Commands", "value": "Use /help to view commands."}])
        await interaction.response.edit_message(embed=embed, view=None)


class StatSelectView(discord.ui.View):
    def __init__(self, user: discord.User) -> None:
        super().__init__()
        self.add_item(StatSelect(user))


async def setup(bot: commands.Bot):
    await bot.add_cog(StartCog(bot))
