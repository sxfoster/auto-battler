const { SlashCommandBuilder } = require('discord.js');
const db = require('../util/database');
const { simple } = require('../src/utils/embedBuilder');
const { isGM } = require('../util/auth');
const { logGMAcion } = require('../src/utils/auditService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('gm')
    .setDescription('Game master tools')
    .addSubcommand(sub => {
      return sub
        .setName('reset')
        .setDescription('Reset a player')
        .addUserOption(opt =>
          opt.setName('player').setDescription('Target player').setRequired(true)
        );
    })
    .addSubcommandGroup(group => {
      return group
        .setName('codex')
        .setDescription('Codex commands')
        .addSubcommand(sub => {
          return sub
            .setName('unlock')
            .setDescription('Unlock a codex entry')
            .addUserOption(opt =>
              opt.setName('player').setDescription('Target player').setRequired(true)
            )
            .addStringOption(opt =>
              opt.setName('entry').setDescription('Entry key').setRequired(true)
            );
        });
    })
    .addSubcommandGroup(group => {
      return group
        .setName('flag')
        .setDescription('Flag commands')
        .addSubcommand(sub => {
          return sub
            .setName('set')
            .setDescription('Apply a status flag')
            .addUserOption(opt =>
              opt.setName('player').setDescription('Target player').setRequired(true)
            )
            .addStringOption(opt =>
              opt.setName('flag_id').setDescription('Flag ID').setRequired(true)
            );
        });
    }),

  async execute(interaction) {
    const group = interaction.options.getSubcommandGroup(false);
    const sub = interaction.options.getSubcommand();

    if (group === null && sub === 'reset') {
      await handleReset(interaction);
    } else if (group === 'codex' && sub === 'unlock') {
      await handleCodexUnlock(interaction);
    } else if (group === 'flag' && sub === 'set') {
      await handleFlagSet(interaction);
    }
  }
};

async function handleReset(interaction) {
  if (!isGM(interaction)) {
    await interaction.reply({ content: 'Unauthorized.', ephemeral: true });
    return;
  }
  const target = interaction.options.getUser('player');
  const { rows } = await db.query('SELECT id FROM players WHERE discord_id = ?', [target.id]);
  if (rows.length === 0) {
    await interaction.reply({ embeds: [simple('Player not found.')], ephemeral: true });
    return;
  }
  const playerId = rows[0].id;
  const tables = ['user_stats', 'user_weapons', 'user_armors', 'user_ability_cards', 'user_flags', 'codex_entries', 'mission_log'];
  for (const t of tables) {
    await db.query(`DELETE FROM ${t} WHERE player_id = ?`, [playerId]);
  }
  await db.query('DELETE FROM players WHERE id = ?', [playerId]);
  await interaction.reply({ embeds: [simple('Player reset.')], ephemeral: true });
  await logGMAcion(interaction.user.username, target.username, 'reset', target.id);
}

async function handleCodexUnlock(interaction) {
  if (!isGM(interaction)) {
    await interaction.reply({ content: 'Unauthorized.', ephemeral: true });
    return;
  }
  const target = interaction.options.getUser('player');
  const entry = interaction.options.getString('entry');
  const { rows } = await db.query('SELECT id FROM players WHERE discord_id = ?', [target.id]);
  if (rows.length === 0) {
    await interaction.reply({ embeds: [simple('Player not found.')], ephemeral: true });
    return;
  }
  const playerId = rows[0].id;
  await db.query(
    'INSERT INTO codex_entries (player_id, entry_key) VALUES (?, ?) ON DUPLICATE KEY UPDATE unlocked_at = NOW()',
    [playerId, entry]
  );
  await interaction.reply({ embeds: [simple('Codex updated.')], ephemeral: true });
  await logGMAcion(interaction.user.username, target.username, 'codex unlock', entry);
}

async function handleFlagSet(interaction) {
  if (!isGM(interaction)) {
    await interaction.reply({ content: 'Unauthorized.', ephemeral: true });
    return;
  }
  const target = interaction.options.getUser('player');
  const flagId = interaction.options.getString('flag_id');
  const { rows } = await db.query('SELECT id FROM players WHERE discord_id = ?', [target.id]);
  if (rows.length === 0) {
    await interaction.reply({ embeds: [simple('Player not found.')], ephemeral: true });
    return;
  }
  const playerId = rows[0].id;
  await db.query(
    'INSERT INTO user_flags (player_id, flag) VALUES (?, ?) ON DUPLICATE KEY UPDATE timestamp = CURRENT_TIMESTAMP',
    [playerId, flagId]
  );
  await interaction.reply({ embeds: [simple('Flag applied.')], ephemeral: true });
  await logGMAcion(interaction.user.username, target.username, 'flag set', flagId);
}
