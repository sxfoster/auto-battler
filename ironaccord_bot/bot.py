import os
import sys
import asyncio
import discord
from discord.ext import commands
from dotenv import load_dotenv

from ironaccord_bot.services.rag_service import RAGService
from ironaccord_bot.services.player_service import PlayerService
from ironaccord_bot.cogs.game_commands_cog import GameCommandsCog
from ironaccord_bot.ai.ai_agent import AIAgent

dotenv_path = os.path.join(sys.path[0], '.env')
load_dotenv(dotenv_path=dotenv_path)

DISCORD_TOKEN = os.getenv("DISCORD_TOKEN")

intents = discord.Intents.default()
intents.message_content = True

class IronAccordBot(commands.Bot):
    def __init__(self):
        super().__init__(command_prefix="!", intents=intents)
        self.ai_agent = AIAgent()
        self.ollama_service = self.ai_agent.ollama_service
        self.rag_service = RAGService()
        self.player_service = PlayerService()
        self.redeploy = False
        
    async def setup_hook(self):
        """A hook that is called when the bot is setting up."""
        print("[Bot] Running setup hook...")
        await self.add_cog(GameCommandsCog(self, self.rag_service, self.player_service))
        print("[Bot] Cogs loaded.")

    async def on_ready(self):
        """Event that is called when the bot is ready and connected to Discord."""
        print(f'[Bot] Logged in as {self.user} (ID: {self.user.id})')
        print('[Bot] ------')

bot: IronAccordBot | None = None

async def on_ready():
    """Event handler dispatched when the bot becomes ready."""
    if bot is None:
        return
    print(f'[Bot] Logged in as {bot.user} (ID: {bot.user.id})')
    if getattr(bot, "redeploy", False):
        await bot.tree.clear_commands()
    await bot.tree.sync()

async def start_bot():
    """The main function to run the bot."""
    if not DISCORD_TOKEN:
        print("[Bot] Error: DISCORD_TOKEN is not set in the .env file.")
        return

    global bot
    bot = IronAccordBot()
    await bot.start(DISCORD_TOKEN)

if __name__ == "__main__":
    try:
        asyncio.run(start_bot())
    except KeyboardInterrupt:
        print("[Bot] Shutdown signal received.")
