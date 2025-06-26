const tutorialManager = require('../features/tutorialManager');
const marketManager = require('../features/marketManager');
const beginManager = require('../features/beginManager');

module.exports = async (interaction) => {
    const { customId, values } = interaction;
    const userId = interaction.user.id;
    if (customId.startsWith('market_pack_select_')) {
        await interaction.deferUpdate();
        const parts = customId.split('_');
        const category = parts[3];
        const page = parseInt(parts[4], 10) || 0;
        const packId = values[0];
        await marketManager.handleBoosterPurchase(interaction, userId, packId, page);
        return;
    }
    if (customId === 'begin_class_select') {
        await interaction.deferUpdate();
        const chosen = values[0];
        await beginManager.handleClassSelected(interaction, userId, chosen);
        return;
    }
    if (customId.startsWith('tutorial_select_')) {
        await interaction.deferUpdate();
        const step = customId.split('_')[2];
        const champNum = parseInt(customId.split('_')[3]);
        switch (step) {
            case 'hero':
                tutorialManager.activeTutorialDrafts.get(userId).champion1.heroId = parseInt(values[0]);
                await tutorialManager.sendAbilitySelectionStep(interaction, userId, champNum);
                break;
            default:
                break;
        }
    }
};

