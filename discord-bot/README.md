# Discord Bot

This folder contains the Node.js bot that powers the game's Discord integration.

## Prerequisites

1. Copy `.env.example` from the repository root to `.env` and fill in your settings.
   The bot requires a Discord token and MySQL credentials:
   - `DISCORD_TOKEN` – your bot token.
   - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE` – location and credentials for the database.
   - `APP_ID` and `GUILD_ID` are needed when running `deploy-commands.js`.

## Running the Bot

```bash
cd discord-bot
npm install
node deploy-commands.js  # registers the slash commands
node index.js            # starts the bot
```

The bot connects to the database on start and should log `Database connection successful`.

## Using `/begin`

The `/begin` command launches the onboarding flow for new players. The flow guides you
through drafting a starter champion:

1. **Choose a hero** – pick a base hero to determine class and stats.
2. **Select an ability** – equip one starting ability.
3. **Pick a weapon** – add a weapon for attack bonuses.
4. **Choose armor** – round out your defenses.
5. **Confirm** – review the recap embed and finalize your champion.

After confirmation the champion is saved to your roster and you can explore the rest of the commands.
