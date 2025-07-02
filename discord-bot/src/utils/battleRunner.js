const { buildBattleEmbed } = require('./embedBuilder');
const userService = require('./userService');
const feedback = require('./feedback');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const MAX_LOG_LINES = 20;

function formatLog(entry) {
  const prefix = `[R${entry.round}]`;
  let text = entry.message;
  switch (entry.type) {
    case 'round':
      return `\n**--- ${text} ---**\n`;
    case 'ability-cast':
      return `\`\`\`diff\n+ ${prefix} ${text}\n\`\`\``;
    case 'victory':
    case 'defeat':
      return `🏆 **${text}** 🏆`;
    case 'status':
      return `\`\`\`css\n. ${prefix} ${text}\n\`\`\``;
    default:
      return `${prefix} ${text}`;
  }
}

function buildFinalLog(logEntries) {
  return logEntries
    .map(entry => {
      let prefix = `[R${entry.round}]`;
      let message = entry.message;
      switch (entry.type) {
        case 'round':
          return `\n--- ${message} ---\n`;
        case 'ability-cast':
          message = `✨ ${message}`;
          break;
        case 'damage_calculation': {
          const { baseDamage, bonusDamage, defenseMitigation, finalDamage } = entry.details;
          const attacker = entry.attacker;
          const target = entry.target;
          return `${prefix} ${attacker} attacks ${target}! (Base: ${baseDamage}, Buffs: +${bonusDamage}) ➞ (Defense: ${defenseMitigation}) ➞ Final Damage: ${finalDamage}`;
        }
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
}

async function runBattleLoop(interaction, engine, { waitMs = 1000, isTutorial = false } = {}) {
  let battleMessage;
  const fullLog = [];
  const user = await userService.getUser(interaction.user.id);
  const verbosity = user?.log_verbosity || 'summary';
  let lastEmbed = null;
  for (const step of engine.runGameSteps()) {
    if (step.type === 'PAUSE') {
      if (battleMessage && lastEmbed) {
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('tutorial_continue')
            .setLabel('Continue Battle')
            .setStyle(ButtonStyle.Primary)
        );
        await battleMessage.edit({ embeds: [lastEmbed], components: [row] });
        try {
          const btn = await battleMessage.awaitMessageComponent({
            filter: i =>
              i.customId === 'tutorial_continue' &&
              i.user.id === interaction.user.id,
            time: 60000
          });
          await btn.update({ components: [] });
        } catch (e) {
          await battleMessage.edit({ components: [] });
        }
      }
      continue;
    }

    fullLog.push(...step.log);
    let displayLog;
    if (verbosity === 'detailed') {
      displayLog = fullLog;
    } else if (verbosity === 'combat_only') {
      displayLog = fullLog.filter(entry =>
        ['damage', 'heal', 'victory', 'defeat'].includes(entry.type)
      );
    } else {
      displayLog = fullLog.filter(entry => entry.level === 'summary');
    }
    const lines = displayLog.map(formatLog);
    const logText = lines.slice(-MAX_LOG_LINES).join('\n');
    lastEmbed = buildBattleEmbed(step.combatants, logText);

    if (isTutorial) {
      const player = step.combatants.find(c => c.team === 'player');
      if (
        player &&
        player.currentEnergy === 1 &&
        !engine.tutorialFlags.energyExplained
      ) {
        engine.tutorialFlags.energyExplained = true;
        if (battleMessage) {
          await battleMessage.edit({ embeds: [lastEmbed] });
        }
        await feedback.sendInfo(
          interaction,
          "Edgar's Tip",
          "See that? You've gathered 1 Energy. Save it up to unleash your special ability!"
        );
      }

      if (
        player &&
        player.abilityData &&
        player.currentEnergy >= player.abilityData.energyCost &&
        !engine.tutorialFlags.abilityReady
      ) {
        engine.tutorialFlags.abilityReady = true;
        if (battleMessage) {
          await battleMessage.edit({ embeds: [lastEmbed] });
        }
        await feedback.sendInfo(
          interaction,
          "Edgar's Tip",
          'Now! You have enough Energy! Unleash your power!'
        );
      }
    }

    if (!battleMessage) {
      battleMessage = await interaction.followUp({ embeds: [lastEmbed] });
    } else {
      await new Promise(r => setTimeout(r, waitMs));
      await battleMessage.edit({ embeds: [lastEmbed] });
    }
  }
  return { fullLog };
}

async function sendBattleLogDM(interaction, user, logEntries) {
  const finalLogString = buildFinalLog(logEntries);
  const logBuffer = Buffer.from(finalLogString, 'utf-8');
  if (user.dm_battle_logs_enabled) {
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
  } else {
    console.log(
      `[DM DISABLED] Skipping battle log DM for ${interaction.user.username} (dm_battle_logs_enabled = false)`
    );
  }
}

module.exports = { formatLog, buildFinalLog, runBattleLoop, sendBattleLogDM };
