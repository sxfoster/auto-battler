const { SlashCommandBuilder, StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const db = require('../util/database');
const { simple } = require('../src/utils/embedBuilder');
// Import the static hero data from your game files
const { allPossibleHeroes } = require('../../backend/game/data');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fight')
        .setDescription('Choose champions from your roster to enter a dungeon fight!'),
    async execute(interaction) {
        const userId = interaction.user.id;

        try {
            // Step 1: Fetch the user's roster IDs from the database.
            const [ownedChampions] = await db.execute(
                'SELECT id, base_hero_id, level FROM user_champions WHERE user_id = ?',
                [userId]
            );

            if (ownedChampions.length < 2) {
                return interaction.reply({ content: 'You need at least 2 champions in your roster to fight! Use `/summon` to recruit more.', ephemeral: true });
            }

            // Step 2: Combine DB data with static data from data.js to create select menu options.
            const options = ownedChampions.map(champion => {
                const staticData = allPossibleHeroes.find(h => h.id === champion.base_hero_id);
                // Fallback in case a hero in the DB doesn't exist in the data file
                const name = staticData ? staticData.name : `Unknown Hero (ID: ${champion.base_hero_id})`;
                const rarity = staticData ? staticData.rarity : 'Unknown';
                const heroClass = staticData ? staticData.class : 'Unknown';

                return {
                    label: `${name} (Lvl ${champion.level})`,
                    description: `${rarity} ${heroClass}`,
                    value: champion.id.toString(), // The unique ID from the user_champions table
                };
            });

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
