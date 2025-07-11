import discord
from discord.ext import commands
from discord import app_commands

from ai.ai_agent import AIAgent
from services.opening_scene_service import OpeningSceneService
from views.opening_scene_view import OpeningSceneView




class CharacterPromptModal(discord.ui.Modal):
    """Prompt the player to describe their character."""

    def __init__(self, cog: "StartCog") -> None:
        super().__init__(title="Welcome to Iron Accord")
        self.cog = cog
        self.description = discord.ui.TextInput(
            label="Character Description",
            placeholder=(
                "Tell me about the person you want to be. "
                "What is their name? What do they look like? "
                "What drives them?"
            ),
            style=discord.TextStyle.paragraph,
            max_length=500,
            required=True,
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

    async def handle_character_description(
        self, interaction: discord.Interaction, text: str
    ) -> None:
        """Generate the opening scene from the player's description."""

        service = OpeningSceneService(self.agent, self.rag_service)
        result = await service.generate_opening(text)

        if not result:
            await interaction.followup.send(
                "An error occurred while generating the scene.", ephemeral=True
            )
            return

        scene = result.get("scene", "")
        question = result.get("question", "")
        choices = result.get("choices", [])

        embed = discord.Embed(
            title="A Fateful Encounter",
            description=f"{scene}\n\n**{question}**",
            color=discord.Color.dark_gold(),
        )

        view = OpeningSceneView(self.agent, scene, question, choices)
        await interaction.followup.send(embed=embed, view=view, ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(StartCog(bot))
