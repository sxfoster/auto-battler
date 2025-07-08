const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const db = require('../util/database');
const { simple } = require('../src/utils/embedBuilder');
const characterService = require('../src/utils/characterService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('character')
    .setDescription('Character management')
    .addSubcommand(sub =>
      sub
        .setName('create')
        .setDescription('Create a new character')
        .addStringOption(opt =>
          opt.setName('faction')
            .setDescription('Choose your faction')
            .setRequired(true)
            .addChoices({ name: 'Iron Accord', value: 'Iron Accord' })
        )
    )
    .addSubcommand(sub =>
      sub
        .setName('view')
        .setDescription('View your character stats')
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'create') {
      const faction = interaction.options.getString('faction');
      const discordId = interaction.user.id;
      const name = interaction.user.username;

      const { rows } = await db.query('SELECT id FROM players WHERE discord_id = ?', [discordId]);
      if (rows.length > 0) {
        const embed = simple('Character already exists.');
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      }

      await db.query('INSERT INTO players (discord_id, name) VALUES (?, ?)', [discordId, name]);

      const embed = simple(`Welcome to the ${faction}!`, [
        { name: 'Next Step', value: 'Select one stat to increase by +1.' }
      ]);

      const menu = new StringSelectMenuBuilder()
        .setCustomId('stat_select')
        .setPlaceholder('Choose a stat')
        .addOptions(
          { label: 'Might', value: 'MGT' },
          { label: 'Agility', value: 'AGI' },
          { label: 'Fortitude', value: 'FOR' },
          { label: 'Intuition', value: 'INTU' },
          { label: 'Resolve', value: 'RES' },
          { label: 'Ingenuity', value: 'ING' }
        );

      const row = new ActionRowBuilder().addComponents(menu);
      await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    } else if (sub === 'view') {
      const sheet = await characterService.getCharacterSheet(interaction.user.id);
      if (!sheet) {
        await interaction.reply({ embeds: [simple('You have no character.')], ephemeral: true });
        return;
      }

      const stats = Object.entries(sheet.stats)
        .map(([s, v]) => `${s}: ${v}`)
        .join('\n');
      const gear = [
        `🗡️ ${sheet.gear.weapon || 'None'}`,
        `🛡️ ${sheet.gear.armor || 'None'}`,
        `📜 ${sheet.gear.ability || 'None'}`
      ].join('\n');
      const flags = sheet.flags.join(', ') || 'None';
      const codex = sheet.codex.join(', ') || 'None';

      const embed = simple('Character Sheet', [
        { name: 'Level', value: String(sheet.level), inline: true },
        { name: 'Stats', value: stats },
        { name: 'Equipped Gear', value: gear },
        { name: 'Active Effects', value: flags },
        { name: 'Codex', value: codex }
      ]);

      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
};
