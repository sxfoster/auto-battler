const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const userService = require('../utils/userService');
const db = require('../../util/database');

const data = new SlashCommandBuilder()
  .setName('challenge')
  .setDescription('Challenge another player to a duel.')
  .addUserOption(opt => opt.setName('target').setDescription('User to challenge').setRequired(true));

async function execute(interaction) {
  const target = interaction.options.getUser('target');
  if (target.id === interaction.user.id) {
    await interaction.reply({ content: 'You cannot challenge yourself.', ephemeral: true });
    return;
  }
  if (target.bot) {
    await interaction.reply({ content: 'You cannot challenge bots.', ephemeral: true });
    return;
  }
  const targetUser = await userService.getUser(target.id);
  if (!targetUser) {
    await interaction.reply({ content: 'That player has not started playing yet.', ephemeral: true });
    return;
  }
  const [result] = await db.query(
    'INSERT INTO challenges (challenger_id, target_id, status) VALUES (?, ?, ?)',
    [interaction.user.id, target.id, 'pending']
  );
  const challengeId = result.insertId;

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`challenge-accept:${challengeId}`)
      .setLabel('Accept')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`challenge-decline:${challengeId}`)
      .setLabel('Decline')
      .setStyle(ButtonStyle.Danger)
  );

  await target.send({ content: `${interaction.user.username} has challenged you!`, components: [row] });
  await interaction.reply({ content: `Challenge sent to ${target.username}.`, ephemeral: true });
}

async function handleAccept(interaction) {
  const [, idStr] = interaction.customId.split(':');
  const id = Number(idStr);
  await db.query('UPDATE challenges SET status = ? WHERE id = ?', ['accepted', id]);
  await interaction.update({ content: 'Challenge accepted!', components: [] });
}

async function handleDecline(interaction) {
  const [, idStr] = interaction.customId.split(':');
  const id = Number(idStr);
  await db.query('UPDATE challenges SET status = ? WHERE id = ?', ['declined', id]);
  await interaction.update({ content: 'Challenge declined.', components: [] });
}

async function expireChallenge(id, challenger) {
  await db.query('UPDATE challenges SET status = ? WHERE id = ?', ['expired', id]);
  await challenger.send(`Your challenge #${id} has expired.`);
}

module.exports = { data, execute, handleAccept, handleDecline, expireChallenge };
