import os
import sys
import asyncio
import discord
from discord.ext import commands
from dotenv import load_dotenv

# Add the project root to the path to allow for absolute imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Import our custom services
from services.rag_service import RAGService
from services.player_service import PlayerService
from ai.ai_agent import AIAgent

# --- Bot Setup ---
load_dotenv()
DISCORD_TOKEN = os.getenv("DISCORD_TOKEN")

intents = discord.Intents.default()
intents.message_content = True

class IronAccordBot(commands.Bot):
    def __init__(self):
        super().__init__(command_prefix="!", intents=intents)
        # Create instances of our services
        self.rag_service = RAGService()
        self.player_service = PlayerService()
        # Initialize the main AI agent
        self.ai_agent = AIAgent()
        # Expose the underlying ollama_service for convenience
        self.ollama_service = self.ai_agent.ollama_service
        # Flag used in tests to indicate the bot is being redeployed
        self.redeploy: bool = False

    async def on_ready(self):
        print(f'Logged in as {self.user} (ID: {self.user.id})')
        print('------')

    async def setup_hook(self):
        # This is the new way to load cogs in discord.py 2.0
        # It runs after the bot logs in but before it connects to the gateway.
        await self.load_extension("cogs.game_commands_cog")
        print("Cogs loaded.")
        await self.tree.sync()

bot = IronAccordBot()


@bot.event
async def on_ready():
    """Handle the bot ready event and optionally redeploy commands."""
    print(f'Logged in as {bot.user} (ID: {bot.user.id})')
    print('------')
    if getattr(bot, 'redeploy', False):
        await bot.tree.clear_commands()
    await bot.tree.sync()

if __name__ == "__main__":
    if DISCORD_TOKEN is None:
        print("FATAL: DISCORD_TOKEN not found in .env file.")
    else:
        bot.run(DISCORD_TOKEN)
