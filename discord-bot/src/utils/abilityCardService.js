const cardsByUser = new Map();

async function getAbilityCards(discordId) {
  return cardsByUser.get(discordId) || [];
}

async function getEquippedAbility(discordId) {
  const cards = await getAbilityCards(discordId);
  return cards.find(c => c.equipped) || null;
}

function __setCards(discordId, cards) {
  cardsByUser.set(discordId, cards);
}

module.exports = { getAbilityCards, getEquippedAbility, __setCards };
