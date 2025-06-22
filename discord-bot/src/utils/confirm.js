const { simple } = require('./embedBuilder');

/**
 * Returns a success embed with a standardized checkmark
 * @param {string} message
 */
function confirm(message) {
  return simple('✅ Success', [
    { name: 'Result', value: message }
  ]);
}

module.exports = confirm;
