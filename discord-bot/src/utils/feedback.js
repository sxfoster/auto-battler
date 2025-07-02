const { EmbedBuilder } = require('discord.js');

/**
 * Sends a standardized ephemeral error message.
 * @param {import('discord.js').Interaction} interaction The interaction to reply to.
 * @param {string} title The title of the error message.
 * @param {string} message The main body of the error message.
 */
async function sendError(interaction, title, message) {
  const embed = new EmbedBuilder()
    .setColor('#ED4245')
    .setTitle(`🚫 ${title}`)
    .setDescription(message)
    .setTimestamp();

  const replyOptions = { embeds: [embed], ephemeral: true };

  if (interaction.replied || interaction.deferred) {
    await interaction.followUp(replyOptions);
  } else {
    await interaction.reply(replyOptions);
  }
}

/**
 * Sends a standardized ephemeral informational message.
 * @param {import('discord.js').Interaction} interaction The interaction to reply to.
 * @param {string} title The title of the info message.
 * @param {string} message The main body of the info message.
 */
async function sendInfo(interaction, title, message) {
  const embed = new EmbedBuilder()
    .setColor('#3B82F6')
    .setTitle(`ℹ️ ${title}`)
    .setDescription(message)
    .setTimestamp();

  const replyOptions = { embeds: [embed], ephemeral: true };

  if (interaction.replied || interaction.deferred) {
    await interaction.followUp(replyOptions);
  } else {
    await interaction.reply(replyOptions);
  }
}

module.exports = { sendError, sendInfo };
