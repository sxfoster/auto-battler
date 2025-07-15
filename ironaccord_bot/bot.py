import os
import sys
import asyncio
import logging
import discord
from discord.ext import commands
from dotenv import load_dotenv

from ironaccord_bot.services.rag_service import RAGService
from ironaccord_bot.services.player_service import PlayerService
from ironaccord_bot.ai.ai_agent import AIAgent

logger = logging.getLogger(__name__)

dotenv_path = os.path.join(sys.path[0], ".env")
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
        """This is called when the bot is setting up."""
        logger.info("[Bot] Running setup hook...")

        # --- FIX STARTS HERE ---

        # STEP 1: Load all cogs first. This populates the command tree.
        for filename in os.listdir("./ironaccord_bot/cogs"):
            if filename.endswith(".py") and not filename.startswith("_"):
                try:
                    await self.load_extension(f"cogs.{filename[:-3]}")
                    logger.info(f"{filename[:-3].capitalize()}Cog loaded.")
                except Exception as e:
                    logger.error(f"Failed to load extension {filename[:-3]}: {e}")
        logger.info("[Bot] Cogs loaded.")

        # STEP 2: Sync the commands after the tree is populated.
        guild_id = os.getenv("DISCORD_GUILD_ID")
        if not guild_id:
            logger.warning(
                "[Bot] DISCORD_GUILD_ID is not set. Commands will be synced globally, which can be slow."
            )
            logger.warning(
                "[Bot] For fast development, please set DISCORD_GUILD_ID in your .env file."
            )
            await self.tree.sync()
        else:
            guild = discord.Object(id=int(guild_id))
            self.tree.copy_global_to(guild=guild)
            await self.tree.sync(guild=guild)
            logger.info(f"[Bot] Commands synced to development guild (ID: {guild_id})")

        # --- FIX ENDS HERE ---

    async def on_ready(self):
        """Event that is called when the bot is ready and connected to Discord."""
        logger.info(f"[Bot] Logged in as {self.user} (ID: {self.user.id})")
        logger.info("[Bot] ------")


bot: IronAccordBot | None = None


async def on_ready():
    """Event handler dispatched when the bot becomes ready."""
    if bot is None:
        return
    logger.info(f"[Bot] Logged in as {bot.user} (ID: {bot.user.id})")
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
        logging.error("[Bot] DISCORD_TOKEN is not set in the .env file.")
        return

    global bot
    bot = IronAccordBot()
    await bot.start(DISCORD_TOKEN)


if __name__ == "__main__":
    try:
        asyncio.run(start_bot())
    except KeyboardInterrupt:
        logging.info("Shutdown signal received.")
