const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../util/database');
const userService = require('../src/utils/userService');
const { simple } = require('../src/utils/embedBuilder');

const timeouts = new Map();
const challenges = new Map();

const data = new SlashCommandBuilder()
  .setName('challenge')
  .setDescription('Challenge another player to a duel')
  .addUserOption(opt =>
    opt
      .setName('opponent')
      .setDescription('Player to challenge')
      .setRequired(true)
  );

async function execute(interaction) {
  const opponent = interaction.options.getUser('opponent');
  const challenger = interaction.user;

  if (opponent.bot || opponent.id === challenger.id) {
    await interaction.reply({ content: 'Invalid opponent.', ephemeral: true });
    return;
  }

  const challengerData = await userService.getUser(challenger.id);
  const opponentData = await userService.getUser(opponent.id);

  if (!challengerData || !challengerData.class || !opponentData || !opponentData.class) {
    await interaction.reply({ content: 'Both players must choose a class first.', ephemeral: true });
    return;
  }

  const [result] = await db.query(
    'INSERT INTO pvp_battles (challenger_id, challenged_id, status) VALUES (?, ?, ?)',
    [challengerData.id, opponentData.id, 'pending']
  );
  const battleId = result.insertId;

  challenges.set(battleId, { challenger, opponent });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`challenge-accept:${battleId}`).setLabel('Accept').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId(`challenge-decline:${battleId}`).setLabel('Decline').setStyle(ButtonStyle.Danger)
  );

  const embed = simple('You have been challenged!', [
    { name: 'Challenger', value: challenger.username }
  ], challenger.displayAvatarURL());

  try {
    await opponent.send({ embeds: [embed], components: [row] });
  } catch (err) {
    console.error('Failed to DM opponent:', err);
  }

  await interaction.reply({ content: `Challenge sent to ${opponent.username}.`, ephemeral: true });

  const timeout = setTimeout(async () => {
    timeouts.delete(battleId);
    challenges.delete(battleId);
    await db.query('UPDATE pvp_battles SET status = ? WHERE id = ?', ['expired', battleId]);
    try {
      await challenger.send(`Your challenge to ${opponent.username} has expired.`);
    } catch (err) {
      console.error('Failed to DM challenger:', err);
    }
  }, 5 * 60 * 1000);

  timeouts.set(battleId, timeout);
}

async function handleChallengeAccept(interaction) {
  const id = parseInt(interaction.customId.split(':')[1], 10);
  const info = challenges.get(id);
  if (!info) {
    await interaction.update({ content: 'This challenge is no longer active.', components: [] });
    return;
  }
  clearTimeout(timeouts.get(id));
  timeouts.delete(id);
  challenges.delete(id);
  await db.query('UPDATE pvp_battles SET status = ? WHERE id = ?', ['accepted', id]);
  await interaction.update({ content: 'Challenge accepted!', components: [] });
  try {
    await info.challenger.send(`${info.opponent.username} accepted your challenge!`);
  } catch (err) {
    console.error('Failed to DM challenger:', err);
  }
}

async function handleChallengeDecline(interaction) {
  const id = parseInt(interaction.customId.split(':')[1], 10);
  const info = challenges.get(id);
  if (!info) {
    await interaction.update({ content: 'This challenge is no longer active.', components: [] });
    return;
  }
  clearTimeout(timeouts.get(id));
  timeouts.delete(id);
  challenges.delete(id);
  await db.query('UPDATE pvp_battles SET status = ? WHERE id = ?', ['declined', id]);
  await interaction.update({ content: 'Challenge declined.', components: [] });
  try {
    await info.challenger.send(`${info.opponent.username} declined your challenge.`);
  } catch (err) {
    console.error('Failed to DM challenger:', err);
  }
}

module.exports = { data, execute, handleChallengeAccept, handleChallengeDecline };
