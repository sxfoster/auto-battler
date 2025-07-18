import os
import asyncio
import logging
import discord
from dotenv import load_dotenv

from ironaccord_bot.bot import IronAccordBot
from ironaccord_bot.services import RAGService

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s:%(levelname)s:%(name)s: %(message)s'
)
log = logging.getLogger(__name__)


load_dotenv()

# Prefix for traditional commands (e.g. !start)
COMMAND_PREFIX = os.getenv("COMMAND_PREFIX", "!")
DISCORD_TOKEN = os.getenv("DISCORD_TOKEN")
DEBUG_GUILD_ID = int(os.getenv("DEBUG_GUILD_ID", 0)) or None


async def main() -> None:
    """Entry point for launching the bot."""
    intents = discord.Intents.default()
    intents.message_content = True

    log.info("Starting bot...")
    log.info("Initializing RAGService...")
    try:
        rag_service = await asyncio.to_thread(RAGService)
        log.info(
            "RAGService initialized successfully with local Ollama model."
        )
    except Exception as e:
        log.critical(f"Failed to initialize RAGService: {e}")
        return

    bot = IronAccordBot(
        rag_service=rag_service,
        command_prefix=COMMAND_PREFIX,
        intents=intents,
        debug_guild_id=DEBUG_GUILD_ID,
    )
    try:
        log.info("Logging into Discord...")
        await bot.start(DISCORD_TOKEN)
    except Exception as e:
        log.critical(f"Failed to start Discord bot: {e}")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        log.info("Bot shutdown requested by user.")
