import discord
from discord.ext import commands
from discord import app_commands

from ai.ai_agent import AIAgent




class CharacterPromptModal(discord.ui.Modal):
    """Prompt the player to describe their character."""

    def __init__(self, cog: "StartCog") -> None:
        super().__init__(title="Welcome to Iron Accord")
        self.cog = cog
        self.description = discord.ui.TextInput(
            label=(
                "Tell me about the person you want to be. "
                "What is their name? What do they look like? What drives them?"
            ),
            style=discord.TextStyle.paragraph,
            max_length=500,
        )
        self.add_item(self.description)

    async def on_submit(self, interaction: discord.Interaction) -> None:
        await interaction.response.defer(ephemeral=True, thinking=True)
        await self.cog.handle_character_description(interaction, self.description.value)


class StartCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot
        self.agent = AIAgent()
        self.rag_service = getattr(bot, "rag_service", None)


    @app_commands.command(name="start", description="Begin your journey in the world of Iron Accord.")
    async def start(self, interaction: discord.Interaction):
        """Begin the character creation flow."""
        modal = CharacterPromptModal(self)
        await interaction.response.send_modal(modal)

    async def handle_character_description(self, interaction: discord.Interaction, text: str) -> None:
        """Receive the player's free-text character description."""
        # Store or process ``text`` for the next phase. For now we simply acknowledge receipt.
        await interaction.followup.send("Character description recorded.", ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(StartCog(bot))
