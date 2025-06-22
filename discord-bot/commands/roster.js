const { SlashCommandBuilder } = require('discord.js');
const db = require('../util/database');
const { simple } = require('../src/utils/embedBuilder');
// Import the static hero data from your game files
const { allPossibleHeroes } = require('../../backend/game/data');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roster')
        .setDescription("View your collected champions."),
    async execute(interaction) {
        try {
            // Step 1: Fetch the list of champions the user owns from the database.
            const [ownedChampions] = await db.execute(
                'SELECT base_hero_id, level FROM user_champions WHERE user_id = ? ORDER BY id DESC',
                [interaction.user.id]
            );

            if (ownedChampions.length === 0) {
                return interaction.reply({ content: 'Your roster is empty. Use `/summon` to recruit some champions!', ephemeral: true });
            }

            // Step 2: Combine the database data with the static hero data from data.js.
            const rosterDetails = ownedChampions.map(ownedChampion => {
                const staticData = allPossibleHeroes.find(h => h.id === ownedChampion.base_hero_id);
                if (!staticData) return null; // Handle cases where a hero might not be found

                return {
                    name: staticData.name,
                    rarity: staticData.rarity,
                    class: staticData.class,
                    level: ownedChampion.level,
                };
            }).filter(Boolean); // Filter out any null results

            // Step 3: Format the combined data into an embed.
            const fields = rosterDetails.slice(0, 25).map(c => ({ // Discord embeds are limited to 25 fields
                name: `${c.name} (Lvl ${c.level})`,
                value: `${c.rarity} ${c.class}`,
                inline: true,
            }));

            const embed = simple("Your Champion Roster", fields);
            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error("Error in /roster command:", error);
            await interaction.reply({ content: 'Could not fetch your roster.', ephemeral: true });
        }
    }
};
