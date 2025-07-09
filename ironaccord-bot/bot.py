import os
import sys
import asyncio
import discord
from discord.ext import commands
from dotenv import load_dotenv

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


async def load_cogs():
    """Dynamically loads all command cogs from the /cogs directory."""
    print("─" * 20)
    print("Loading cogs...")
    cogs_dir = os.path.join(os.path.dirname(__file__), "cogs")
    for filename in os.listdir(cogs_dir):
        if filename.endswith(".py") and not filename.startswith("__"):
            try:
                await bot.load_extension(f"cogs.{filename[:-3]}")
                print(f"  ✅ Loaded cog: {filename}")
            except Exception as e:
                print(f"  ❌ Failed to load cog {filename}: {e}")
    print("─" * 20)


@bot.event
async def on_ready():
    """Event handler for when the bot logs in and is ready."""
    print(f"\nLogged in as {bot.user} (ID: {bot.user.id})")
    print("─" * 20)

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
