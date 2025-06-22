const embedBuilder = require('./embedBuilder');

const confirm = msg => embedBuilder.simple('✅ Success', [{ name: 'Result', value: msg }]);

module.exports = confirm;
