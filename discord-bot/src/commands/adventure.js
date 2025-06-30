const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const userService = require('../utils/userService');
const abilityCardService = require('../utils/abilityCardService');
const { sendCardDM, buildBattleEmbed } = require('../utils/embedBuilder');

const MAX_LOG_LINES = 20;
const GameEngine = require('../../../backend/game/engine');
const { createCombatant } = require('../../../backend/game/utils');
const { allPossibleHeroes, allPossibleAbilities } = require('../../../backend/game/data');
const classAbilityMap = require('../data/classAbilityMap');

function formatLog(entry) {
  const prefix = `[R${entry.round}]`;
  let text = entry.message;
  if (entry.type === 'round') text = `**${text}**`;
  else if (entry.type === 'victory' || entry.type === 'defeat') text = `🏆 **${text}** 🏆`;
  else if (entry.type === 'ability-cast') text = `*${text}*`;
  return `${prefix} ${text}`;
}

const data = new SlashCommandBuilder()
  .setName('adventure')
  .setDescription('Enter the goblin cave for a practice battle');

async function execute(interaction) {
  let user = await userService.getUser(interaction.user.id);
  if (!user) {
    await userService.createUser(interaction.user.id, interaction.user.username);
    user = await userService.getUser(interaction.user.id);
  }

  const playerClass = classAbilityMap[user.class] || user.class || 'Stalwart Defender';
  const playerHero = allPossibleHeroes.find(h => h.class === playerClass && h.isBase);
  if (!playerHero) {
    await interaction.reply({ content: 'Required hero data missing.', ephemeral: true });
    return;
  }

  // Pick a random base hero for the goblin opponent
  const baseHeroes = allPossibleHeroes.filter(h => h.isBase);
  const goblinBase = baseHeroes[Math.floor(Math.random() * baseHeroes.length)];

  if (!goblinBase) {
    await interaction.reply({ content: 'Required goblin data missing.', ephemeral: true });
    return;
  }

  const cards = await abilityCardService.getCards(user.id);
  const equippedCard = cards.find(c => c.id === user.equipped_ability_id);
  const deck = cards.filter(c => c.id !== user.equipped_ability_id);

  const goblinAbilityPool = allPossibleAbilities
    .filter(a => a.class === goblinBase.class && a.rarity === 'Common');
  const goblinAbilities = goblinAbilityPool.map(a => a.id);

  const player = createCombatant({
    hero_id: playerHero.id,
    ability_card: equippedCard,
    deck: deck
  }, 'player', 0);

  const goblin = createCombatant({ hero_id: goblinBase.id, deck: goblinAbilities }, 'enemy', 0);

  goblin.heroData = { ...goblin.heroData, name: `Goblin ${goblinBase.name}` };

  console.log(`[BATTLE START] Player ${playerClass} vs Goblin ${goblinBase.name}`);

  await interaction.reply({ content: `${interaction.user.username} delves into the goblin cave and encounters a ferocious Goblin ${goblinBase.name}! The battle begins!` });

  const engine = new GameEngine([player, goblin]);
  const wait = ms => new Promise(r => setTimeout(r, ms));
  let battleMessage;
  let logText = '';
  const fullLog = [];
  for (const step of engine.runGameSteps()) {
    fullLog.push(...step.log);
    const formatted = step.log.map(formatLog);
    logText = [logText, ...formatted].filter(Boolean).join('\n');
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
  const enemyName = `a **Goblin ${goblinBase.name}**`;

  if (engine.winner === 'player') {
    let dropText = 'who was slain.';
    if (Math.random() < 0.5) {
      const lootOptions = allPossibleAbilities.filter(
        a => a.class === goblinBase.class && a.rarity === 'Common'
      );
      lootDrop = lootOptions[Math.floor(Math.random() * lootOptions.length)];
      if (lootDrop) {
        dropText = `who was slain and dropped **${lootDrop.name}**.`;
        console.log(
          `[ITEM LOOT] User: ${interaction.user.username} looted Ability: ${lootDrop.name} (ID: ${lootDrop.id})`
        );
        await userService.addAbility(interaction.user.id, lootDrop.id);
      }
    }
    narrativeDescription = `${adventurerName} adventured into the goblin caves and encountered ${enemyName}, ${dropText}`;
  } else {
    narrativeDescription = `${adventurerName} adventured into the goblin caves and encountered ${enemyName} who defeated them.`;
  }

  const summaryEmbed = new EmbedBuilder()
    .setColor(engine.winner === 'player' ? '#57F287' : '#ED4245')
    .setDescription(narrativeDescription);

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

  if (lootDrop) {
    try {
      await sendCardDM(interaction.user, lootDrop);
    } catch (err) {
      console.error('Failed to DM card drop:', err);
    }
  }
}

module.exports = { data, execute };
