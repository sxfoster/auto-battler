const { SlashCommandBuilder } = require('discord.js');
const db = require('../util/database');
const { simple } = require('../src/utils/embedBuilder');
const { allPossibleHeroes } = require('../../backend/game/data');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('summon')
        .setDescription('Use summoning shards to recruit a new champion to your roster.'),
    async execute(interaction) {
        const userId = interaction.user.id;
        const SHARD_COST = 10;

        try {
            const [userRows] = await db.execute('SELECT summoning_shards FROM users WHERE discord_id = ?', [userId]);
            if (userRows.length === 0 || userRows[0].summoning_shards < SHARD_COST) {
                return interaction.reply({ content: `You don't have enough summoning shards! You need ${SHARD_COST}.`, ephemeral: true });
            }

            await db.execute('UPDATE users SET summoning_shards = summoning_shards - ? WHERE discord_id = ?', [SHARD_COST, userId]);

            const roll = Math.random();
            let rarity = 'Common';
            if (roll < 0.005) rarity = 'Epic';
            else if (roll < 0.05) rarity = 'Rare';
            else if (roll < 0.30) rarity = 'Uncommon';

            const possibleHeroes = allPossibleHeroes.filter(h => h.rarity === rarity);
            const summonedHero = possibleHeroes[Math.floor(Math.random() * possibleHeroes.length)];

            await db.execute('INSERT INTO user_champions (user_id, base_hero_id) VALUES (?, ?)', [userId, summonedHero.id]);

            const embed = simple(`✨ You Summoned a Champion! ✨`, [
                { name: summonedHero.name, value: `Rarity: ${summonedHero.rarity}\nClass: ${summonedHero.class}` }
            ]);
            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error in /summon command:', error);
            await interaction.reply({ content: 'An error occurred while trying to summon a champion.', ephemeral: true });
        }
    }
};
