const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} = require('discord.js');
const userService = require('./userService');
const abilityCardService = require('./abilityCardService');
const auctionService = require('./auctionHouseService');
const gameData = require('../../util/gameData');
const { createBackToTownRow } = require('./components');

function getAllAbilities() {
  return Array.from(gameData.gameData.abilities.values());
}

function abilityName(id) {
  const ability = getAllAbilities().find(a => a.id === id);
  return ability ? ability.name : `Ability ${id}`;
}

async function handleSellButton(interaction) {
  const user = await userService.getUser(interaction.user.id);
  if (!user) {
    await interaction.reply({ content: 'User not found.', ephemeral: true });
    return;
  }
  const cards = await abilityCardService.getCards(user.id);
  if (!cards.length) {
    await interaction.reply({ content: 'You have no ability cards to sell.', ephemeral: true });
    return;
  }
  const menu = new StringSelectMenuBuilder()
    .setCustomId('ah-sell-select')
    .setPlaceholder('Select a card to sell')
    .addOptions(
      cards.map(card => ({
        label: `${abilityName(card.ability_id)} (${card.charges}/10)`,
        value: String(card.id)
      }))
    );
  const row = new ActionRowBuilder().addComponents(menu);
  await interaction.reply({ content: 'Choose a card to list for sale:', components: [row], ephemeral: true });
}

async function handleSellSelect(interaction) {
  const cardId = parseInt(interaction.values[0], 10);
  const user = await userService.getUser(interaction.user.id);
  if (!user) {
    await interaction.update({ content: 'User not found.', components: [], ephemeral: true });
    return;
  }
  const cards = await abilityCardService.getCards(user.id);
  const card = cards.find(c => c.id === cardId);
  if (!card) {
    await interaction.update({ content: 'Card not found.', components: [], ephemeral: true });
    return;
  }

  const modal = new ModalBuilder()
    .setCustomId(`ah-sell-modal:${cardId}`)
    .setTitle('Set Listing Price');
  const priceInput = new TextInputBuilder()
    .setCustomId('price')
    .setLabel('Price (gold)')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);
  modal.addComponents(new ActionRowBuilder().addComponents(priceInput));
  await interaction.showModal(modal);
}

async function handleSellModal(interaction) {
  const [, idStr] = interaction.customId.split(':');
  const cardId = parseInt(idStr, 10);
  const price = parseInt(interaction.fields.getTextInputValue('price'), 10);
  if (isNaN(price) || price <= 0) {
    await interaction.reply({ content: 'Invalid price.', ephemeral: true });
    return;
  }
  const user = await userService.getUser(interaction.user.id);
  if (!user) {
    await interaction.reply({ content: 'User not found.', ephemeral: true });
    return;
  }
  const cards = await abilityCardService.getCards(user.id);
  const card = cards.find(c => c.id === cardId);
  if (!card) {
    await interaction.reply({ content: 'Card not found.', ephemeral: true });
    return;
  }
  try {
    await auctionService.createListing(user.id, card, price);
    await interaction.reply({ content: `✅ Listed ${abilityName(card.ability_id)} for ${price} gold.`, ephemeral: true });
  } catch (err) {
    console.error('Failed to create listing', err);
    await interaction.reply({ content: 'Failed to create listing.', ephemeral: true });
  }
}

async function handleBuyButton(interaction) {
  const listings = await auctionService.getCheapestListings();
  if (!listings.length) {
    await interaction.reply({ content: 'No listings available.', ephemeral: true });
    return;
  }
  const menu = new StringSelectMenuBuilder()
    .setCustomId('ah-buy-select')
    .setPlaceholder('Select a listing to buy')
    .addOptions(
      listings.map(listing => ({
        label: `${abilityName(listing.ability_id)} - ${listing.price}g (${listing.charges}/10) by ${listing.seller_name}`,
        value: String(listing.id)
      }))
    );
  const row = new ActionRowBuilder().addComponents(menu);
  await interaction.reply({ content: 'Select a listing to purchase:', components: [row], ephemeral: true });
}

async function handleBuySelect(interaction) {
  const listingId = parseInt(interaction.values[0], 10);
  const user = await userService.getUser(interaction.user.id);
  if (!user) {
    await interaction.update({ content: 'User not found.', components: [], ephemeral: true });
    return;
  }
  try {
    const listing = await auctionService.purchaseListing(user.id, listingId, interaction.client);
    const navigationRow = createBackToTownRow();
    await interaction.update({
      content: `✅ You have successfully purchased **${abilityName(listing.ability_id)}** for ${listing.price} gold.`,
      components: [navigationRow],
      ephemeral: true
    });
  } catch (err) {
    console.error('Purchase failed', err);
    await interaction.update({ content: err.message || 'Purchase failed.', components: [], ephemeral: true });
  }
}

module.exports = {
  handleSellButton,
  handleSellSelect,
  handleSellModal,
  handleBuyButton,
  handleBuySelect
};
