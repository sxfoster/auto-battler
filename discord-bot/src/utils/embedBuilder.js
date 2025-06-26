const { EmbedBuilder } = require('discord.js');
const { generateCardImage } = require('./cardRenderer');

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

/**
 * Send a DM containing a single card image with standardized embed styling.
 * @param {import('discord.js').User} user
 * @param {object} card
 */
async function sendCardDM(user, card) {
  const cardBuffer = await generateCardImage(card);
  const embed = new EmbedBuilder()
    .setColor('#FDE047')
    .setTitle('✨ You pulled a new card! ✨')
    .addFields(
      { name: 'Name', value: card.name, inline: true },
      { name: 'Rarity', value: card.rarity, inline: true }
    )
    .setTimestamp();
  await user.send({ embeds: [embed], files: [{ attachment: cardBuffer, name: `${card.name}.png` }] });
}

module.exports = { simple, sendCardDM };
