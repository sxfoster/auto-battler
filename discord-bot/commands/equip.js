const { SlashCommandBuilder } = require('discord.js');
const db = require('../util/database');
const { simple } = require('../src/utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('equip')
    .setDescription('Equip an owned item')
    .addStringOption(opt =>
      opt.setName('type')
        .setDescription('Item type')
        .setRequired(true)
        .addChoices(
          { name: 'Weapon', value: 'weapon' },
          { name: 'Armor', value: 'armor' },
          { name: 'Ability', value: 'ability' }
        )
    )
    .addIntegerOption(opt =>
      opt.setName('id')
        .setDescription('Item ID')
        .setRequired(true)
    ),
  async execute(interaction) {
    const type = interaction.options.getString('type');
    const itemId = interaction.options.getInteger('id');
    const discordId = interaction.user.id;

    const { rows: players } = await db.query(
      'SELECT id FROM players WHERE discord_id = ?',
      [discordId]
    );
    if (players.length === 0) {
      const embed = simple('Character not found.');
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }
    const playerId = players[0].id;

    let table;
    let column;
    if (type === 'weapon') {
      table = 'user_weapons';
      column = 'equipped_weapon_id';
    } else if (type === 'armor') {
      table = 'user_armors';
      column = 'equipped_armor_id';
    } else {
      table = 'user_ability_cards';
      column = 'equipped_ability_id';
    }

    const { rows: items } = await db.query(
      `SELECT id FROM ${table} WHERE id = ? AND player_id = ?`,
      [itemId, playerId]
    );
    if (items.length === 0) {
      const embed = simple('You do not own that item.');
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    await db.query(
      `UPDATE players SET ${column} = ? WHERE id = ?`,
      [itemId, playerId]
    );

    const embed = simple('Item equipped!');
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
