const { simple } = require('./embedBuilder');

const confirm = msg => simple('✅ Success', [{ name: 'Result', value: msg }]);

module.exports = confirm;
