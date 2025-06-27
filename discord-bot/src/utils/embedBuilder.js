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


/**
 * DM a player when they obtain a new ability card.
 *
 * @param {import('discord.js').User} user
 * @param {object} card
 */
async function sendCardDM(user, card) {
  const embed = new EmbedBuilder()
    .setColor('#29b6f6')
    .setTitle('✨ You found a new ability card! ✨')
    .addFields(
      { name: 'Name', value: card.name, inline: true },
      { name: 'Rarity', value: card.rarity, inline: true },
      { name: 'Charges', value: '10/10', inline: true }
    )
    .setTimestamp()
    .setFooter({ text: 'Auto‑Battler Bot' });

  await user.send({ embeds: [embed] });
}

module.exports = { simple, sendCardDM };
