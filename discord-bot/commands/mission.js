const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { simple } = require('../src/utils/embedBuilder');
const missionService = require('../src/services/missionService');

const missionsPath = path.join(__dirname, '../src/data/missions');

function loadMission(name) {
  const file = path.join(missionsPath, `${name}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mission')
    .setDescription('Mission commands')
    .addSubcommand(sub =>
      sub
        .setName('start')
        .setDescription('Start a mission')
        .addStringOption(opt =>
          opt.setName('name').setDescription('Mission name').setRequired(true)
        )
    ),

  async execute(interaction) {
    if (interaction.options.getSubcommand() !== 'start') return;

    const missionName = interaction.options.getString('name');
    const mission = loadMission(missionName);
    if (!mission) {
      await interaction.reply({ embeds: [simple('Mission not found.')], ephemeral: true });
      return;
    }

    const playerId = await missionService.getPlayerId(interaction.user.id);
    if (!playerId) {
      await interaction.reply({ embeds: [simple('You have no character.')], ephemeral: true });
      return;
    }

    const thread = await interaction.channel.threads.create({
      name: mission.name,
      autoArchiveDuration: 60
    });

    await thread.send(mission.intro);
    const logId = await missionService.startMission(playerId, mission.id);
    let durability = 3;
    for (let i = 0; i < mission.rounds.length; i++) {
      const round = mission.rounds[i];
      const opts = round.options.map((o, idx) => `${idx + 1}. ${o.text}`).join('\n');
      await thread.send(`${round.text}\n${opts}`);
      const choice = 0; // auto-select first option
      const delta = round.options[choice].durability || 0;
      missionService.recordChoice(logId, i, choice, delta);
      durability += delta;
    }
    const outcome = durability > 0 ? 'success' : 'fail';
    await missionService.completeMission(logId, outcome, mission.rewards, mission.codexFragment, playerId);
    await thread.send(`Mission complete with outcome: ${outcome}`);
    await interaction.reply({ embeds: [simple('Mission started! Check the thread.')], ephemeral: true });
  }
};
