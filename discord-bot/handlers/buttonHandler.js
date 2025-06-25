const tutorialManager = require('../features/tutorialManager');
const marketManager = require('../features/marketManager');
const { getTownMenu } = require('../commands/town');

module.exports = async (interaction) => {
    const { customId } = interaction;
    const userId = interaction.user.id;
    if (customId.startsWith('tutorial_')) {
        await interaction.deferUpdate();
        await tutorialManager.handleTutorialButton(interaction);
        return;
    }
    if (customId.startsWith('market_')) {
        await interaction.deferUpdate();
        if (customId === 'market_tavern') return interaction.editReply(marketManager.getMarketplaceMenu('tavern'));
        if (customId === 'market_armory') return interaction.editReply(marketManager.getMarketplaceMenu('armory'));
        if (customId === 'market_altar') return interaction.editReply(marketManager.getMarketplaceMenu('altar'));
        if (customId.startsWith('market_page_prev_') || customId.startsWith('market_page_next_')) {
            const parts = customId.split('_');
            const category = parts[3];
            const page = parseInt(parts[4], 10) || 0;
            return interaction.editReply(marketManager.getMarketplaceMenu(category, page));
        }
    }
    if (customId.startsWith('buy_pack_')) {
        await interaction.deferUpdate();
        const packId = customId.replace('buy_pack_', '');
        await marketManager.handleBoosterPurchase(interaction, userId, packId, 0);
        return;
    }
    switch (customId) {
        case 'back_to_town':
            await interaction.update(getTownMenu());
            break;
        default:
            break;
    }
};

