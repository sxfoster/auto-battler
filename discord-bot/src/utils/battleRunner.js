const { buildBattleEmbed } = require('./embedBuilder');
const userService = require('./userService');

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

async function runBattleLoop(interaction, engine, { waitMs = 1000 } = {}) {
  let battleMessage;
  const fullLog = [];
  const user = await userService.getUser(interaction.user.id);
  const verbosity = user?.log_verbosity || 'summary';
  for (const step of engine.runGameSteps()) {
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
    const embed = buildBattleEmbed(step.combatants, logText);
    if (!battleMessage) {
      battleMessage = await interaction.followUp({ embeds: [embed] });
    } else {
      await new Promise(r => setTimeout(r, waitMs));
      await battleMessage.edit({ embeds: [embed] });
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
