import discord
from discord import app_commands
from discord.ext import commands
import asyncio

# We will pass our services to this cog when we load it
from services.rag_service import RAGService
from services.player_service import PlayerService

class GameCommandsCog(commands.Cog):
    def __init__(self, bot: commands.Bot, rag_service: RAGService, player_service: PlayerService):
        self.bot = bot
        self.rag_service = rag_service
        self.player_service = player_service
        print("GameCommandsCog loaded.")

    # Helper function to run a synchronous function in a separate thread.
    # This prevents the AI query from blocking the bot's event loop.
    async def run_sync_query(self, query_fn, *args):
        return await asyncio.to_thread(query_fn, *args)

    @app_commands.command(name="lore", description="Ask Edraz a question about the world's lore.")
    async def lore(self, interaction: discord.Interaction, query: str):
        """Asks a question to the Lore Weaver AI."""
        await interaction.response.defer(ephemeral=True)
        print(f"Received lore query: '{query}'")

        # Build a more descriptive query so the RAG system understands this is
        # about the Iron Accord setting rather than a generic term.
        prompt_template = (
            "Within the context of the steampunk fantasy game world known as 'Iron Accord', "
            "please answer the following question: \"{user_query}\""
        )
        enhanced_query = prompt_template.format(user_query=query)
        print(f"Enhanced query for RAG: '{enhanced_query}'")

        # CORRECTED: The RAG service query is now run in a non-blocking way.
        result = await self.run_sync_query(self.rag_service.query, enhanced_query)
        answer = result.get("answer", "I do not have an answer for that.")
        await interaction.followup.send(f"**Query:** {query}\n**Answer:** {answer}", ephemeral=True)

    @commands.command(name="status")
    async def status(self, ctx: commands.Context):
        """Checks your current status."""
        user_id = ctx.author.id
        current_status = self.player_service.get_player_status(user_id)
        await ctx.send(f"Your current status is: **{current_status}**")

    @commands.command(name="mission")
    async def mission(self, ctx: commands.Context):
        """Requests a new mission from the Iron Accord."""
        async with ctx.typing():
            user_id = ctx.author.id
            mission_prompt = "Generate a simple, one-sentence mission objective for a new warrior of the Iron Accord."
            
            # CORRECTED: The RAG service query is now run in a non-blocking way.
            result = await self.run_sync_query(self.rag_service.query, mission_prompt)
            mission_objective = result.get("answer", "Patrol the walls of Brasshaven.") # Fallback mission

            # Update the player's status
            self.player_service.set_player_status(user_id, mission_objective)

            await ctx.send(f"A new directive comes in from the Accord...\n**Your new mission is:** {mission_objective}")

async def setup(bot: commands.Bot):
    # This setup function is called when the cog is loaded
    rag_service = bot.rag_service
    player_service = bot.player_service
    await bot.add_cog(GameCommandsCog(bot, rag_service, player_service))
