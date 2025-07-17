import os
import asyncio
import discord
from dotenv import load_dotenv

from ironaccord_bot.bot import IronAccordBot


load_dotenv()

# Prefix for traditional commands (e.g. !start)
COMMAND_PREFIX = os.getenv("COMMAND_PREFIX", "!")
DISCORD_TOKEN = os.getenv("DISCORD_TOKEN")
DEBUG_GUILD_ID = int(os.getenv("DEBUG_GUILD_ID", 0)) or None


async def main() -> None:
    """Entry point for launching the bot."""
    intents = discord.Intents.default()
    intents.message_content = True

    bot = IronAccordBot(command_prefix=COMMAND_PREFIX, intents=intents, debug_guild_id=DEBUG_GUILD_ID)
    await bot.start(DISCORD_TOKEN)


if __name__ == "__main__":
    asyncio.run(main())
