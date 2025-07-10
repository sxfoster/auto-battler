import os
import discord
from discord.ext import commands
from dotenv import load_dotenv
import logging
import asyncio

# --- Local Imports ---
from ai.ai_agent import AIAgent
from services.rag_service import RAGService

# --- Environment and Logging ---
load_dotenv()
TOKEN = os.getenv("DISCORD_TOKEN")
logger = logging.getLogger("discord")

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

bot = IronAccordBot()

# --- THE CRUCIAL PART: on_ready Event ---
@bot.event
async def on_ready():
    """Called when the bot is ready and connected to Discord."""
    logger.info(f'Logged in as {bot.user.name} (ID: {bot.user.id})')
    logger.info('────────────────────')

    try:
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
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
    logger.info("Loading cogs...")
    await load_cogs()

    logger.info("Bot is starting...")
    await bot.start(TOKEN)


# --- Run the Bot ---
if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Bot shutting down.")
