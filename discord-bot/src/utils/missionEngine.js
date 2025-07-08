async function resolveChoice(playerId, choiceData) {
  // placeholder engine simply echoes the choice data
  return choiceData.result || {};
}

module.exports = { resolveChoice };
