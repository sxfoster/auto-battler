const { SlashCommandBuilder } = require('discord.js');
const { simple } = require('../src/utils/embedBuilder');
const userService = require('../src/utils/userService');

const data = new SlashCommandBuilder()
  .setName('leaderboard')
  .setDescription('Displays the top players.');

async function execute(interaction) {
  const allUsers = await userService.getLeaderboardData();

  const topPve = allUsers
    .sort((a, b) => b.pve_ratio - a.pve_ratio)
    .slice(0, 3)
    .map((u, i) => `${i + 1}. <@${u.discord_id}> (${u.pve_wins}-${u.pve_losses})`)
    .join('\n') || 'No PvE battles recorded yet.';

  const topPvp = allUsers
    .sort((a, b) => b.pvp_ratio - a.pvp_ratio)
    .slice(0, 3)
    .map((u, i) => `${i + 1}. <@${u.discord_id}> (${u.pvp_wins}-${u.pvp_losses})`)
    .join('\n') || 'No PvP battles recorded yet.';

  const embed = simple('Leaderboards', [
    { name: 'Top 3 PvE Adventurers', value: topPve },
    { name: 'Top 3 PvP Duelists', value: topPvp }
  ]);

  await interaction.reply({ embeds: [embed] });
}

module.exports = { data, execute };
