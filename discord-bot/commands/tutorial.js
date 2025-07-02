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
  const gameData = require('../util/gameData');
  const GameEngine = require('../../backend/game/engine');
  const { createCombatant } = require('../../backend/game/utils');
  const { runBattleLoop } = require('../src/utils/battleRunner');

  const user = await userService.getUser(interaction.user.id);
  if (!user) return;

  const ability = Array.from(gameData.gameData.abilities.values()).find(
    a => a.class === className && a.rarity === 'Common'
  );
  const goblin = gameData.getHeroes().find(h => h.name === 'Goblin');

  const player = createCombatant(
    {
      hero_id: ability ? ability.id : 1,
      ability_id: ability ? ability.id : null,
      weapon_id: null,
      name: interaction.user.username
    },
    'player',
    0
  );
  const enemy = createCombatant({ hero_id: goblin.id }, 'enemy', 0);

  const engine = new GameEngine([player, enemy], {
    isTutorial: true,
    playerName: interaction.user.username
  });

  await runBattleLoop(interaction, engine, { waitMs: 250, isTutorial: true });

  if (engine.winner !== 'player') {
    await interaction.followUp({ content: 'Defeated! Try again.', ephemeral: true });
    return;
  }

  const lootEmbed = edgarPainEmbed(
    "A Victor's Spoils",
    'Well fought! The goblin dropped its crude weapon and a strange-looking scroll. We can only carry one. What will you take?'
  );

  const lootRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('tutorial_loot_weapon')
      .setLabel('Take the Rusty Knife')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('⚔️'),
    new ButtonBuilder()
      .setCustomId('tutorial_loot_ability')
      .setLabel("Take the 'Power Strike' Scroll")
      .setStyle(ButtonStyle.Primary)
      .setEmoji('📜')
  );

  await userService.setUserClass(interaction.user.id, className);
  await userService.setTutorialStep(interaction.user.id, 'loot_choice');

  await interaction.followUp({ embeds: [lootEmbed], components: [lootRow], ephemeral: true });
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

async function handleLootChoice(interaction, choice) {
  const weaponService = require('../src/utils/weaponService');
  const abilityCardService = require('../src/utils/abilityCardService');
  const gameData = require('../util/gameData');

  const user = await userService.getUser(interaction.user.id);
  if (!user) return;

  let title = 'Spoils Taken';
  let dialogue = '';

  if (choice === 'weapon') {
    const weapon = Array.from(gameData.gameData.weapons.values()).find(
      w => w.name === 'Rusty Knife'
    );
    if (weapon) {
      const weaponId = await weaponService.addWeapon(user.id, weapon.id);
      await weaponService.setEquippedWeapon(user.id, weaponId);
    }
    dialogue =
      "A fine choice. A warrior's strength is in their steel. You've equipped the Rusty Knife.";
  } else {
    const ability = Array.from(gameData.gameData.abilities.values()).find(
      a => a.name === 'Power Strike'
    );
    if (ability) {
      await abilityCardService.addCard(user.id, ability.id, 20);
    }
    dialogue =
      "Wise. True power lies not in the weapon, but in the will to use it. A 'Power Strike' card has been added to your inventory.";
  }

  const finalEmbed = edgarPainEmbed(title, dialogue);
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('tutorial_go_to_town')
      .setLabel('Go to Town')
      .setStyle(ButtonStyle.Success)
  );

  await userService.setTutorialStep(interaction.user.id, 'town_arrival');
  await interaction.update({ embeds: [finalEmbed], components: [row] });
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

module.exports = { data, execute, handleInteraction, runTutorial, showArchetypePreview, handleLootChoice };
