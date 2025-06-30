const { SlashCommandBuilder } = require('discord.js');
const userService = require('../src/utils/userService');
const { sendCardDM } = require('../src/utils/embedBuilder');
const { allPossibleAbilities } = require('../../backend/game/data');

const data = new SlashCommandBuilder()
  .setName('admin')
  .setDescription('Administrative commands')
  .addSubcommand(sub =>
    sub
      .setName('grant-ability')
      .setDescription('Grant an ability card to a player')
      .addUserOption(opt =>
        opt
          .setName('user')
          .setDescription('Recipient of the ability card')
          .setRequired(true)
      )
      .addStringOption(opt =>
        opt
          .setName('ability')
          .setDescription('Name of the ability to grant')
          .setRequired(true)
          .setAutocomplete(true)
      )
  );

async function execute(interaction) {
  if (!interaction.member?.roles?.cache?.some(r => r.name === 'Game Master')) {
    await interaction.reply({
      content: 'You do not have the necessary permissions to use this command.',
      ephemeral: true
    });
    return;
  }

  const sub = interaction.options.getSubcommand();
  if (sub !== 'grant-ability') return;

  const target = interaction.options.getUser('user');
  const abilityName = interaction.options.getString('ability');
  const ability = allPossibleAbilities.find(
    a => a.name.toLowerCase() === abilityName.toLowerCase()
  );
  if (!ability) {
    await interaction.reply({
      content: `Error: Could not find an ability named ${abilityName}.`,
      ephemeral: true
    });
    return;
  }

  const user = await userService.getUser(target.id);
  if (!user) {
    await interaction.reply({
      content: 'Error: This user has not started playing yet and cannot be granted an ability.',
      ephemeral: true
    });
    return;
  }

  await userService.addAbility(target.id, ability.id);

  await interaction.reply({
    content: `You have successfully granted ${ability.name} to ${target.username}.`,
    ephemeral: true
  });

  try {
    await sendCardDM(target, ability);
  } catch (err) {
    console.error('Failed to DM ability card:', err);
    await interaction.followUp({
      content: "I couldn't DM the ability card. Please check the target's privacy settings.",
      ephemeral: true
    });
  }
}

async function autocomplete(interaction) {
  const focused = interaction.options.getFocused();
  const filtered = allPossibleAbilities
    .filter(a => a.name.toLowerCase().includes(focused.toLowerCase()))
    .slice(0, 25)
    .map(a => ({ name: a.name, value: a.name }));
  await interaction.respond(filtered);
}

module.exports = { data, execute, autocomplete };
