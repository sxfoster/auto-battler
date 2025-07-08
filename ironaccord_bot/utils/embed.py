from typing import List, Dict, Optional
import discord


def simple(title: str, fields: Optional[List[Dict[str, str]]] = None, thumbnail_url: Optional[str] = None) -> discord.Embed:
    embed = discord.Embed(title=title, colour=0x29B6F6)
    embed.set_footer(text="Auto-Battler Bot")
    if fields:
        for f in fields:
            embed.add_field(name=f['name'], value=f['value'], inline=f.get('inline', False))
    if thumbnail_url:
        embed.set_thumbnail(url=thumbnail_url)
    return embed
