import os
import sys
import asyncio
import discord
from discord.ext import commands
from dotenv import load_dotenv

from ironaccord_bot.services.rag_service import RAGService
from ironaccord_bot.services.player_service import PlayerService
from ironaccord_bot.cogs.game_commands_cog import GameCommandsCog

dotenv_path = os.path.join(sys.path[0], '.env')
load_dotenv(dotenv_path=dotenv_path)

DISCORD_TOKEN = os.getenv("DISCORD_TOKEN")
OLLAMA_ENDPOINT = os.getenv("OLLAMA_ENDPOINT")

intents = discord.Intents.default()
intents.message_content = True

class IronAccordBot(commands.Bot):
    def __init__(self):
        super().__init__(command_prefix="!", intents=intents)
        self.rag_service = RAGService(ollama_endpoint=OLLAMA_ENDPOINT)
        self.player_service = PlayerService()

    async def setup_hook(self):
        """A hook that is called when the bot is setting up."""
        print("[Bot] Running setup hook...")
        await self.add_cog(GameCommandsCog(self, self.rag_service, self.player_service))
        print("[Bot] Cogs loaded.")

    async def on_ready(self):
        """Event that is called when the bot is ready and connected to Discord."""
        print(f'[Bot] Logged in as {self.user} (ID: {self.user.id})')
        print('[Bot] ------')

async def start_bot():
    """The main function to run the bot."""
    if not DISCORD_TOKEN:
        print("[Bot] Error: DISCORD_TOKEN is not set in the .env file.")
        return

    if not OLLAMA_ENDPOINT:
        print("[Bot] Error: OLLAMA_ENDPOINT is not set in the .env file.")
        return

    bot = IronAccordBot()
    await bot.start(DISCORD_TOKEN)

if __name__ == "__main__":
    try:
        asyncio.run(start_bot())
    except KeyboardInterrupt:
        print("[Bot] Shutdown signal received.")
