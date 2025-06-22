const { EmbedBuilder } = require('discord.js');

// Simple helper for creating branded embeds.
// Usage: embedBuilder.simple('Title', [{ name: 'Field', value: 'Value', inline: false }], 'https://img.url')
const BRAND_COLOR = '#29b6f6';
const FOOTER_TEXT = 'Auto Battler';

function simple(title, fields = [], thumbnailUrl) {
  const embed = new EmbedBuilder()
    .setColor(BRAND_COLOR)
    .setTitle(title)
    .setTimestamp()
    .setFooter({ text: FOOTER_TEXT });

  fields.forEach(f => embed.addFields({ name: f.name, value: f.value, inline: f.inline }));
  if (thumbnailUrl) {
    embed.setThumbnail(thumbnailUrl);
  }
  return embed;
}

module.exports = { simple, BRAND_COLOR };
