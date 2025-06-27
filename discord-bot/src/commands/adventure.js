const { SlashCommandBuilder } = require('discord.js');
const userService = require('../utils/userService');
const { sendCardDM, buildCardEmbed, buildBattleEmbed, simple } = require('../utils/embedBuilder');
const GameEngine = require('../../../backend/game/engine');
const { createCombatant } = require('../../../backend/game/utils');
const { allPossibleHeroes, allPossibleAbilities } = require('../../../backend/game/data');
const classes = require('../data/classes');
const classAbilityMap = require('../data/classAbilityMap');
const goblinLootMap = require('../data/goblinLootMap');

// Maximum number of log lines to keep when updating the battle embed
const MAX_LOG_LINES = 15;

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

  const playerAbilities = allPossibleAbilities
    .filter(a => a.class === (classAbilityMap[user.class] || user.class) && a.rarity === 'Common')
    .map(a => a.id);

  const goblinAbilityPool = allPossibleAbilities
    .filter(a => a.class === (classAbilityMap[goblinClass] || goblinClass) && a.rarity === 'Common');
  const goblinAbilities = goblinAbilityPool.map(a => a.id);

  const player = createCombatant({ hero_id: playerHero.id, deck: playerAbilities }, 'player', 0);
  const goblin = createCombatant({ hero_id: goblinBase.id, deck: goblinAbilities }, 'enemy', 0);
  goblin.heroData = { ...goblin.heroData, name: `Goblin ${goblinClass}` };

  await interaction.reply({ content: `${interaction.user.username} delves into the goblin cave and encounters a ferocious Goblin ${goblinClass}! The battle begins!` });

  const engine = new GameEngine([player, goblin]);
  const wait = ms => new Promise(r => setTimeout(r, ms));
  let battleMessage;
  let logText = '';
  for (const step of engine.runGameSteps()) {
    logText = [...step.log, logText].filter(Boolean).join('\n');
    // Trim log output when the embed has already been sent to avoid exceeding
    // Discord's description limit. New log entries appear at the top so we keep
    // the first MAX_LOG_LINES lines.
    const displayLog = battleMessage
      ? logText.split('\n').slice(0, MAX_LOG_LINES).join('\n')
      : logText;
    const embed = buildBattleEmbed(step.combatants, displayLog);
    if (!battleMessage) {
      battleMessage = await interaction.followUp({ embeds: [embed] });
    } else {
      await wait(1500);
      await battleMessage.edit({ embeds: [embed] });
    }
  }

  const outcome = engine.winner === 'player' ? 'Victory!' : 'Defeat!';
  await interaction.followUp({ embeds: [simple(outcome)] });

  if (engine.winner === 'player') {
    const abilityId = goblinLootMap[goblinClass];
    const drop = allPossibleAbilities.find(a => a.id === abilityId);
    if (drop) {
      await userService.addAbility(interaction.user.id, drop.id);
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
