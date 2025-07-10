import os
import logging
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

# --- Load Environment Variables ---
load_dotenv()
DISCORD_TOKEN = os.getenv("DISCORD_TOKEN")

# --- Bot Initialization ---
intents = discord.Intents.default()
intents.message_content = True
bot = commands.Bot(command_prefix="!", intents=intents)

# --- Service Initialization and Attachment ---
logging.info("Initializing services...")
bot.ollama_service = OllamaService()
bot.rag_service = RAGService()
bot.agent = AIAgent()
logging.info("Services initialized.")

# --- Cog Loading ---
logging.info("Loading cogs...")
cogs_path = "./cogs"
for filename in os.listdir(cogs_path):
    if filename.endswith(".py") and not filename.startswith("__"):
        try:
            cog_name = f"cogs.{filename[:-3]}"
            bot.load_extension(cog_name)
            logging.info(f"Loaded cog: {cog_name}")
        except Exception as e:
            logging.error(f"Failed to load cog {filename[:-3]}: {e}", exc_info=True)
logging.info("Cogs loaded.")


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
    if DISCORD_TOKEN:
        bot.run(DISCORD_TOKEN)
    else:
        logging.error("FATAL: DISCORD_TOKEN not found in .env file. Bot cannot start.")
