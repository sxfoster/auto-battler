import functools
import discord


def defer_command(func):
    """Defer the interaction then send a follow-up with the returned value."""

    @functools.wraps(func)
    async def wrapper(cog_instance, interaction: discord.Interaction, *args, **kwargs):
        await interaction.response.defer(ephemeral=True, thinking=True)
        try:
            result = await func(cog_instance, interaction, *args, **kwargs)
            if isinstance(result, discord.Embed):
                await interaction.followup.send(embed=result, ephemeral=True)
            elif isinstance(result, str):
                await interaction.followup.send(result, ephemeral=True)
            elif result is None:
                return
            else:
                await interaction.followup.send("An unexpected response type was returned.", ephemeral=True)
        except Exception as exc:
            print(f"Error in defer_command wrapper: {exc}")
            await interaction.followup.send("An unexpected error occurred.", ephemeral=True)

    return wrapper
