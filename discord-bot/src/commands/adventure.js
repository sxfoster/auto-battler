const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const userService = require('../utils/userService');
const abilityCardService = require('../utils/abilityCardService');
const { sendCardDM, buildBattleEmbed } = require('../utils/embedBuilder');

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

  // Pick a random class for the goblin opponent
  const classNames = classes.map(c => c.name);
  const goblinClass = classNames[Math.floor(Math.random() * classNames.length)];
  const goblinBase = allPossibleHeroes.find(h => (h.class === goblinClass || h.name === goblinClass) && h.isBase);

  if (!goblinBase) {
    await interaction.reply({ content: 'Required goblin data missing.', ephemeral: true });
    return;
  }

  const cards = await abilityCardService.getCards(interaction.user.id);
  const equippedCard = cards.find(c => c.id === user.equipped_ability_id);
  const playerAbilityId = equippedCard ? equippedCard.ability_id : undefined;
  const playerAbilities = cards
    .filter(c => c.id !== user.equipped_ability_id)
    .map(c => c.ability_id);

  const goblinAbilityPool = allPossibleAbilities
    .filter(
      a => a.class === (classAbilityMap[goblinClass] || goblinClass) && a.rarity === 'Common'
    );
  const goblinAbilities = goblinAbilityPool.map(a => a.id);

  const player = createCombatant({ hero_id: playerHero.id, ability_id: playerAbilityId, deck: playerAbilities }, 'player', 0);
  const goblin = createCombatant({ hero_id: goblinBase.id, deck: goblinAbilities }, 'enemy', 0);
  if (equippedCard && player.abilityData) {
    player.abilityData = { ...player.abilityData, cardId: equippedCard.id, charges: equippedCard.charges };
    player.abilityCharges = equippedCard.charges;
  }
  goblin.heroData = { ...goblin.heroData, name: `Goblin ${goblinClass}` };

  console.log(`[BATTLE START] Player ${user.class} vs Goblin ${goblinClass}`);

  await interaction.reply({ content: `${interaction.user.username} delves into the goblin cave and encounters a ferocious Goblin ${goblinClass}! The battle begins!` });

  const engine = new GameEngine([player, goblin]);
  const wait = ms => new Promise(r => setTimeout(r, ms));
  let battleMessage;
  let logText = '';
  for (const step of engine.runGameSteps()) {
    logText = [logText, ...step.log].filter(Boolean).join('\n');
    const lines = logText.split('\n');
    if (lines.length > MAX_LOG_LINES) {
      logText = lines.slice(-MAX_LOG_LINES).join('\n');
    }
    const embed = buildBattleEmbed(step.combatants, logText);
    if (!battleMessage) {
      battleMessage = await interaction.followUp({ embeds: [embed] });
    } else {
      await wait(1000);
      await battleMessage.edit({ embeds: [embed] });
    }
  }

  console.log(
    `[BATTLE END] User: ${interaction.user.username} | Result: ${
      engine.winner === 'player' ? 'Victory' : 'Defeat'
    }`
  );

  let narrativeDescription = '';
  let lootDrop = null;
  const adventurerName = `**${interaction.user.username}**`;
  const enemyName = `a **Goblin ${goblinClass}**`;

  if (engine.winner === 'player') {
    lootDrop =
      goblinAbilityPool[Math.floor(Math.random() * goblinAbilityPool.length)];
    let dropText = 'who was slain.';
    if (lootDrop) {
      dropText = `who was slain and dropped **${lootDrop.name}**.`;
      console.log(
        `[ITEM LOOT] User: ${interaction.user.username} looted Ability: ${lootDrop.name} (ID: ${lootDrop.id})`
      );
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
