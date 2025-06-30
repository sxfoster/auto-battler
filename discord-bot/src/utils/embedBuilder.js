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
 * Build an embed describing an ability card.
 *
 * @param {object} card
 * @returns {EmbedBuilder}
 */
function buildCardEmbed(card) {
  const embed = new EmbedBuilder()
    .setColor('#29b6f6')
    .setTimestamp()
    .setFooter({ text: 'Auto\u2011Battler Bot' })
    .addFields(
      { name: 'Name', value: card.name, inline: true },
      { name: 'Class', value: card.class, inline: true },
      { name: 'Rarity', value: card.rarity, inline: true },
      { name: 'Charges', value: '10/10', inline: true },
      { name: 'Description', value: card.effect }
    );

  return embed;
}

/**
 * Build an embed showing current combatant HP and log lines.
 * New log entries should be appended to the bottom of the description.
 *
 * @param {object[]} combatants
 * @param {string} logText
 * @returns {EmbedBuilder}
 */
function buildBattleEmbed(combatants, logText) {
  const hpLines = combatants
    .map(c => `${c.name}: ${c.currentHp}/${c.maxHp} HP`)
    .join('\n');
  const embed = new EmbedBuilder()
    .setColor('#29b6f6')
    .setTitle('Battle')
    .setTimestamp()
    .setFooter({ text: 'Auto\u2011Battler Bot' })
    .setDescription(logText || 'The battle is about to begin...')
    .addFields({ name: 'HP', value: hpLines });
  return embed;
}


/**
 * DM a player when they obtain a new ability card.
 *
 * @param {import('discord.js').User} user
 * @param {object} card
 */
async function sendCardDM(user, card) {
  const embed = buildCardEmbed(card).setTitle('✨ You found a new ability card! ✨');
  await user.send({ embeds: [embed] });
}

module.exports = { simple, sendCardDM, buildCardEmbed, buildBattleEmbed };
