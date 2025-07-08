import functools
import discord


def long_running_command(func):
    """Decorator to handle defer/followup for slow commands."""

    @functools.wraps(func)
    async def wrapper(cog_instance, interaction: discord.Interaction, *args, **kwargs):
        await interaction.response.defer(ephemeral=True, thinking=True)
        try:
            result = await func(cog_instance, interaction, *args, **kwargs)
            if isinstance(result, discord.Embed):
                await interaction.followup.send(embed=result, ephemeral=True)
            elif isinstance(result, str):
                await interaction.followup.send(result, ephemeral=True)
        except Exception as exc:
            print(f"Error in long_running_command wrapper: {exc}")
            await interaction.followup.send("An unexpected error occurred.", ephemeral=True)

    return wrapper
