import os
from pathlib import Path
from dotenv import load_dotenv
import discord
from discord.ext import commands

# Load environment from the project root
ROOT_DIR = Path(__file__).resolve().parent.parent
load_dotenv(ROOT_DIR / ".env")

TOKEN = os.getenv("DISCORD_TOKEN")
GUILD_ID = os.getenv("GUILD_ID")

if not TOKEN:
    raise RuntimeError(
        "DISCORD_TOKEN environment variable is missing. Did you copy .env.example to .env?"
    )

intents = discord.Intents.default()
intents.message_content = True
intents.members = True

bot = commands.Bot(command_prefix="!", intents=intents)

@bot.event
async def on_ready():
    print(f"Logged in as {bot.user} (ID: {bot.user.id})")
    print("------")

# Load all cogs from the cogs directory
for path in Path("cogs").glob("*.py"):
    if path.stem.startswith("_"):
        continue
    module_name = f"cogs.{path.stem}"
    bot.load_extension(module_name)

bot.run(TOKEN)
