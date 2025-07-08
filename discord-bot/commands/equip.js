const { SlashCommandBuilder } = require('discord.js');
const db = require('../util/database');
const { simple } = require('../src/utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('equip')
    .setDescription('Equip an item by ID')
    .addStringOption(opt =>
      opt
        .setName('type')
        .setDescription('Item type')
        .setRequired(true)
        .addChoices(
          { name: 'Weapon', value: 'weapon' },
          { name: 'Armor', value: 'armor' },
          { name: 'Ability', value: 'ability' }
        )
    )
    .addIntegerOption(opt =>
      opt.setName('item_id').setDescription('ID of the item').setRequired(true)
    ),
  async execute(interaction) {
    const type = interaction.options.getString('type');
    const itemId = interaction.options.getInteger('item_id');
    const { rows: playerRows } = await db.query(
      'SELECT id FROM players WHERE discord_id = ?',
      [interaction.user.id]
    );
    if (playerRows.length === 0) {
      const embed = simple('You have no character.');
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }
    const playerId = playerRows[0].id;
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
    const { rows: owned } = await db.query(
      `SELECT name FROM ${table} WHERE id = ? AND player_id = ?`,
      [itemId, playerId]
    );
    if (owned.length === 0) {
      const embed = simple('You do not own that item.');
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }
    await db.query(
      `UPDATE players SET ${column} = ? WHERE id = ?`,
      [itemId, playerId]
    );
    const embed = simple(`Equipped ${owned[0].name}!`);
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
