const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder
} = require('discord.js');
const userService = require('../src/utils/userService');
const { edgarPainEmbed } = require('../src/utils/embedBuilder');
const { allPossibleHeroes, allPossibleAbilities } = require('../../backend/game/data');

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

async function showArchetypePreview(interaction, archetype) {
  const hero = allPossibleHeroes.find(h => h.class === archetype && h.isBase);
  const ability = allPossibleAbilities.find(
    a => a.class === archetype && a.rarity === 'Common'
  );

  const previewEmbed = edgarPainEmbed(
    `The ${archetype}`,
    `So, you have the heart of a ${archetype}. They are known for their resilience and powerful abilities like **${ability.name}**. Is this the path you wish to walk?`
  ).addFields({ name: 'Starting Ability', value: ability.effect });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`tutorial_confirm_archetype:${archetype}`)
      .setLabel(`Confirm ${archetype}`)
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('tutorial_choose_again')
      .setLabel('Choose Again')
      .setStyle(ButtonStyle.Secondary)
  );

  await interaction.update({ embeds: [previewEmbed], components: [row] });
}

async function execute(interaction) {
  let user = await userService.getUser(interaction.user.id);
  if (!user) {
    // This check is a safeguard; the router should have already created the user.
    user = await userService.createUser(interaction.user.id, interaction.user.username);
    await userService.setUserState(interaction.user.id, 'in_tutorial');
  }

  if (user.tutorial_completed) {
    await interaction.reply({ content: 'You have already completed the tutorial.', ephemeral: true });
    return;
  }

  // --- NARRATIVE OPENING ---
  const title = 'An Unwelcome Interruption';
  const dialogue = "You are on the road to Portal's Rest when a guttural cry echoes from the trees. Goblins! I can hold them off, but you'll need to fight. This is your first real test, adventurer. Show me what you're made of!";

  const ambushEmbed = edgarPainEmbed(title, dialogue);

  // The user is now officially in the tutorial's first real step.
  await userService.setTutorialStep(interaction.user.id, 'archetype_selection_prompt');

  // --- ARCHETYPE SELECTION MENU ---
  const archetypeMenu = new StringSelectMenuBuilder()
    .setCustomId('tutorial_archetype_select')
    .setPlaceholder('Choose your path...')
    .addOptions([
      { label: 'Stalwart Defender', description: 'A tough and resilient warrior.', value: 'Stalwart Defender' },
      { label: 'Raging Fighter', description: 'A ferocious and aggressive combatant.', value: 'Raging Fighter' },
      { label: 'Divine Healer', description: 'A supportive agent of healing and protection.', value: 'Divine Healer' },
      { label: 'Wilderness Expert', description: 'A skilled hunter and tracker.', value: 'Wilderness Expert' }
    ]);

  const row = new ActionRowBuilder().addComponents(archetypeMenu);

  await interaction.reply({ embeds: [ambushEmbed], components: [row], ephemeral: true });
}

module.exports = { data, execute, handleInteraction, runTutorial, showArchetypePreview };
