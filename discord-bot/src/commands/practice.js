const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const userService = require('../utils/userService');
const abilityCardService = require('../utils/abilityCardService');
const { buildBattleEmbed } = require('../utils/embedBuilder');

const MAX_LOG_LINES = 20;
const GameEngine = require('../../../backend/game/engine');
const { createCombatant } = require('../../../backend/game/utils');
const { allPossibleHeroes, allPossibleAbilities } = require('../../../backend/game/data');
const classes = require('../data/classes');
const classAbilityMap = require('../data/classAbilityMap');

const data = new SlashCommandBuilder()
  .setName('practice')
  .setDescription('Test your skills against a goblin with no risk.');

function formatLog(entry) {
  const prefix = `[R${entry.round}]`;
  let text = entry.message;
  if (entry.type === 'round') text = `**${text}**`;
  else if (entry.type === 'victory' || entry.type === 'defeat') text = `🏆 **${text}** 🏆`;
  else if (entry.type === 'ability-cast') text = `*${text}*`;
  return `${prefix} ${text}`;
}

async function execute(interaction) {
  const user = await userService.getUser(interaction.user.id);

  if (!user || !user.class) {
    await interaction.reply({ content: 'You must select a class before you can practice! Use the /game command to get started.', ephemeral: true });
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
    player.abilityData.isPractice = true;
    player.abilityCharges = equippedCard.charges;
  }
  if (player.abilityData) player.abilityData.isPractice = true;
  goblin.heroData = { ...goblin.heroData, name: `Goblin ${goblinClass}` };

  await interaction.reply({ content: `${interaction.user.username} begins a practice battle against a Goblin ${goblinClass}!` });

  const engine = new GameEngine([player, goblin]);
  const wait = ms => new Promise(r => setTimeout(r, ms));
  let battleMessage;
  let logText = '';
  const fullLog = [];
  for (const step of engine.runGameSteps()) {
    fullLog.push(...step.log);
    const lines = step.log.map(formatLog);
    logText = [logText, ...lines].filter(Boolean).join('\n');
    const parts = logText.split('\n');
    if (parts.length > MAX_LOG_LINES) logText = parts.slice(-MAX_LOG_LINES).join('\n');
    const embed = buildBattleEmbed(step.combatants, logText);
    if (!battleMessage) {
      battleMessage = await interaction.followUp({ embeds: [embed] });
    } else {
      await wait(1000);
      await battleMessage.edit({ embeds: [embed] });
    }
  }

  const summaryEmbed = new EmbedBuilder()
    .setColor(engine.winner === 'player' ? '#57F287' : '#ED4245')
    .setDescription('Practice Complete');

  await interaction.followUp({ embeds: [summaryEmbed] });

  const finalLogString = fullLog
    .map(entry => {
      let prefix = `[R${entry.round}]`;
      let message = entry.message;
      switch (entry.type) {
        case 'round':
          return `\n--- ${message} ---\n`;
        case 'ability-cast':
          message = `✨ ${message}`;
          break;
        case 'defeat':
        case 'victory':
          message = `🏆 ${message} 🏆`;
          break;
        case 'status':
          message = `💀 ${message}`;
          break;
      }
      return `${prefix} ${message}`.trim();
    })
    .join('\n');

  const logBuffer = Buffer.from(finalLogString, 'utf-8');

  try {
    if (typeof interaction.user.send === 'function') {
      await interaction.user.send({
        content: 'Here is the full transcript of your last battle:',
        files: [{ attachment: logBuffer, name: `battle-log-${Date.now()}.txt` }]
      });
    } else {
      throw new Error('DM function unavailable');
    }
  } catch (error) {
    console.error(`Could not send battle log DM to ${interaction.user.tag}.`, error);
    await interaction.followUp({
      content:
        "I couldn't DM you the full battle log. Please check your privacy settings if you'd like to receive them in the future.",
      ephemeral: true
    });
  }
}

module.exports = { data, execute };
