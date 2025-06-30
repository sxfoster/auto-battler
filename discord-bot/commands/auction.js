const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require('discord.js');
const auctionHouseService = require('../src/utils/auctionHouseService');
const { allPossibleAbilities } = require('../../backend/game/data');

const data = new SlashCommandBuilder()
  .setName('auction')
  .setDescription('Browse the auction house');

async function execute(interaction) {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('auction-buy')
      .setLabel('Browse Listings')
      .setStyle(ButtonStyle.Primary)
  );
  await interaction.reply({ content: 'Welcome to the Auction House!', components: [row], ephemeral: true });
}

async function handleBuyButton(interaction) {
  const listings = await auctionHouseService.getCheapestListings();
  if (!listings.length) {
    await interaction.update({ content: 'No listings found.', components: [], embeds: [], ephemeral: true });
    return;
  }

  const embed = new EmbedBuilder()
    .setColor('#29b6f6')
    .setTitle('Cheapest Listings');

  const row = new ActionRowBuilder();

  listings.forEach(listing => {
    const ability = allPossibleAbilities.find(a => a.id === listing.card_id);
    const name = ability ? ability.name : `Card ${listing.card_id}`;
    embed.addFields({ name, value: `${listing.price} gold - Seller: ${listing.seller_name}` });
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`ah-buy-listing:${listing.id}`)
        .setLabel(`Buy ${name}`)
        .setStyle(ButtonStyle.Success)
    );
  });

  await interaction.update({ content: 'Select a listing to purchase:', embeds: [embed], components: [row], ephemeral: true });
}

async function handleBuyListing(interaction) {
  const [, idStr] = interaction.customId.split(':');
  const listingId = Number(idStr);
  try {
    const { buyer, seller, listing } = await auctionHouseService.purchaseListing(listingId, interaction.user.id);
    const ability = allPossibleAbilities.find(a => a.id === listing.card_id);
    const name = ability ? ability.name : `Card ${listing.card_id}`;
    await interaction.update({
      content: `You bought **${name}** for ${listing.price} gold from ${seller.name}.`,
      components: [],
      embeds: [],
      ephemeral: true
    });

    try {
      const sellerUser = await interaction.client.users.fetch(seller.discord_id);
      await sellerUser.send(`${buyer.name} bought your ${name} for ${listing.price} gold.`);
    } catch (e) {
      /* ignore DM failures */
    }
  } catch (err) {
    await interaction.update({ content: err.message, components: [], embeds: [], ephemeral: true });
  }
}

module.exports = { data, execute, handleBuyButton, handleBuyListing };
