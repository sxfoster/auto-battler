const { SlashCommandBuilder } = require('discord.js');
const db = require('../util/database');
const { simple } = require('../src/utils/embedBuilder');
const missionService = require('../src/services/missionService');
const playerService = require('../src/services/playerService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('repair')
    .setDescription('Repair all of your gear'),
  async execute(interaction) {
    const playerId = await missionService.getPlayerId(interaction.user.id);
    if (!playerId) {
      await interaction.reply({ embeds: [simple('You have no character.')], ephemeral: true });
      return;
    }

    const state = await playerService.getPlayerState(playerId);
    if (state !== 'idle') {
      await interaction.reply({ embeds: [simple('You are busy and cannot repair right now.')], ephemeral: true });
      return;
    }

    await Promise.all([
      db.query('UPDATE user_weapons SET durability = 100 WHERE player_id = ?', [playerId]),
      db.query('UPDATE user_armors SET durability = 100 WHERE player_id = ?', [playerId]),
      db.query('UPDATE user_ability_cards SET durability = 100 WHERE player_id = ?', [playerId])
    ]);

    await interaction.reply({ embeds: [simple('All equipment repaired!')], ephemeral: true });
  }
};
