const { EmbedBuilder } = require('discord.js');

/**
 * Build a standard embed with brand styling.
 *
 * Usage:
 * const embed = simple('Title', [
 *   { name: 'Field', value: 'Value', inline: false }
 * ], 'https://img.url');
 * interaction.reply({ embeds: [embed] });
 *
 * @param {string} title
 * @param {{ name: string, value: string, inline?: boolean }[]} [fields]
 * @param {string} [thumbnailUrl]
 * @returns {EmbedBuilder}
 */
function simple(title, fields = [], thumbnailUrl) {
  const embed = new EmbedBuilder()
    .setColor('#29b6f6')
    .setTitle(title)
    .setTimestamp()
    .setFooter({ text: 'Auto\u2011Battler Bot' });
  fields.forEach(f => embed.addFields({ name: f.name, value: f.value, inline: !!f.inline }));
  if (thumbnailUrl) embed.setThumbnail(thumbnailUrl);
  return embed;
}

module.exports = { simple };
