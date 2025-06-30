const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const userService = require('../utils/userService');
const abilityCardService = require('../utils/abilityCardService');
const db = require('../../util/database');
const {
  allPossibleHeroes,
  allPossibleAbilities
} = require('../../../backend/game/data');
const { createCombatant } = require('../../../backend/game/utils');
const GameEngine = require('../../../backend/game/engine');

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
  const challengerUser = await userService.getUser(interaction.user.id);
  const targetUser = await userService.getUser(target.id);
  if (!challengerUser || !challengerUser.class || !targetUser || !targetUser.class) {
    await interaction.reply({ content: 'Both players must have a character and class selected.', ephemeral: true });
    return;
  }

  const [result] = await db.query(
    'INSERT INTO pvp_battles (challenger_id, challenged_id, status) VALUES (?, ?, ?)',
    [challengerUser.id, targetUser.id, 'pending']
  );
  const challengeId = result.insertId;

  const announcementChannel = await interaction.client.channels.fetch(process.env.ANNOUNCEMENT_CHANNEL_ID);
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

  try {
    const channel = await interaction.client.channels.fetch(battle.channel_id);
    const msg = await channel.messages.fetch(battle.message_id);
    await msg.edit({ content: `${interaction.user.username} has accepted the challenge!` });
  } catch (e) {
    /* ignore */
  }

  const [challengerRows] = await db.query('SELECT * FROM users WHERE id = ?', [battle.challenger_id]);
  const [targetRows] = await db.query('SELECT * FROM users WHERE id = ?', [battle.challenged_id]);
  const challenger = challengerRows[0];
  const opponent = targetRows[0];

  const challengerCards = await abilityCardService.getCards(challenger.id);
  const chalEquipped = challengerCards.find(c => c.id === challenger.equipped_ability_id);
  const chalDeck = challengerCards.filter(c => c.id !== challenger.equipped_ability_id);

  const opponentCards = await abilityCardService.getCards(opponent.id);
  const oppEquipped = opponentCards.find(c => c.id === opponent.equipped_ability_id);
  const oppDeck = opponentCards.filter(c => c.id !== opponent.equipped_ability_id);

  const chalHero = allPossibleHeroes.find(h => (h.class === challenger.class || h.name === challenger.class) && h.isBase);
  const oppHero = allPossibleHeroes.find(h => (h.class === opponent.class || h.name === opponent.class) && h.isBase);

  const chalCombatant = createCombatant({ hero_id: chalHero.id, ability_card: chalEquipped, deck: chalDeck }, 'player', 0);
  const oppCombatant = createCombatant({ hero_id: oppHero.id, ability_card: oppEquipped, deck: oppDeck }, 'enemy', 0);

  if (chalCombatant.abilityData) chalCombatant.abilityData.isPractice = true;
  if (oppCombatant.abilityData) oppCombatant.abilityData.isPractice = true;
  chalCombatant.deck.forEach(a => (a.isPractice = true));
  oppCombatant.deck.forEach(a => (a.isPractice = true));

  const engine = new GameEngine([chalCombatant, oppCombatant]);
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

  await db.query('UPDATE pvp_battles SET battle_log = ?, winner_id = ? WHERE id = ?', [finalLogString, engine.winner === 'player' ? challenger.id : opponent.id, id]);

  const logBuffer = Buffer.from(finalLogString, 'utf-8');
  try {
    await interaction.user.send({ files: [{ attachment: logBuffer, name: `battle-${id}.txt` }] });
  } catch (e) {
    /* ignore */
  }
  try {
    const targetUser = await interaction.client.users.fetch(opponent.discord_id);
    await targetUser.send({ files: [{ attachment: logBuffer, name: `battle-${id}.txt` }] });
  } catch (e) {
    /* ignore */
  }

  try {
    const channel = await interaction.client.channels.fetch(battle.channel_id);
    await channel.send({
      content: `⚔️ Victory! ${engine.winner === 'player' ? challenger.name : opponent.name} has defeated ${engine.winner === 'player' ? opponent.name : challenger.name} in a duel!`
    });
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
