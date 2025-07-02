const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { createBackToTownRow } = require('../utils/components');

const adventureCooldowns = new Map();
const COOLDOWN_SECONDS = 30;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('adventure')
        .setDescription('Embark on a daring adventure.'),

    async execute(interaction) {
        const lastAdventureTime = adventureCooldowns.get(interaction.user.id);
        if (lastAdventureTime) {
            const timePassed = (Date.now() - lastAdventureTime) / 1000;
            if (timePassed < COOLDOWN_SECONDS) {
                const timeLeft = Math.ceil(COOLDOWN_SECONDS - timePassed);
                const replyMethod = interaction.isButton() ? 'update' : 'reply';
                await interaction[replyMethod]({
                    content: `You need to rest. You can go on another adventure in ${timeLeft} seconds.`,
                    ephemeral: true,
                    embeds: [],
                    components: []
                });
                return;
            }
        }

        await interaction.reply({ content: 'You venture forth in search of glory...', ephemeral: true });

        const summaryEmbed = new EmbedBuilder()
            .setColor('#57F287')
            .setDescription('After a brief skirmish, you return victorious!');

        const backToTownRow = createBackToTownRow(true);
        await interaction.followUp({ embeds: [summaryEmbed], components: [backToTownRow] });

        adventureCooldowns.set(interaction.user.id, Date.now());
    }
};
