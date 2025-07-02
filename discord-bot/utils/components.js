const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

/**
 * Creates an ActionRow with a "Back to Town" button.
 * @param {boolean} [asNewMessage=false] - If true, the button ID triggers a new reply.
 * @returns {ActionRowBuilder}
 */
function createBackToTownRow(asNewMessage = false) {
    return new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(asNewMessage ? 'nav-town-new' : 'nav-town')
                .setLabel('Back to Town')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('🏠')
        );
}

module.exports = { createBackToTownRow };
