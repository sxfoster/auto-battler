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


const tutorialLoot = new Map();

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

  const scenes = [
    {
      title: 'The Shattering',
      text: 'The sky burned once. Reality fractured. And from the heart of the ruin, the first Echo was born.',
      videoUrl: 'https://youtu.be/9dPwnqhRQwU'
    }
  ];

  const firstScene = scenes[0];

  // Send the video URL first so Discord embeds the video player
  await interaction.reply({ content: firstScene.videoUrl, ephemeral: true });

  // Follow up with the lore embed
  const loreEmbed = new EmbedBuilder()
    .setTitle(firstScene.title)
    .setDescription(firstScene.text)
    .setColor('#29b6f6');

  await interaction.followUp({ embeds: [loreEmbed], ephemeral: true });

  for (let i = 1; i < scenes.length; i++) {
    const scene = scenes[i];
    const embed = new EmbedBuilder().setTitle(scene.title).setDescription(scene.text).setImage(scene.image);
    await interaction.followUp({ embeds: [embed], ephemeral: true });
  }

  const finalEmbed = new EmbedBuilder()
    .setTitle('First Encounter')
    .setDescription('A goblin ambushes you on the road! Choose how you will defend yourself.')
    .setImage('https://placehold.co/600x400?text=First+Encounter');

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('tutorial_select_tank').setLabel('Stalwart Defender').setEmoji('🛡️').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('tutorial_select_dps').setLabel('Raging Fighter').setEmoji('⚔️').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('tutorial_select_healer').setLabel('Divine Healer').setEmoji('❤️‍🩹').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('tutorial_select_support').setLabel('Inspiring Artist').setEmoji('🎶').setStyle(ButtonStyle.Primary)
  );

  await interaction.followUp({ embeds: [finalEmbed], components: [row], ephemeral: true });
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

module.exports = { data, execute, runTutorial, tutorialLoot };
