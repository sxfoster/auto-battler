const { MessageFlags } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');
const db = require('../util/database');
const { simple } = require('../src/utils/embedBuilder');
const { getMonsters } = require('../util/gameData');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unleash')
        .setDescription('Use a Corrupted Lodestone to unleash a monster for your roster.'),
    async execute(interaction) {
        const userId = interaction.user.id;
        const LODESTONE_COST = 1;

        // Placeholder currency check - replace with real query when available
        const userHasStones = true;
        if (!userHasStones) {
            return interaction.reply({ content: 'You do not have a Corrupted Lodestone to unleash a monster.', flags: [MessageFlags.Ephemeral] });
        }

        const monsters = getMonsters();
        const summonedMonster = monsters[Math.floor(Math.random() * monsters.length)];

        await db.execute('INSERT INTO user_champions (user_id, base_hero_id) VALUES (?, ?)', [userId, summonedMonster.id]);

        const embed = simple('🔥 A Monster Emerges! 🔥', [
            { name: summonedMonster.name, value: `Rarity: ${summonedMonster.rarity}\nTrait: ${summonedMonster.trait}` }
        ]);
        await interaction.reply({ embeds: [embed] });
    }
};
