const { SlashCommandBuilder, StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const db = require('../util/database');
const { simple } = require('../src/utils/embedBuilder');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fight')
        .setDescription('Choose champions from your roster to enter a dungeon fight!'),
    async execute(interaction) {
        const userId = interaction.user.id;

        try {
            // 1. Fetch the user's roster from the database
            // Note: We assume the 'heroes' table exists from your data.js file.
            // You may need to create and populate it if you haven't already.
            const [roster] = await db.execute(
                `SELECT uc.id, h.name, h.rarity, h.class, uc.level 
                 FROM user_champions uc 
                 JOIN heroes h ON uc.base_hero_id = h.id 
                 WHERE uc.user_id = ?`,
                [userId]
            );

            if (roster.length < 2) {
                return interaction.reply({ content: 'You need at least 2 champions in your roster to fight! Use `/summon` to recruit more.', ephemeral: true });
            }

            // 2. Create a selection menu for the user to pick their team
            const options = roster.map(champion => ({
                label: `${champion.name} (Lvl ${champion.level})`,
                description: `${champion.rarity} ${champion.class}`,
                value: champion.id.toString(),
            }));

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId(`fight_team_select`)
                .setPlaceholder('Select 2 champions for your team')
                .setMinValues(2)
                .setMaxValues(2)
                .addOptions(options);

            const row = new ActionRowBuilder().addComponents(selectMenu);

            await interaction.reply({
                content: 'Choose your team for the dungeon fight!',
                components: [row],
                ephemeral: true,
            });

        } catch (error) {
            console.error("Error in /fight command:", error);
            await interaction.reply({ content: 'An error occurred while preparing the fight.', ephemeral: true });
        }
    }
};
