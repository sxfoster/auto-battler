import os
import os
import sys
import asyncio
import logging
from datetime import datetime

import discord
from discord.ext import commands
from dotenv import load_dotenv

from ironaccord_bot.services.rag_service import RAGService
from ironaccord_bot.services.player_service import PlayerService
from ironaccord_bot.ai.ai_agent import AIAgent
from ironaccord_bot.services.ollama_service import OllamaService

# --- Load Environment Variables ---
load_dotenv()
DISCORD_TOKEN = os.getenv("DISCORD_TOKEN")
COMMAND_PREFIX = os.getenv("COMMAND_PREFIX", "!")
DEBUG_GUILD_ID = int(os.getenv("DEBUG_GUILD_ID", 0))

# --- NEW: Add Status Channel ID ---
STATUS_CHANNEL_ID = 1386506958730690652

# --- Bot Definition ---
class IronAccordBot(commands.Bot):
    """The main bot class for Iron Accord."""

    def __init__(
        self,
        *,
        rag_service: RAGService | None = None,
        command_prefix: str = COMMAND_PREFIX,
        intents: discord.Intents | None = None,
        debug_guild_id: int | None = None,
    ):
        if intents is None:
            intents = discord.Intents.default()
            intents.message_content = True
            intents.members = True
        super().__init__(command_prefix=command_prefix, intents=intents)
        self.debug_guild_id = debug_guild_id

        # --- Services ---
        self.rag_service = rag_service or RAGService()
        self.player_service = PlayerService()
        self.ai_agent = AIAgent()
        self.ollama_service = OllamaService()
        self.ai_agent.ollama_service = self.ollama_service

        # Deployment flag used in tests
        self.redeploy = False

        self.status_channel = None

    async def setup_hook(self):
        """Asynchronous setup code for the bot."""
        logging.info("[Bot] Running setup hook...")

        # Load cogs
        initial_extensions = [
            "cogs.codex",
            "cogs.start",
        ]
        for extension in initial_extensions:
            try:
                await self.load_extension(f"ironaccord_bot.{extension}")
                logging.info(f"{extension.split('.')[-1].capitalize()}Cog loaded.")
            except Exception as e:
                logging.error(f"Failed to load extension {extension}: {e}", exc_info=True)

        logging.info("[Bot] Cogs loaded.")

        # Sync commands to the debug guild if provided
        if self.debug_guild_id:
            guild = discord.Object(id=self.debug_guild_id)
            self.tree.copy_global_to(guild=guild)
            await self.tree.sync(guild=guild)
            logging.info(f"[Bot] Commands synced to debug guild (ID: {self.debug_guild_id})")

    async def on_ready(self):
        """
        Called when the bot is ready and connected to Discord.
        MODIFIED: Sends a startup message.
        """
        logging.info(f"[Bot] Logged in as {self.user.name}#{self.user.discriminator} (ID: {self.user.id})")
        logging.info("[Bot] ------")

        # Fetch the status channel and send the online message
        self.status_channel = self.get_channel(STATUS_CHANNEL_ID)
        if self.status_channel:
            embed = discord.Embed(
                title="Bot Status: Online",
                description=f"{self.user.name} has connected and is ready.",
                color=discord.Color.green(),
            )
            embed.timestamp = datetime.utcnow()
            await self.status_channel.send(embed=embed)
        else:
            logging.warning(f"Could not find status channel with ID: {STATUS_CHANNEL_ID}")

    async def on_close(self):
        """
        Called when the bot is shutting down.
        NEW: Sends a shutdown message.
        """
        logging.info("[Bot] Shutting down...")
        if self.status_channel:
            embed = discord.Embed(
                title="Bot Status: Offline",
                description=f"{self.user.name} is shutting down.",
                color=discord.Color.red(),
            )
            embed.timestamp = datetime.utcnow()
            await self.status_channel.send(embed=embed)


# --- Main Execution ---
bot: IronAccordBot | None = None

async def on_ready():
    """Handle the on_ready event for redeploy tests."""
    if not bot:
        return
    if getattr(bot, "redeploy", False):
        await bot.tree.clear_commands()
    await bot.tree.sync()

async def start_bot():
    """The main function to run the bot."""
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(levelname)s - [%(name)s] - %(message)s",
        stream=sys.stdout,
    )

    if not DISCORD_TOKEN:
        logging.error("[Bot] Error: DISCORD_TOKEN is not set in the .env file.")
        return

    global bot
    bot = IronAccordBot(command_prefix=COMMAND_PREFIX, debug_guild_id=DEBUG_GUILD_ID)
    await bot.start(DISCORD_TOKEN)


def main():
    """Entry point for the application."""
    try:
        asyncio.run(start_bot())
    except KeyboardInterrupt:
        logging.info("Shutdown signal received.")
    finally:
        if bot and not bot.is_closed():
            # The on_close event will handle the final message
            asyncio.run(bot.close())
        logging.info("[Launcher] Bot shutdown gracefully.")

if __name__ == "__main__":
    main()
