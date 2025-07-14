import discord
from discord.ext import commands

# We will pass our services to this cog when we load it
from services.rag_service import RAGService
from services.player_service import PlayerService

class GameCommandsCog(commands.Cog):
    def __init__(self, bot: commands.Bot, rag_service: RAGService, player_service: PlayerService):
        self.bot = bot
        self.rag_service = rag_service
        self.player_service = player_service
        print("GameCommandsCog loaded.")

    @commands.command(name="lore")
    async def lore(self, ctx: commands.Context, *, query: str):
        """Asks a question to the Lore Weaver AI."""
        async with ctx.typing():
            print(f"Received lore query: '{query}'")
            result = await self.rag_service.query(query)
            answer = result.get("answer", "I do not have an answer for that.")
            await ctx.send(f"**Query:** {query}\n**Answer:** {answer}")

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
            
            # Get the mission from our AI
            result = await self.rag_service.query(mission_prompt)
            mission_objective = result.get("answer", "Patrol the walls of Brasshaven.") # Fallback mission

            # Update the player's status
            self.player_service.set_player_status(user_id, mission_objective)

            await ctx.send(f"A new directive comes in from the Accord...\n**Your new mission is:** {mission_objective}")

async def setup(bot: commands.Bot):
    # This setup function is called when the cog is loaded
    # We will need to get our services from the bot instance
    rag_service = bot.rag_service
    player_service = bot.player_service
    await bot.add_cog(GameCommandsCog(bot, rag_service, player_service))
