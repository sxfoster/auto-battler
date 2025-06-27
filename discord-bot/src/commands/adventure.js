const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const userService = require('../utils/userService');
const abilityCardService = require('../utils/abilityCardService');
const { sendCardDM } = require('../utils/embedBuilder');

const MAX_LOG_LINES = 20;
const GameEngine = require('../../../backend/game/engine');
const { createCombatant } = require('../../../backend/game/utils');
const { allPossibleHeroes, allPossibleAbilities } = require('../../../backend/game/data');
const classes = require('../data/classes');
const classAbilityMap = require('../data/classAbilityMap');

const data = new SlashCommandBuilder()
  .setName('adventure')
  .setDescription('Enter the goblin cave for a practice battle');

async function execute(interaction) {
  const user = await userService.getUser(interaction.user.id);

  if (!user || !user.class) {
    await interaction.reply({ content: 'You must select a class before you can go on an adventure! Use the /game command to get started.', ephemeral: true });
    return;
  }

  const playerHero = allPossibleHeroes.find(h => (h.class === user.class || h.name === user.class) && h.isBase);
  if (!playerHero) {
    await interaction.reply({ content: 'Required hero data missing.', ephemeral: true });
    return;
  }

  const classNames = classes.map(c => c.name);
  const goblinClass = classNames[Math.floor(Math.random() * classNames.length)];
  const goblinBase = allPossibleHeroes.find(h => (h.class === goblinClass || h.name === goblinClass) && h.isBase);

  if (!goblinBase) {
    await interaction.reply({ content: 'Required goblin data missing.', ephemeral: true });
    return;
  }

  // Using the fix from our previous discussion to ensure equipped abilities are used
  const userCards = await abilityCardService.getCards(user.id);
  const equippedCard = userCards.find(c => c.id === user.equipped_ability_id);
  const playerData = {
    hero_id: playerHero.id,
    ability_id: equippedCard ? equippedCard.ability_id : null,
    deck: userCards.filter(c => c.id !== user.equipped_ability_id).map(c => c.ability_id)
  };
  const player = createCombatant(playerData, 'player', 0);

  const goblinAbilityPool = allPossibleAbilities.filter(a => a.class === (classAbilityMap[goblinClass] || goblinClass) && a.rarity === 'Common');
  const goblinAbilities = goblinAbilityPool.map(a => a.id);
  const goblin = createCombatant({ hero_id: goblinBase.id, deck: goblinAbilities }, 'enemy', 0);
  const goblinName = `Goblin ${goblinClass}`;
  goblin.heroData = { ...goblin.heroData, name: goblinName };

  console.log(`[BATTLE START] User: ${interaction.user.username} (${user.class}) vs. ${goblinName}`);

  // The interactive log will be edited here (implementation from previous steps)
  const battleMessage = await interaction.reply({ content: 'The battle begins...', fetchReply: true });

  const engine = new GameEngine([player, goblin]);
  // This loop would be implemented to yield results step-by-step
  const battleLog = engine.runFullGame(); // For now, we run the whole game

  console.log(`[BATTLE END] User: ${interaction.user.username} | Result: ${engine.winner === 'player' ? 'Victory' : 'Defeat'}`);

  let narrativeDescription = '';
  let lootDrop = null;
  const adventurerName = `**${interaction.user.username}**`;
  const enemyName = `a **${goblinName}**`;

  if (engine.winner === 'player') {
    lootDrop = goblinAbilityPool[Math.floor(Math.random() * goblinAbilityPool.length)];
    let dropText = 'who was slain.';
    if (lootDrop) {
      dropText = `who was slain and dropped **${lootDrop.name}**.`;
      console.log(`[ITEM LOOT] User: ${interaction.user.username} looted Ability: ${lootDrop.name} (ID: ${lootDrop.id})`);
      await userService.addAbility(interaction.user.id, lootDrop.id);
    }
    narrativeDescription = `${adventurerName} adventured into the goblin caves and encountered ${enemyName}, ${dropText}`;
  } else {
    narrativeDescription = `${adventurerName} adventured into the goblin caves and encountered ${enemyName} who defeated them.`;
  }

  const summaryEmbed = new EmbedBuilder()
    .setColor(engine.winner === 'player' ? '#57F287' : '#ED4245')
    .setDescription(narrativeDescription);

  await interaction.followUp({ embeds: [summaryEmbed] });

  if (lootDrop) {
    try {
      await sendCardDM(interaction.user, lootDrop);
    } catch (err) {
      console.error('Failed to DM card drop:', err);
    }
  }
}

module.exports = { data, execute };
