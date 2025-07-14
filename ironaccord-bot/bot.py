import os
import sys
import asyncio
import discord
from discord.ext import commands
from dotenv import load_dotenv

# -- Start of Path Fix --
# This block of code ensures that the script can find its modules,
# no matter how it's run.
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
if PROJECT_ROOT not in sys.path:
    sys.path.append(PROJECT_ROOT)
# -- End of Path Fix --

from services.rag_service import RAGService
from services.player_service import PlayerService
from cogs.game_commands_cog import GameCommandsCog

# Load environment variables from .env file
load_dotenv()
DISCORD_TOKEN = os.getenv("DISCORD_TOKEN")
OLLAMA_ENDPOINT = os.getenv("OLLAMA_ENDPOINT")

# Define the intents for the bot
intents = discord.Intents.default()
intents.message_content = True

class IronAccordBot(commands.Bot):
    def __init__(self):
        super().__init__(command_prefix="!", intents=intents)
        self.rag_service = RAGService(ollama_endpoint=OLLAMA_ENDPOINT)
        self.player_service = PlayerService()

    async def setup_hook(self):
        """A hook that is called when the bot is setting up."""
        print("Running setup hook...")
        # Pass the services to the cog when initializing it
        await self.add_cog(GameCommandsCog(self, self.rag_service, self.player_service))
        print("Cogs loaded.")

    async def on_ready(self):
        """Event that is called when the bot is ready and connected to Discord."""
        print(f'Logged in as {self.user} (ID: {self.user.id})')
        print('------')

async def main():
    """The main function to run the bot."""
    if not DISCORD_TOKEN:
        print("Error: DISCORD_TOKEN is not set in the .env file.")
        return

    if not OLLAMA_ENDPOINT:
        print("Error: OLLAMA_ENDPOINT is not set in the .env file.")
        return
        
    bot = IronAccordBot()
    await bot.start(DISCORD_TOKEN)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Bot shutdown gracefully.")
