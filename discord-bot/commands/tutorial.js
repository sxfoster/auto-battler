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

async function handleInteraction(interaction, userState) {
  // The 'welcome' step is now handled by the execute function when a new user uses /tutorial.
  // If an existing user in tutorial uses /tutorial again, or if they are at other steps,
  // this function will handle button presses or other interactions.

  // No longer allowing /tutorial chat command to re-trigger startTutorial flow here.
  // It should be handled by the execute() for new users or provide guidance for existing.
  if (interaction.isChatInputCommand()) {
    // If user is already in tutorial and tries /tutorial again
    await interaction.reply({ content: "You are already in the tutorial. Please follow the prompts or use the buttons provided.", ephemeral: true });
    return;
  }

  const errorReply = async () =>
    interaction.reply({ content: 'Please follow the tutorial steps using the buttons or menus provided.', ephemeral: true });

  switch (userState.tutorial_step) {
    case 'archetype_selection_prompt':
      if (typeof interaction.isStringSelectMenu === 'function' &&
          interaction.isStringSelectMenu() &&
          interaction.customId === 'tutorial_archetype_select') {
        const selectedArchetype = interaction.values[0];
        await module.exports.showArchetypePreview(interaction, selectedArchetype);
      } else if (interaction.isButton && interaction.isButton() && interaction.customId.startsWith('tutorial_confirm_archetype')) {
        const archetype = interaction.customId.split(':')[1];
        const updatePayload = { content: `You have chosen the path of the ${archetype}! Prepare for battle...`, embeds: [], components: [] };
        if (typeof interaction.update === 'function') {
          await interaction.update(updatePayload);
        } else if (typeof interaction.reply === 'function') {
          await interaction.reply(updatePayload);
        }
        await module.exports.runTutorial(interaction, archetype);
      } else if (interaction.isButton && interaction.isButton() && interaction.customId === 'tutorial_choose_again') {
        const { execute } = require('./tutorial');
        await execute(interaction, true);
      } else {
        await errorReply();
      }
      break;
    case 'loot_choice':
      if (interaction.isButton() && (interaction.customId === 'tutorial_loot_weapon' || interaction.customId === 'tutorial_loot_ability')) {
        const choice = interaction.customId === 'tutorial_loot_weapon' ? 'weapon' : 'ability';
        await module.exports.handleLootChoice(interaction, choice);
      } else {
        await errorReply();
      }
      break;
    case 'town_arrival':
      if (interaction.isButton() && interaction.customId === 'tutorial_go_to_town') {
        await userService.completeTutorial(interaction.user.id);
        await userService.setUserState(interaction.user.id, 'active');
        await userService.setUserLocation(interaction.user.id, 'town');
        await interaction.update({ content: "Tutorial complete! You have arrived at Portal's Rest.", components: [] });
        const townCommand = interaction.client.commands.get('town');
        if (townCommand) {
          await townCommand.execute(interaction, true);
        }
      } else {
        await errorReply();
      }
      break;
    default:
      // Catch-all for unexpected interactions during the tutorial
      if ((interaction.isButton && interaction.isButton()) ||
          (typeof interaction.isStringSelectMenu === 'function' && interaction.isStringSelectMenu())) {
        await errorReply();
      }
  }
}

async function runTutorial(interaction, className) {
  const gameData = require('../util/gameData');
  const GameEngine = require('../../backend/game/engine');
  const { createCombatant } = require('../../backend/game/utils');
  const { runBattleLoop } = require('../src/utils/battleRunner');

  const user = await userService.getUser(interaction.user.id);
  if (!user) {
    // Should not happen if called from a valid interaction flow
    await interaction.followUp({ content: "Error: Could not find user data for the tutorial battle.", ephemeral: true });
    return;
  }

  // Ensure user is marked as in_tutorial, though they should be already.
  await userService.setUserState(interaction.user.id, 'in_tutorial');
  await userService.setTutorialStep(interaction.user.id, 'practice_battle');

  const hero = Array.from(gameData.gameData.heroes.values()).find(
    h => h.class === className && h.isBase === true
  );
  const ability = Array.from(gameData.gameData.abilities.values()).find(
    a => a.class === className && a.rarity === 'Common'
  );
  const goblin = gameData.getHeroes().find(h => h.name === 'Goblin');

  if (!goblin) {
    await interaction.followUp({ content: "Error: Goblin data not found for tutorial battle. Please contact an admin.", ephemeral: true });
    return;
  }
  if (!hero) {
    await interaction.followUp({ content: "Error: Starting hero not found for tutorial battle.", ephemeral: true });
    return;
  }
  if (!ability) {
    // Fallback or error if class-specific common ability isn't found.
    // This indicates a potential data issue or className mismatch.
    // For now, let's log and use a generic approach or error out.
    console.error(`TUTORIAL: Common ability for class ${className} not found.`);
    // Using a default placeholder ID if ability isn't found, ensure createCombatant handles this.
    // It's better to ensure data integrity or have a defined fallback.
  }

  const player = createCombatant(
    {
      // Use the base hero for this class as the starting character
      hero_id: hero ? hero.id : 1,
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

// Added isReprompt flag for "Choose Again" functionality
async function execute(interaction, isReprompt = false) {
  let user = await userService.getUser(interaction.user.id);

  // This check is a safeguard; the router should have already created the user for the initial run.
  // For re-prompts, the user will definitely exist.
  if (!user && !isReprompt) {
    // This case should ideally not be hit if interactionRouter works as expected.
    user = await userService.createUser(interaction.user.id, interaction.user.username);
    await userService.setUserState(interaction.user.id, 'in_tutorial');
  } else if (!user && isReprompt) {
    // Should not happen: re-prompting for a non-existent user.
    await interaction.reply({ content: "Error: Could not find user data to continue tutorial.", ephemeral: true });
    return;
  }


  if (user.tutorial_completed && !isReprompt) { // Don't show this if we are just re-prompting for archetype
    await interaction.reply({ content: 'You have already completed the tutorial.', ephemeral: true });
    return;
  }

  // --- NARRATIVE OPENING (only for the very first time, not for re-prompt) ---
  const title = 'An Unwelcome Interruption';
  const dialogue = "You are on the road to Portal's Rest when a guttural cry echoes from the trees. Goblins! I can hold them off, but you'll need to fight. This is your first real test, adventurer. Show me what you're made of!";
  const ambushEmbed = edgarPainEmbed(title, dialogue);

  if (!isReprompt) {
    // The user is now officially in the tutorial's first real step.
    // This ensures state is correctly set if router didn't (e.g. if user used /tutorial directly after creation)
    await userService.setUserState(interaction.user.id, 'in_tutorial');
    await userService.setTutorialStep(interaction.user.id, 'archetype_selection_prompt');
  } else {
    // If re-prompting, ensure the step is relevant for archetype selection
    await userService.setTutorialStep(interaction.user.id, 'archetype_selection_prompt');
  }


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

  const messagePayload = { embeds: [ambushEmbed], components: [row], ephemeral: true };

  if (isReprompt) {
    // If we are re-prompting (e.g., after "Choose Again"), update the existing message.
    // This assumes the interaction is from a button that can be .update()'d.
    // The 'tutorial_choose_again' button is part of a message that was already replied to or updated.
    await interaction.update(messagePayload);
  } else {
    // For the initial /tutorial command by a new user.
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(messagePayload);
    } else {
      await interaction.reply(messagePayload);
    }
  }
}

module.exports = { data, execute, handleInteraction, runTutorial, showArchetypePreview, handleLootChoice };
