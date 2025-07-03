const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const feedback = require('../utils/feedback');
const config = require('../../util/config');

const data = new SlashCommandBuilder()
  .setName('practice')
  .setDescription('Launch a practice battle Activity in your current voice channel.');

async function execute(interaction) {
  const { member } = interaction;

  // 1. Check if the user is in a voice channel
  if (!member.voice.channel) {
    return feedback.sendError(
      interaction,
      'Not in a Voice Channel',
      'You must be in a voice channel to start an activity.'
    );
  }

  // 2. Generate the invite for the Activity using the App ID from your config
  try {
    const invite = await member.voice.channel.createInvite({
      target_application_id: config.APP_ID,
      target_type: 2, // Required for Embedded Application invites
    });

    // Log the generated invite code and full URL for debugging
    console.log(`[Launcher] Generated Activity Invite Code: ${invite.code}`);
    const activityUrl = `https://discord.com/invite/${invite.code}`;
    console.log(`[Launcher] Full URL: ${activityUrl}`);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Start Practice Game')
        .setStyle(ButtonStyle.Link)
        .setURL(activityUrl)
    );

    await interaction.reply({
      content: 'Ready for practice? Click the button to launch the game in your voice channel!',
      components: [row],
      ephemeral: true,
    });
  } catch (error) {
    console.error('Failed to create Activity invite:', error);
    return feedback.sendError(
      interaction,
      'Invite Failed',
      'I was unable to create an activity invite for this voice channel. Please check my permissions.'
    );
  }
}

module.exports = { data, execute };
