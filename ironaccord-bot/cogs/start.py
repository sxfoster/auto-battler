import discord
from discord.ext import commands
from discord import app_commands

from views.adventure_view import AdventureView
from ai.ai_agent import AIAgent
import asyncio


class StartCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot
        self.agent = AIAgent()
        # Access the shared RAG service from the bot
        self.rag_service = getattr(bot, "rag_service", None)

    @app_commands.command(name="start", description="Begin your journey in the world of Iron Accord.")
    async def start(self, interaction: discord.Interaction):
        # Give the LLM time to respond
        await interaction.response.defer(ephemeral=True)

        user_name = interaction.user.display_name

        character_name = "Edraz"

        summary = self.rag_service.get_character_section(character_name, "Summary") if self.rag_service else ""
        physical_desc = self.rag_service.get_character_section(character_name, "Physical Description") if self.rag_service else ""
        personality = self.rag_service.get_character_section(character_name, "Personality & Mannerisms") if self.rag_service else ""

        character_brief = f"""
**Character Summary:**
{summary}

**Visual Appearance:**
{physical_desc}

**Behavior and Personality:**
{personality}
"""

        prompt = f"""System: You are the Lore Weaver, a master storyteller for a steampunk tabletop RPG. Your task is to introduce a key character to the player. Use the detailed brief below to craft a compelling narrative description. Do not simply list the details; weave them into a story.

---
**CHARACTER BRIEF**
{character_brief}
---

**TASK**
The player has just entered the Iron Accord's command center. They see {character_name} for the first time, standing over a holographic map table that casts a blue glow on his face. Describe the scene, focusing on the character's appearance, demeanor, and the overall atmosphere of the room."""

        narrative_text = await self.agent.get_narrative(prompt)

        embed = discord.Embed(
            title=f"The Adventure of {user_name}",
            description=narrative_text,
            color=discord.Color.dark_gold()
        )

        view = AdventureView(agent=self.agent, user=interaction.user)
        # Start prefetching the next phase in the background
        asyncio.create_task(view._prefetch_for_phase(2))
        await interaction.followup.send(embed=embed, view=view, ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(StartCog(bot))
