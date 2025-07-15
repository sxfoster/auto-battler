import discord
from discord import app_commands
from discord.ext import commands
import logging

from ironaccord_bot.services.rag_service import RAGService
from ironaccord_bot.services.ollama_service import OllamaService

logger = logging.getLogger(__name__)


class CodexCog(commands.Cog):
    """Provides the `/codex query` command for lore lookup."""

    def __init__(self, bot: commands.Bot):
        self.bot = bot
        self.rag_service: RAGService = bot.rag_service
        self.ollama_service: OllamaService = bot.ollama_service

        # Commands are added directly via decorators

    @app_commands.command(name="query", description="Consult the Iron Accord codex for lore.")
    @app_commands.describe(query="What lore are you looking for?")
    async def query(self, interaction: discord.Interaction, query: str):
        """
        Handle the `/codex query` slash command.
        MODIFIED: This method is updated for source-aware prompting and logging.
        """
        logger.info(f"Received /codex query from '{interaction.user.name}': '{query}'")
        await interaction.response.defer(ephemeral=True)

        try:
            prompt_template = (
                "Within the context of the steampunk fantasy game world known as 'Iron Accord', "
                "please answer the following question: \"{user_query}\""
            )
            enhanced_query = prompt_template.format(user_query=query)
            logger.info(f"Enhanced query for RAG: '{enhanced_query}'")

            # The retriever should be configured to return source documents
            results = self.rag_service.query(enhanced_query)
            source_documents = results.get("source_documents", [])

            if not source_documents:
                logger.warning(
                    f"RAG service returned no results for query: '{enhanced_query}'"
                )
                embed = discord.Embed(
                    title=f"Codex Entry: {query}",
                    description="I could not find any information on that topic in my archives.",
                    color=discord.Color.orange(),
                )
                await interaction.followup.send(embed=embed)
                return

            # --- NEW: Log the sources and build a structured context ---
            source_filenames = list(set([doc.metadata.get("source", "Unknown") for doc in source_documents]))
            logger.info(f"Retrieved {len(source_documents)} chunks from sources: {source_filenames}")

            context_parts = []
            for doc in source_documents:
                source = doc.metadata.get("source", "Unknown")
                content = doc.page_content
                context_parts.append(f"[Source: {source}]\n{content}")

            structured_context = "\n\n---\n\n".join(context_parts)
            logger.debug(f"Structured context for prompt:\n---\n{structured_context}\n---")

            # --- NEW: Updated, more advanced prompt ---
            final_prompt = f"""
            You are a helpful assistant and lore master for the world of Iron Accord.
            Based ONLY on the following context, which includes the source file for each piece of information, provide a concise and synthesized answer to the user's query.
            Do not add any information that is not in the context. If the context does not seem relevant, state that you have no information on the topic.

            CONTEXT:
            {structured_context}

            QUERY:
            {query}
            """

            logger.info("Sending final prompt to GM model for summary.")
            summary = await self.ollama_service.get_gm_response(final_prompt)
            logger.info("Received summary from GM model.")

            embed = discord.Embed(
                title=f"Codex Entry: {query}",
                description=summary,
                color=discord.Color.blue(),
            )
            # Add sources to the footer for traceability
            embed.set_footer(text=f"Sources: {', '.join(source_filenames)}")
            await interaction.followup.send(embed=embed)
            logger.info(f"Successfully sent codex response for query: '{query}'")

        except Exception as e:
            logger.error(f"An error occurred during /codex query: {e}", exc_info=True)
            error_embed = discord.Embed(
                title="Error",
                description="A critical error occurred while consulting the archives. The developers have been notified.",
                color=discord.Color.red(),
            )
            await interaction.followup.send(embed=error_embed)


async def setup(bot: commands.Bot):
    await bot.add_cog(CodexCog(bot))
