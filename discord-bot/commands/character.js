const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const db = require('../util/database');
const { simple } = require('../src/utils/embedBuilder');

async function execute(interaction) {
  const discordId = interaction.user.id;
  const name = interaction.user.username;
  const { rows } = await db.query('SELECT * FROM players WHERE discord_id = ?', [discordId]);
  if (rows.length === 0) {
    await db.query('INSERT INTO players (discord_id, name) VALUES (?, ?)', [discordId, name]);
    const embed = simple('Character created! Choose your class:');
    const menu = new StringSelectMenuBuilder()
      .setCustomId('class-select')
      .setPlaceholder('Select your class')
      .addOptions([
        { label: 'Warrior', value: 'Warrior' },
        { label: 'Mage', value: 'Mage' }
      ]);
    const row = new ActionRowBuilder().addComponents(menu);
    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  } else {
    const embed = simple('You already have a character.');
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
}

async function handleClassSelect(interaction) {
  const selected = interaction.values[0];
  await interaction.reply({ content: `Class selected: ${selected}`, ephemeral: true });
}

module.exports = {
  data: new SlashCommandBuilder().setName('character').setDescription('Create your character'),
  execute,
  handleClassSelect
};
