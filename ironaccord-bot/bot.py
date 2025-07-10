import os
import logging
import asyncio
import discord
from discord.ext import commands
from dotenv import load_dotenv

from services.ollama_service import OllamaService
from services.rag_service import RAGService
from ai.ai_agent import AIAgent

# --- Basic Logging Setup ---
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# --- Load Environment Variables ---
load_dotenv()
DISCORD_TOKEN = os.getenv("DISCORD_TOKEN")

# --- Bot Initialization ---
intents = discord.Intents.default()
intents.message_content = True
bot = commands.Bot(command_prefix="!", intents=intents)


async def load_cogs(bot: commands.Bot) -> None:
    for filename in os.listdir("./cogs"):
        if filename.endswith(".py") and filename != "__init__.py":
            cog_name = f"cogs.{filename[:-3]}"
            try:
                await bot.load_extension(cog_name)
                logger.info(f"Loaded cog: {cog_name}")
            except Exception as e:
                logger.error(f"Failed to load cog {cog_name}: {e}")


async def main() -> None:
    """Main function to run the bot."""
    logger.info("Initializing services...")
    bot.ollama_service = OllamaService()
    bot.rag_service = RAGService()
    bot.agent = AIAgent()
    logger.info("Services initialized.")

    logger.info("Loading cogs...")
    await load_cogs(bot)

    if DISCORD_TOKEN:
        await bot.start(DISCORD_TOKEN)
    else:
        logger.error("FATAL: DISCORD_TOKEN not found in .env file. Bot cannot start.")


# --- Bot Events ---
@bot.event
async def on_ready():
    """Called when the bot is fully logged in and ready."""
    print("────────────────────")
    print(f"Logged in as {bot.user.name} (ID: {bot.user.id})")
    print("────────────────────")
    await bot.change_presence(activity=discord.Game(name="Iron Accord | /start"))


# --- Run the Bot ---
if __name__ == "__main__":
    asyncio.run(main())
