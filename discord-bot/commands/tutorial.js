const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');
const userService = require('../src/utils/userService');
const weaponService = require('../src/utils/weaponService');
const abilityCardService = require('../src/utils/abilityCardService');
const GameEngine = require('../../backend/game/engine');
const { createCombatant } = require('../../backend/game/utils');
const {
  allPossibleHeroes,
  allPossibleAbilities,
  allPossibleWeapons
} = require('../../backend/game/data');


// Track temporary tutorial state per user
const tutorialLoot = new Map();
const tutorialState = new Map();

const data = new SlashCommandBuilder()
  .setName('tutorial')
  .setDescription('Start the guided tutorial');

async function execute(interaction) {
  let user = await userService.getUser(interaction.user.id);
  if (!user) {
    await userService.createUser(interaction.user.id, interaction.user.username);
    user = await userService.getUser(interaction.user.id);
  }

  if (user.tutorial_completed) {
    await interaction.reply({ content: 'You have already completed the tutorial.', ephemeral: true });
    return;
  }
  // Step 1 - Lore introduction
  await interaction.reply({ content: 'https://youtu.be/9dPwnqhRQwU', ephemeral: true });

  const introEmbed = new EmbedBuilder()
    .setTitle('Edgar Pain')
    .setDescription('Stay only for a moment, and cover your ears.')
    .setColor('#29b6f6');

  await interaction.followUp({ embeds: [introEmbed], ephemeral: true });

  // Step 2 - Welcome to town
  const townEmbed = new EmbedBuilder()
    .setTitle("Welcome to Portal's Rest")
    .setDescription('The bustling town is full of opportunities. Where will you go?')
    .setImage('https://i.imgur.com/2pCIH22.png');

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('tutorial_auctionhouse').setLabel('Auction House').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('tutorial_inventory').setLabel('Inventory').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('tutorial_adventure').setLabel('Adventure').setStyle(ButtonStyle.Success)
  );

  tutorialState.set(interaction.user.id, { step: 'town' });
  await interaction.followUp({ embeds: [townEmbed], components: [row], ephemeral: true });
}

async function runTutorial(interaction, archetype) {
  let user = await userService.getUser(interaction.user.id);
  if (!user) {
    await userService.createUser(interaction.user.id, interaction.user.username);
    user = await userService.getUser(interaction.user.id);
  }

  const hero = allPossibleHeroes.find(h => h.class === archetype && h.isBase);
  const ability = allPossibleAbilities.find(a => a.class === archetype && a.rarity === 'Common');
  const rustyKnife = allPossibleWeapons.find(w => w.name === 'Rusty Knife');

  const cardId = await abilityCardService.addCard(user.id, ability.id, 40);
  const weaponId = rustyKnife ? await weaponService.addWeapon(user.id, rustyKnife.id) : null;

  await userService.setActiveAbility(interaction.user.id, cardId);
  if (weaponId) {
    await weaponService.setEquippedWeapon(user.id, weaponId);
  }
  await userService.setUserClass(interaction.user.id, archetype);

  const player = createCombatant({ hero_id: hero.id, ability_card: { id: cardId, ability_id: ability.id, charges: 40 }, weapon_id: rustyKnife ? rustyKnife.id : null, name: interaction.user.username }, 'player', 0);

  const goblin = {
    id: 'enemy-0',
    name: 'Tutorial Goblin',
    heroData: { name: 'Tutorial Goblin', hp: 10, attack: 1, speed: 1, defense: 0 },
    weaponData: rustyKnife,
    armorData: null,
    abilityData: null,
    abilityCharges: 0,
    deck: [],
    team: 'enemy',
    position: 0,
    currentHp: 10,
    maxHp: 10,
    currentEnergy: 0,
    statusEffects: [],
    hp: 10,
    attack: 1 + (rustyKnife ? rustyKnife.statBonuses.ATK || 0 : 0),
    speed: 1,
    defense: 0
  };

  tutorialLoot.set(interaction.user.id, {
    weapon: rustyKnife ? rustyKnife.name : null,
    ability: ability.name
  });

  const startEmbed = new EmbedBuilder()
    .setTitle('Ambush!')
    .setDescription(
      "While traveling to Portal's Rest, a greedy goblin leaps from the bushes, blocking your path!"
    );
  await interaction.followUp({ embeds: [startEmbed], ephemeral: true });

  const engine = new GameEngine(
    [player, goblin],
    { isNarrative: true, playerName: interaction.user.username, isTutorial: true }
  );
  const { runBattleLoop } = require('../src/utils/battleRunner');
  await runBattleLoop(interaction, engine, { waitMs: 1000 });

  const victoryEmbed = new EmbedBuilder()
    .setTitle('Victory!')
    .setDescription('The goblin collapses at your feet.');

  const lootRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('tutorial_loot_goblin')
      .setLabel('Loot the Goblin')
      .setStyle(ButtonStyle.Primary)
  );

  await interaction.followUp({ embeds: [victoryEmbed], components: [lootRow], ephemeral: true });
}

module.exports = { data, execute, runTutorial, tutorialLoot, tutorialState };
