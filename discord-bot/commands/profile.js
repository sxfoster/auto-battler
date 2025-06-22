const { SlashCommandBuilder } = require('discord.js');
const db = require('../util/database');
const { simple } = require('../src/utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('View your currency balances'),
  async execute(interaction) {
    const userId = interaction.user.id;
    await interaction.deferReply({ ephemeral: true });

    let [rows] = await db.execute(
      'SELECT soft_currency, hard_currency, summoning_shards FROM users WHERE discord_id = ?',
      [userId]
    );
    let user = rows[0];
    if (!user) {
      await db.execute(
        'INSERT INTO users (discord_id, soft_currency, hard_currency, summoning_shards) VALUES (?, 0, 0, 0)',
        [userId]
      );
      user = { soft_currency: 0, hard_currency: 0, summoning_shards: 0 };
    }

    const fields = [
      { name: 'Gold', value: String(user.soft_currency), inline: true },
      { name: 'Gems', value: String(user.hard_currency), inline: true },
      { name: 'Summoning Shards', value: String(user.summoning_shards), inline: true }
    ];

    const embed = simple(`${interaction.user.username}'s Profile`, fields);
    await interaction.editReply({ embeds: [embed] });
  }
};
