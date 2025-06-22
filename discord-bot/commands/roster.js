const { SlashCommandBuilder } = require('discord.js');
const db = require('../util/database');
const { simple } = require('../src/utils/embedBuilder');
const { allPossibleHeroes } = require('../../backend/game/data');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roster')
        .setDescription("View your collected champions."),
    async execute(interaction) {
        try {
            const [roster] = await db.execute(
                `SELECT h.name, h.rarity, h.class, uc.level 
                 FROM user_champions uc 
                 JOIN heroes h ON uc.base_hero_id = h.id 
                 WHERE uc.user_id = ? ORDER BY h.rarity DESC, uc.level DESC`,
                [interaction.user.id]
            );

            if (roster.length === 0) {
                return interaction.reply({ content: 'Your roster is empty. Use `/summon` to recruit some champions!', ephemeral: true });
            }

            const fields = roster.slice(0, 25).map(c => ({
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
