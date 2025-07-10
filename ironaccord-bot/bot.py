import os
import sys
import asyncio
import discord
from discord.ext import commands
from dotenv import load_dotenv

from services.ollama_service import OllamaService
from services.rag_service import RAGService
from ai.ai_agent import AIAgent

# --- Path and Environment Setup ---

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, project_root)
sys.path.insert(0, os.path.dirname(__file__))

dotenv_path = os.path.join(project_root, ".env")
load_dotenv(dotenv_path=dotenv_path)

TOKEN = os.getenv("DISCORD_TOKEN")
GUILD_ID = os.getenv("GUILD_ID")

intents = discord.Intents.default()
intents.message_content = True
intents.members = True

bot = commands.Bot(command_prefix="!", intents=intents)

# Cogs to load
cogs_list = [
    'start',
    'codex',
]


async def load_cogs():
    """Load all cogs listed in ``cogs_list``."""
    print("─" * 20)
    print("Loading cogs...")
    for cog in cogs_list:
        try:
            await bot.load_extension(f"cogs.{cog}")
            print(f"  ✅ Loaded cog: {cog}")
        except Exception as e:
            print(f"  ❌ Failed to load cog {cog}: {e}")
    print("─" * 20)


@bot.event
async def on_ready():
    """Event handler for when the bot logs in and is ready."""
    print(f"\nLogged in as {bot.user} (ID: {bot.user.id})")
    print("─" * 20)

    # Initialize services and attach them to the bot instance
    print("Initializing services...")
    bot.ollama_service = OllamaService()
    bot.rag_service = RAGService()
    bot.agent = AIAgent()
    print("Services initialized.")

    print("Attempting to clear all old commands...")
    try:
        if GUILD_ID:
            guild = discord.Object(id=GUILD_ID)
            bot.tree.clear_commands(guild=guild)
            await bot.tree.sync(guild=guild)
            print("   ✅ Successfully cleared all commands for the guild.")
        else:
            bot.tree.clear_commands(guild=None)
            await bot.tree.sync()
            print("   ✅ Successfully cleared all global commands.")
    except Exception as e:
        print(f"   ❌ Failed to clear commands: {e}")

    print("─" * 20)
    print("🤖 Commands have been cleared. Stop the bot now.")


async def main():
    """Main function to load cogs and run the bot."""
    if not TOKEN:
        print("❌ ERROR: DISCORD_TOKEN is not set. Please check your .env file.")
        return

    async with bot:
        await load_cogs()
        await bot.start(TOKEN)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n🤖 Bot shutting down.")

