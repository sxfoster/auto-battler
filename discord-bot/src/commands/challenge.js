const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const userService = require('../utils/userService');
const abilityCardService = require('../utils/abilityCardService');
const db = require('../../util/database');
const { allPossibleHeroes } = require('../../../backend/game/data');
const { createCombatant } = require('../../../backend/game/utils');
const GameEngine = require('../../../backend/game/engine');

const data = new SlashCommandBuilder()
  .setName('challenge')
  .setDescription('Challenge another player to a duel.')
  .addUserOption(opt => opt.setName('target').setDescription('User to challenge').setRequired(true));

async function execute(interaction) {
  if (!process.env.PVP_CHANNEL_ID) {
    console.error('PVP_CHANNEL_ID is not set in the .env file.');
    return interaction.reply({
      content: 'Error: The challenge channel is not configured. Please contact an admin.',
      ephemeral: true
    });
  }
  const target = interaction.options.getUser('target');
  if (target.id === interaction.user.id) {
    await interaction.reply({ content: 'You cannot challenge yourself.', ephemeral: true });
    return;
  }
  if (target.bot) {
    await interaction.reply({ content: 'You cannot challenge bots.', ephemeral: true });
    return;
  }
  const challengerUser = await userService.getUser(interaction.user.id);
  const targetUser = await userService.getUser(target.id);
  if (!challengerUser || !challengerUser.class || !targetUser || !targetUser.class) {
    await interaction.reply({ content: 'Both players must have a character and class selected.', ephemeral: true });
    return;
  }

  console.log(
    `[CHALLENGE] ${challengerUser.name} (${challengerUser.discord_id}) is challenging ${targetUser.name} (${targetUser.discord_id}).`
  );

  const [result] = await db.query(
    'INSERT INTO pvp_battles (challenger_id, challenged_id, status) VALUES (?, ?, ?)',
    [challengerUser.id, targetUser.id, 'pending']
  );
  const challengeId = result.insertId;

  const announcementChannel = await interaction.client.channels.fetch(process.env.PVP_CHANNEL_ID);
  const publicMessage = await announcementChannel.send({
    content: `${interaction.user.username} has challenged ${target.username}!`
  });

  await db.query('UPDATE pvp_battles SET message_id = ?, channel_id = ? WHERE id = ?', [publicMessage.id, announcementChannel.id, challengeId]);

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

  // automatically expire the challenge after 5 minutes
  setTimeout(() => expireChallenge(challengeId, interaction.user, interaction.client), 5 * 60 * 1000);
}

async function handleAccept(interaction) {
  const [, idStr] = interaction.customId.split(':');
  const id = Number(idStr);
  const [rows] = await db.query('SELECT * FROM pvp_battles WHERE id = ?', [id]);
  const battle = rows[0];
  if (!battle || battle.status !== 'pending' || Date.now() - new Date(battle.created_at).getTime() > 5 * 60 * 1000) {
    if (battle && battle.status === 'pending') {
      await db.query('UPDATE pvp_battles SET status = ? WHERE id = ?', ['expired', id]);
      try {
        const channel = await interaction.client.channels.fetch(battle.channel_id);
        const msg = await channel.messages.fetch(battle.message_id);
        await msg.edit({ content: 'Challenge Expired.' });
      } catch (e) {
        /* ignore */
      }
    }
    await interaction.update({ content: 'This challenge has expired.', components: [] });
    return;
  }

  await db.query('UPDATE pvp_battles SET status = ? WHERE id = ?', ['accepted', id]);

  console.log(`[CHALLENGE] Challenge ${id} accepted. Starting battle simulation.`);

  try {
    const channel = await interaction.client.channels.fetch(battle.channel_id);
    const msg = await channel.messages.fetch(battle.message_id);
    await msg.edit({ content: `${interaction.user.username} has accepted the challenge!` });
  } catch (e) {
    /* ignore */
  }

  const [challengerRows] = await db.query('SELECT * FROM users WHERE id = ?', [battle.challenger_id]);
  const [challengedRows] = await db.query('SELECT * FROM users WHERE id = ?', [battle.challenged_id]);
  const challenger = challengerRows[0];
  const challenged = challengedRows[0];

  const challengerCards = await abilityCardService.getCards(challenger.id);
  const chalEquipped = challengerCards.find(c => c.id === challenger.equipped_ability_id);
  const chalDeck = challengerCards.filter(c => c.id !== challenger.equipped_ability_id);

  const challengedCards = await abilityCardService.getCards(challenged.id);
  const challengedEquipped = challengedCards.find(c => c.id === challenged.equipped_ability_id);
  const challengedDeck = challengedCards.filter(c => c.id !== challenged.equipped_ability_id);

  const chalHero = allPossibleHeroes.find(h => (h.class === challenger.class || h.name === challenger.class) && h.isBase);
  const oppHero = allPossibleHeroes.find(h => (h.class === challenged.class || h.name === challenged.class) && h.isBase);

  const player1 = createCombatant({ hero_id: chalHero.id, ability_card: chalEquipped, deck: chalDeck }, 'player', 0);
  const player2 = createCombatant({ hero_id: oppHero.id, ability_card: challengedEquipped, deck: challengedDeck }, 'enemy', 0);

  if (player1.abilityData) player1.abilityData.isPractice = true;
  if (player2.abilityData) player2.abilityData.isPractice = true;
  player1.deck.forEach(a => (a.isPractice = true));
  player2.deck.forEach(a => (a.isPractice = true));

  const engine = new GameEngine([player1, player2]);
  engine.runFullGame();

  const finalLogString = engine.battleLog
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

  await db.query('UPDATE pvp_battles SET battle_log = ?, winner_id = ? WHERE id = ?', [finalLogString, engine.winner === 'player' ? challenger.id : challenged.id, id]);

  const logBuffer = Buffer.from(finalLogString, 'utf-8');
  const attachment = { attachment: logBuffer, name: `battle-log-${id}.txt` };

  try {
    const challengerDiscordUser = await interaction.client.users.fetch(challenger.discord_id);
    await challengerDiscordUser.send({ files: [attachment] });
  } catch (e) {
    console.error(`Failed to DM log to challenger ${challenger.name}`);
  }
  try {
    const challengedDiscordUser = await interaction.client.users.fetch(challenged.discord_id);
    await challengedDiscordUser.send({ files: [attachment] });
  } catch (e) {
    console.error(`Failed to DM log to challenged user ${challenged.name}`);
  }

  const winnerUser = engine.winner === 'player' ? challenger : challenged;
  const loserUser = engine.winner === 'player' ? challenged : challenger;
  const victoryMessage = `⚔️ **Victory!** ${winnerUser.name} has defeated ${loserUser.name} in a duel!`;

  try {
    const channel = await interaction.client.channels.fetch(battle.channel_id);
    await channel.send(victoryMessage);
  } catch (e) {
    /* ignore */
  }

  await interaction.update({ content: 'Challenge accepted! Battle complete.', components: [] });
}

async function handleDecline(interaction) {
  const [, idStr] = interaction.customId.split(':');
  const id = Number(idStr);
  await db.query('UPDATE pvp_battles SET status = ? WHERE id = ?', ['declined', id]);

  const [rows] = await db.query('SELECT * FROM pvp_battles WHERE id = ?', [id]);
  const battle = rows[0];
  try {
    const channel = await interaction.client.channels.fetch(battle.channel_id);
    const msg = await channel.messages.fetch(battle.message_id);
    await msg.edit({ content: 'Challenge Declined.' });
  } catch (e) {
    /* ignore */
  }

  await interaction.update({ content: 'Challenge declined.', components: [] });
}

async function expireChallenge(id, challenger, client) {
  await db.query('UPDATE pvp_battles SET status = ? WHERE id = ?', ['expired', id]);
  const [rows] = await db.query('SELECT * FROM pvp_battles WHERE id = ?', [id]);
  const battle = rows[0];
  try {
    const channel = await client.channels.fetch(battle.channel_id);
    const msg = await channel.messages.fetch(battle.message_id);
    await msg.edit({ content: 'Challenge Expired.' });
  } catch (e) {
    /* ignore */
  }
  try {
    await challenger.send(`Your challenge #${id} has expired.`);
  } catch (e) {
    /* ignore */
  }
}

module.exports = { data, execute, handleAccept, handleDecline, expireChallenge };
