const { SlashCommandBuilder } = require('discord.js');
const userService = require('../utils/userService');
const abilityCardService = require('../utils/abilityCardService');
const { sendCardDM, buildCardEmbed, buildBattleEmbed, simple } = require('../utils/embedBuilder');

const MAX_LOG_LINES = 20;
const GameEngine = require('../../../backend/game/engine');
const { createCombatant } = require('../../../backend/game/utils');
const { allPossibleHeroes, allPossibleAbilities } = require('../../../backend/game/data');
const classes = require('../data/classes');
const classAbilityMap = require('../data/classAbilityMap');
const goblinLootMap = require('../data/goblinLootMap');

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
    .filter(a => a.class === (classAbilityMap[goblinClass] || goblinClass) && a.rarity === 'Common');
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
      await wait(1500);
      await battleMessage.edit({ embeds: [embed] });
    }
  }

  const outcome = engine.winner === 'player' ? 'Victory!' : 'Defeat!';
  await interaction.followUp({ embeds: [simple(outcome)] });
  console.log(`[BATTLE END] ${engine.winner}`);

  if (engine.winner === 'player') {
    const abilityId = goblinLootMap[goblinClass];
    const drop = allPossibleAbilities.find(a => a.id === abilityId);
    if (drop) {
      await userService.addAbility(interaction.user.id, drop.id);
      console.log(`[ITEM LOOT] ${drop.name} (${drop.id})`);
      if (interaction.user.send) {
        try {
          await sendCardDM(interaction.user, drop);
        } catch (err) {
          console.error('Failed to DM card drop:', err);
          await interaction.followUp({ embeds: [buildCardEmbed(drop)], ephemeral: true });
        }
      } else {
        await interaction.followUp({ embeds: [buildCardEmbed(drop)], ephemeral: true });
      }
    }
  }
}

module.exports = { data, execute };
