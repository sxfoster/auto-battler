const { SlashCommandBuilder } = require('discord.js');

const data = new SlashCommandBuilder()
  .setName('adventure')
  .setDescription('Embark on an adventure');

async function execute(interaction) {
  await interaction.reply({ content: 'Adventure command not implemented yet.', ephemeral: true });
}

module.exports = { data, execute };
