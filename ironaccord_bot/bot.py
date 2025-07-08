import os
from pathlib import Path
from dotenv import load_dotenv
import discord
from discord.ext import commands

load_dotenv()

TOKEN = os.getenv("DISCORD_TOKEN")

if not TOKEN:
    raise RuntimeError("DISCORD_TOKEN not set in environment")

intents = discord.Intents.default()
intents.message_content = True
intents.members = True

bot = commands.Bot(command_prefix="!", intents=intents)

@bot.event
async def on_ready():
    print(f"Logged in as {bot.user} (ID: {bot.user.id})")
    print("------")

# Load all cogs from the cogs directory
for path in (Path(__file__).parent / "cogs").glob("*.py"):
    if path.stem.startswith("_"):
        continue
    module_name = f"ironaccord_bot.cogs.{path.stem}"
    bot.load_extension(module_name)

bot.run(TOKEN)
