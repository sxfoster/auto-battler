const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const userService = require('../src/utils/userService');
const { buildBattleEmbed } = require('../src/utils/embedBuilder');
const GameEngine = require('../../backend/game/engine');
const { createCombatant } = require('../../backend/game/utils');
const { allPossibleHeroes, allPossibleAbilities } = require('../../backend/game/data');

function formatLog(entry) {
  const prefix = `[R${entry.round}]`;
  let text = entry.message;
  if (entry.type === 'round') text = `**${text}**`;
  else if (entry.type === 'victory' || entry.type === 'defeat') text = `🏆 **${text}** 🏆`;
  else if (entry.type === 'ability-cast') text = `*${text}*`;
  return `${prefix} ${text}`;
}

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

  await interaction.reply({ content: "I've started your tutorial in your DMs!", ephemeral: true });

  try {
    const baseHero = allPossibleHeroes.find(h => h.isBase) || allPossibleHeroes[0];
    const player = createCombatant({ hero_id: baseHero.id }, 'player', 0);

    const goblin = {
      id: 'enemy-0',
      heroData: { name: 'Tutorial Goblin', hp: 10, attack: 1, speed: 1, defense: 0 },
      weaponData: null,
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
      attack: 1,
      speed: 1,
      defense: 0
    };

    await interaction.user.send('A Tutorial Goblin appears! Prepare for battle!');

    const engine = new GameEngine([player, goblin]);
    const wait = ms => new Promise(r => setTimeout(r, ms));
    let logText = '';
    let battleMessage;
    for (const step of engine.runGameSteps()) {
      const lines = step.log.map(formatLog);
      logText = [logText, ...lines].filter(Boolean).join('\n');
      const embed = buildBattleEmbed(step.combatants, logText);
      if (!battleMessage) {
        battleMessage = await interaction.user.send({ embeds: [embed] });
      } else {
        await wait(1000);
        await battleMessage.edit({ embeds: [embed] });
      }
    }

    const commonAbilities = allPossibleAbilities.filter(a => a.rarity === 'Common');
    const drop = commonAbilities[Math.floor(Math.random() * commonAbilities.length)];
    await userService.addAbility(interaction.user.id, drop.id);

    const summaryEmbed = new EmbedBuilder()
      .setColor('#57F287')
      .setDescription(`Victory! The Tutorial Goblin dropped **${drop.name}**.`);
    await interaction.user.send({ embeds: [summaryEmbed] });

    interaction.followUp({
      content:
        "Congratulations on your victory! You've found your first Ability Card. Use the /inventory show command to see what's in your backpack.",
      ephemeral: true
    });

    setTimeout(() => {
      interaction.followUp({
        content: `Now, equip your new ability using the command: /inventory set ability:${drop.name}`,
        ephemeral: true
      });
    }, 5000);

    setTimeout(async () => {
      await interaction.followUp({
        content:
          'You can now use /adventure to battle monsters, /challenge @user to duel other players, and /who @user to inspect a character.',
        ephemeral: true
      });
      await userService.markTutorialComplete(interaction.user.id);
    }, 10000);
  } catch (error) {
    console.error(`Failed to send tutorial DM to ${interaction.user.tag}.`, error);
    await interaction.followUp({
      content: "I couldn't send you a DM. Please check your Server Privacy Settings.",
      ephemeral: true
    });
  }
}

module.exports = { data, execute };
