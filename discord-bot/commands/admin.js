const { SlashCommandBuilder } = require('discord.js');
const userService = require('../src/utils/userService');
const { sendCardDM, sendWeaponDM } = require('../src/utils/embedBuilder');
const gameData = require('../util/gameData');
const { allPossibleWeapons } = require('../../backend/game/data');
const weaponService = require('../src/utils/weaponService');

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
  )
  .addSubcommand(sub =>
    sub
      .setName('grant-weapon')
      .setDescription('Grant a weapon to a player.')
      .addUserOption(opt =>
        opt.setName('user').setDescription('Recipient of the weapon').setRequired(true)
      )
      .addStringOption(opt =>
        opt
          .setName('weapon')
          .setDescription('Name of the weapon to grant')
          .setRequired(true)
          .setAutocomplete(true)
      )
  );

async function execute(interaction) {
  const allPossibleAbilities = Array.from(gameData.gameData.abilities.values());
  if (!interaction.member?.roles?.cache?.some(r => r.name === 'Game Master')) {
    await interaction.reply({
      content: 'You do not have the necessary permissions to use this command.',
      ephemeral: true
    });
    return;
  }

  const sub = interaction.options.getSubcommand();
  const target = interaction.options.getUser('user');
  const user = await userService.getUser(target.id);

  if (!user) {
    await interaction.reply({
      content: 'Error: This user has not started playing yet.',
      ephemeral: true
    });
    return;
  }

  if (sub === 'grant-ability') {
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
  } else if (sub === 'grant-weapon') {
    const weaponName = interaction.options.getString('weapon');
    const weapon = allPossibleWeapons.find(
      w => w.name.toLowerCase() === weaponName.toLowerCase()
    );

    if (!weapon) {
      await interaction.reply({
        content: `Error: Could not find a weapon named ${weaponName}.`,
        ephemeral: true
      });
      return;
    }

    await weaponService.addWeapon(user.id, weapon.id);

    await interaction.reply({
      content: `You have successfully granted ${weapon.name} to ${target.username}.`,
      ephemeral: true
    });

    try {
      await sendWeaponDM(target, weapon);
    } catch (err) {
      console.error('Failed to DM weapon:', err);
      await interaction.followUp({
        content: "I couldn't DM the weapon. Please check the target's privacy settings.",
        ephemeral: true
      });
    }
  }
}

async function autocomplete(interaction) {
  const allPossibleAbilities = Array.from(gameData.gameData.abilities.values());
  const focusedOption = interaction.options.getFocused(true);
  let choices = [];

  if (focusedOption.name === 'ability') {
    choices = allPossibleAbilities
      .filter(a => a.name.toLowerCase().includes(focusedOption.value.toLowerCase()))
      .map(a => ({ name: a.name, value: a.name }));
  } else if (focusedOption.name === 'weapon') {
    choices = allPossibleWeapons
      .filter(w => w.name.toLowerCase().includes(focusedOption.value.toLowerCase()))
      .map(w => ({ name: w.name, value: w.name }));
  }

  await interaction.respond(choices.slice(0, 25));
}

module.exports = { data, execute, autocomplete };
