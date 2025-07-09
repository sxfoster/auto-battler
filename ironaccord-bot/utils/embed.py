from typing import List, Dict, Optional
import discord


def simple(title: str, fields: Optional[List[Dict[str, str]]] = None,
           thumbnail_url: Optional[str] = None,
           description: Optional[str] = None) -> discord.Embed:
    embed = discord.Embed(title=title, description=description, colour=0x29B6F6)
    embed.set_footer(text="Auto-Battler Bot")
    if fields:
        for f in fields:
            embed.add_field(name=f['name'], value=f['value'], inline=f.get('inline', False))
    if thumbnail_url:
        embed.set_thumbnail(url=thumbnail_url)
    return embed


def create_embed(title: str, description: str, color: discord.Color | int = discord.Color.blurple()) -> discord.Embed:
    """Lightweight helper used by the new onboarding flow."""
    embed = discord.Embed(title=title, description=description, color=color)
    embed.set_footer(text="Iron Accord")
    return embed
