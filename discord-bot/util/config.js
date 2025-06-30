const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  get DISCORD_TOKEN() { return process.env.DISCORD_TOKEN; },
  get DB_HOST() { return process.env.DB_HOST; },
  get DB_USER() { return process.env.DB_USER; },
  get DB_PASSWORD() { return process.env.DB_PASSWORD; },
  get DB_DATABASE() { return process.env.DB_DATABASE; },
  get APP_ID() { return process.env.APP_ID; },
  get GUILD_ID() { return process.env.GUILD_ID; },
  get PVP_CHANNEL_ID() { return process.env.PVP_CHANNEL_ID; }
};
