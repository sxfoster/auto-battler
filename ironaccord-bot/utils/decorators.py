import functools
import discord


def defer_command(func):
    """Automatically defer an interaction and send the returned result."""

    @functools.wraps(func)
    async def wrapper(cog_instance, interaction: discord.Interaction, *args, **kwargs):
        await interaction.response.defer(ephemeral=True, thinking=True)
        try:
            result = await func(cog_instance, interaction, *args, **kwargs)
            if isinstance(result, discord.Embed):
                await interaction.followup.send(embed=result, ephemeral=True)
            elif isinstance(result, str):
                await interaction.followup.send(result, ephemeral=True)
            elif isinstance(result, tuple) and len(result) == 2:
                embed, view = result
                await interaction.followup.send(embed=embed, view=view, ephemeral=True)
            elif result is None:
                pass
            else:
                await interaction.followup.send("Unhandled response type.", ephemeral=True)
        except Exception as exc:
            print(f"ERROR in deferred command '{func.__name__}': {exc}")
            if not interaction.response.is_done():
                await interaction.followup.send(
                    "An unexpected error occurred. The developers have been notified.",
                    ephemeral=True,
                )

    return wrapper


def long_running_command(func):
    """Backward compatible alias for :func:`defer_command`."""
    return defer_command(func)
