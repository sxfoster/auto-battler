const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');
const userService = require('../src/utils/userService');

const data = new SlashCommandBuilder()
  .setName('tutorial')
  .setDescription('Start or continue the guided tutorial');

async function startTutorial(interaction) {
  let user = await userService.getUser(interaction.user.id);
  if (!user) {
    await userService.createUser(interaction.user.id, interaction.user.username);
    user = await userService.getUser(interaction.user.id);
  }
  await userService.setUserState(interaction.user.id, 'in_tutorial');
  await userService.setTutorialStep(interaction.user.id, 'town');

  await interaction.reply({ content: 'https://youtu.be/mnOVJ-ucQPM', ephemeral: true });

  const introEmbed = new EmbedBuilder()
    .setTitle('Edgar Pain')
    .setDescription('Stay only for a moment, and cover your ears.')
    .setColor('#29b6f6');
  await interaction.followUp({ embeds: [introEmbed], ephemeral: true });

  const townEmbed = new EmbedBuilder()
    .setTitle("Welcome to Portal's Rest")
    .setDescription('The bustling town is full of opportunities. Where will you go?')
    .setImage('https://i.imgur.com/2pCIH22.png');

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('tutorial_complete').setLabel('Finish Tutorial').setStyle(ButtonStyle.Primary)
  );

  await interaction.followUp({ embeds: [townEmbed], components: [row], ephemeral: true });
}

async function handleInteraction(interaction, userState) {
  switch (userState.tutorial_step) {
    case 'welcome':
      if (interaction.isChatInputCommand()) {
        await startTutorial(interaction);
      } else {
        await interaction.reply({ content: 'Use /tutorial to begin the tutorial.', ephemeral: true });
      }
      break;
    default:
      if (interaction.isChatInputCommand()) {
        await startTutorial(interaction);
      } else if (interaction.isButton() && interaction.customId === 'tutorial_complete') {
        await userService.completeTutorial(interaction.user.id);
        await interaction.update({ content: 'Tutorial complete! You are now in town.', components: [] });
      } else if (
        interaction.isButton() &&
        interaction.customId.startsWith('tutorial_select_') &&
        typeof module.exports.runTutorial === 'function'
      ) {
        const map = {
          tutorial_select_tank: 'Stalwart Defender',
          tutorial_select_archer: 'Swift Marksman',
          tutorial_select_mage: 'Arcane Savant'
        };
        const chosen = map[interaction.customId];
        await interaction.update({});
        await module.exports.runTutorial(interaction, chosen);
      } else {
        await interaction.reply({ content: 'Follow the tutorial steps using the buttons provided.', ephemeral: true });
      }
  }
}

async function runTutorial(interaction, className) {
  const abilityCardService = require('../src/utils/abilityCardService');
  const weaponService = require('../src/utils/weaponService');
  const gameData = require('../util/gameData');

  const user = await userService.getUser(interaction.user.id);
  if (!user) return;

  const ability = Array.from(gameData.gameData.abilities.values()).find(a => a.class === className);
  const weapon = Array.from(gameData.gameData.weapons.values())[0];

  if (ability) {
    const cardId = await abilityCardService.addCard(user.id, ability.id);
    await userService.setActiveAbility(interaction.user.id, cardId);
  }

  if (weapon) {
    const weaponInstanceId = await weaponService.addWeapon(user.id, weapon.id);
    await weaponService.setEquippedWeapon(user.id, weaponInstanceId);
  }

  await userService.setUserClass(interaction.user.id, className);
  await userService.markTutorialComplete(interaction.user.id);
  await interaction.followUp({ content: 'Tutorial complete!', ephemeral: true });
}

async function execute(interaction) {
  const user = await userService.getUser(interaction.user.id);
  if (user && user.tutorial_completed) {
    await interaction.reply({ content: 'You have already completed the tutorial.', ephemeral: true });
    return;
  }
  await startTutorial(interaction);
}

module.exports = { data, execute, handleInteraction, runTutorial };
