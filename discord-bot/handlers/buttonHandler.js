const tutorialManager = require('../features/tutorialManager');
const beginManager = require('../features/beginManager');
const { getTownMenu } = require('../commands/town');

module.exports = async (interaction) => {
    const { customId } = interaction;
    const userId = interaction.user.id;
    if (customId.startsWith('tutorial_')) {
        await interaction.deferUpdate();
        await tutorialManager.handleTutorialButton(interaction);
        return;
    }
    switch (customId) {
        case 'begin_show_class_selection':
            await beginManager.showClassSelection(interaction);
            break;
        case 'back_to_town':
            await interaction.update(getTownMenu());
            break;
        default:
            break;
    }
};

