import random
from pathlib import Path

import discord
from discord.ext import commands
from discord import app_commands

from ai.ai_agent import AIAgent
from services.mission_generator import MissionGenerator



class BackgroundView(discord.ui.View):
    def __init__(self, user: discord.User, backgrounds: list[str], generator: MissionGenerator):
        super().__init__(timeout=300)
        self.user = user
        self.generator = generator
        for bg in backgrounds:
            self.add_item(self.BackgroundButton(bg))

    class BackgroundButton(discord.ui.Button):
        def __init__(self, name: str):
            super().__init__(label=name, style=discord.ButtonStyle.primary)
            self.name = name

        async def callback(self, interaction: discord.Interaction):
            view: "BackgroundView" = self.view
            if interaction.user.id != view.user.id:
                await interaction.response.send_message("This is not your prompt.", ephemeral=True)
                return
            await interaction.response.defer(ephemeral=True, thinking=True)
            text = await view.generator.generate_intro(self.name)
            if not text:
                text = "Failed to generate adventure. Please try again later."
            await interaction.followup.send(text, ephemeral=True)
            view.stop()


class StartCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot
        self.agent = AIAgent()
        self.rag_service = getattr(bot, "rag_service", None)
        self.generator = MissionGenerator(self.agent, self.rag_service)

    def _intro_text(self) -> str:
        path = Path("docs/lore/world_overview.md")
        try:
            lines = [ln.strip() for ln in path.read_text(encoding="utf-8").splitlines() if ln.strip() and not ln.startswith("#")]
            return " ".join(lines[:2])
        except Exception:
            return "Welcome to the war-torn world of Iron Accord."

    def _background_names(self) -> list[str]:
        base = Path("docs/backgrounds/iron_accord")
        names: list[str] = []
        for p in base.glob("*.md"):
            if p.name == "README.md":
                continue
            try:
                first = p.read_text(encoding="utf-8").splitlines()[0]
                names.append(first.lstrip("#").strip())
            except Exception:
                names.append(p.stem.replace("_", " ").title())
        return names

    @app_commands.command(name="start", description="Begin your journey in the world of Iron Accord.")
    async def start(self, interaction: discord.Interaction):
        await interaction.response.defer(ephemeral=True, thinking=True)

        intro_text = self._intro_text()
        background_names = self._background_names()

        # Randomly sample backgrounds only if at least two are available. This
        # avoids ValueError when the list is too small and lets us gracefully
        # fall back to whatever options exist.
        if len(background_names) >= 2:
            backgrounds = random.sample(background_names, k=2)
        elif len(background_names) == 1:
            backgrounds = background_names
        else:
            backgrounds = []

        # If no backgrounds exist, inform the user and exit early. The
        # followup message is ephemeral so only they see the warning.
        if not backgrounds:
            await interaction.followup.send(
                "No backgrounds are available. Please contact an administrator.",
                ephemeral=True,
            )
            return

        embed = discord.Embed(
            title="Welcome to Iron Accord",
            description=intro_text,
            color=discord.Color.dark_gold(),
        )

        view = BackgroundView(interaction.user, backgrounds, self.generator)
        await interaction.followup.send(embed=embed, view=view, ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(StartCog(bot))
