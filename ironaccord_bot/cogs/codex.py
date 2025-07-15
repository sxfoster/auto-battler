import discord
from discord import app_commands
from discord.ext import commands

from ironaccord_bot.services.rag_service import RAGService
from ironaccord_bot.services.ollama_service import OllamaService


class CodexCog(commands.Cog):
    """Provides the `/codex query` command for lore lookup."""

    def __init__(self, bot: commands.Bot):
        self.bot = bot
        self.rag_service: RAGService = bot.rag_service
        self.ollama_service: OllamaService = bot.ollama_service

        self.group = app_commands.Group(
            name="codex", description="Codex commands"
        )
        self.group.command(name="query", description="Search the Iron Accord knowledge base.")(self.query)
        bot.tree.add_command(self.group)

    @app_commands.describe(query="What lore are you looking for?")
    async def query(self, interaction: discord.Interaction, query: str):
        """Handle the `/codex query` slash command."""
        await interaction.response.defer()

        # Provide the RAG service with additional context so searches prefer
        # Iron Accord lore over generic definitions.
        prompt_template = (
            "Within the context of the steampunk fantasy game world known as 'Iron Accord', "
            "please answer the following question: \"{user_query}\""
        )
        enhanced_query = prompt_template.format(user_query=query)
        print(f"Original codex query: '{query}'")
        print(f"Enhanced query for RAG: '{enhanced_query}'")

        results = self.rag_service.query(enhanced_query)

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
