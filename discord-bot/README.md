# Discord Bot

This folder contains the Node.js bot that powers the auto‑battler experience on Discord.

## Setup

1. Copy `.env.example` to `.env` and provide the following values:
   - `DISCORD_TOKEN` – your bot token
   - `APP_ID` and `GUILD_ID` – used when deploying slash commands
   - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE` – MySQL credentials
   - `PVP_CHANNEL_ID` – channel ID for duel announcements
2. Import `db-schema.sql` into your MySQL database.
3. Install dependencies and start the bot:

   ```bash
   npm install
   node deploy-commands.js
   node index.js
   ```

A successful startup prints `Database connection successful`.

## Slash Commands

The trimmed command set includes:

- `/tutorial` – guided onboarding for new players
- `/town` – open the hub with buttons for adventure and PvP
- `/adventure` – venture into a PvE encounter for loot
- `/challenge` – duel another player
- `/practice` – start a practice match via Discord's activity invite
- `/inventory show` – view your champion and backpack
- `/inventory set` – equip an ability card
- `/auctionhouse` – buy or list ability cards
- `/leaderboard` – display top PvE and PvP records
- `/who` – show a player's stats
- `/settings battle_logs` / `/settings item_drops` – toggle DM preferences
- `/admin grant-ability` – grant a card (Game Master only)
- `/ping` – check bot responsiveness

## Database Schema

`db-schema.sql` defines the minimal tables:

- `users` – player records with gold, state and preferences
- `user_ability_cards` – owned ability cards
- `user_weapons` – owned weapons
- `user_champions` – each player's champion
- `champion_decks` – ability order for a champion
- `user_inventory` – general item storage
- `pvp_battles` – challenge history and logs
- `auction_house_listings` – marketplace postings
- `battle_replays` – stored battle logs

Run the statements in the file on a new install. Existing databases may need to migrate accordingly.

## Tests

Run the Jest suite with:

```bash
npm install
npm test
```
