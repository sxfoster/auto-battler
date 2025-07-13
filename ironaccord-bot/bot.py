import sys
import os
import pprint

# Add the parent directory of 'ironaccord-bot' to the Python path
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if project_root not in sys.path:
    sys.path.insert(0, project_root)


import argparse
import discord
from discord.ext import commands
from dotenv import load_dotenv
import logging
import asyncio

# --- Local Imports ---
from ai.ai_agent import AIAgent
from services.rag_service import RAGService
try:
    from services.mission_generator import MissionGenerator
except Exception:  # pragma: no cover - optional dependency
    MissionGenerator = None

# --- Environment and Logging ---
load_dotenv()
TOKEN = os.getenv("DISCORD_TOKEN")
logger = logging.getLogger("discord")
logger.debug("--- PYTHON PATH ---")
logger.debug(pprint.pformat(sys.path))
logger.debug("-------------------")


def parse_args() -> argparse.Namespace:
    """Parse command line arguments for the bot."""
    parser = argparse.ArgumentParser(description="Iron Accord Bot")
    parser.add_argument(
        "--redeploy",
        action="store_true",
        help="Clear and redeploy all slash commands on startup",
    )
    return parser.parse_args()

# --- Bot Intents ---
intents = discord.Intents.default()
intents.message_content = True
intents.members = True

# --- Bot Definition ---
class IronAccordBot(commands.Bot):
    def __init__(self):
        super().__init__(command_prefix="!", intents=intents)
        # --- Service Initialization ---
        self.rag_service = RAGService()
        self.ai_agent = AIAgent()
        self.mission_generator = (
            MissionGenerator(self.ai_agent, self.rag_service) if MissionGenerator else None
        )
        # Expose the Ollama service directly for cogs expecting it
        self.ollama_service = self.ai_agent.ollama_service
        # Flag controlling whether to redeploy slash commands on startup
        self.redeploy: bool = False

bot = IronAccordBot()

# --- THE CRUCIAL PART: on_ready Event ---
@bot.event
async def on_ready():
    """Called when the bot is ready and connected to Discord."""
    logger.info(f'Logged in as {bot.user.name} (ID: {bot.user.id})')
    logger.info('────────────────────')

    try:
        if bot.redeploy:
            logger.info("Clearing all global commands...")
            try:
                cleared = await bot.tree.clear_commands(guild=None)
                logger.info(f"Successfully cleared {len(cleared)} global commands.")
            except Exception as e:
                logger.error(f"Failed to clear commands: {e}")

        synced = await bot.tree.sync()
        logger.info(f"Synced {len(synced)} slash command(s).")
    except Exception as e:
        logger.error(f"Failed to sync command tree: {e}")


async def load_cogs():
    """Loads all cogs from the cogs directory."""
    for filename in os.listdir("./cogs"):
        if filename.endswith(".py") and not filename.startswith("__"):
            try:
                await bot.load_extension(f"cogs.{filename[:-3]}")
                logger.info(f"Loaded cog: cogs.{filename[:-3]}")
            except Exception as e:
                logger.error(f"Failed to load cog {filename}: {e}")


async def main():
    """Main function to setup and run the bot."""
    args = parse_args()

    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
    bot.redeploy = args.redeploy

    logger.info("Loading cogs...")
    await load_cogs()

    if bot.redeploy:
        logger.info("Bot is starting in redeploy mode...")
    else:
        logger.info("Bot is starting...")

    await bot.start(TOKEN)


# --- Run the Bot ---
if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Bot shutting down.")
