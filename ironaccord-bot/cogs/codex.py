import discord
from discord import app_commands
from discord.ext import commands

from services.rag_service import RAGService
from services.ollama_service import OllamaService


class CodexCog(commands.Cog):
    """Provides the `/codex` command for lore lookup."""

    def __init__(self, bot: commands.Bot):
        self.bot = bot
        self.rag_service: RAGService = bot.rag_service
        self.ollama_service: OllamaService = bot.ollama_service

    @app_commands.command(name="codex", description="Search the Iron Accord knowledge base.")
    @app_commands.describe(query="What lore are you looking for?")
    async def codex(self, interaction: discord.Interaction, query: str):
        """Handle the `/codex` slash command."""
        await interaction.response.defer()

        results = self.rag_service.query(query)

        if not results:
            embed = discord.Embed(
                title=f"Codex Entry: {query}",
                description="I could not find any information on that topic in my archives.",
                color=discord.Color.orange(),
            )
            await interaction.followup.send(embed=embed)
            return

        retrieved_context = "\n\n---\n\n".join([doc.page_content for doc in results])

        prompt = f"""
        You are a helpful assistant. Based ONLY on the following context, provide a concise answer to the user's query.
        Structure your answer clearly. Do not add any information that is not in the context.
        If the context does not seem relevant to the query, state that you have no information on the topic.

        CONTEXT:
        {retrieved_context}

        QUERY:
        {query}
        """

        summary = await self.ollama_service.get_gm_response(prompt)

        embed = discord.Embed(
            title=f"Codex Entry: {query}",
            description=summary,
            color=discord.Color.blue(),
        )
        await interaction.followup.send(embed=embed)


async def setup(bot: commands.Bot):
    await bot.add_cog(CodexCog(bot))
