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

## Using `/game`

`/game` starts a lightweight onboarding flow that lets testers try class selection without going through the full `/begin` process. Running the command posts an ephemeral message listing the available classes (currently only `Recruit`). Selecting one shows a short description along with **Confirm** and **Choose Another** buttons. Confirm locks in your pick while **Choose Another** returns you to the class list so you can preview a different option.

## Using `/who`

`/who` displays the champion bound to a Discord user. You must mention the target player:

```bash
/who @SomePlayer
```

The command replies with a styled embed showing the player's name and class. If the player has not started the game or has not chosen a class, the embed will display that message instead.

Example output:

```
Player Details
Player: SomePlayer - Bard
```

## Admin Tools

`/admin grant-ability` lets users with the **Game Master** role grant an ability card to any player. The command requires two options:

```bash
/admin grant-ability user:@SomePlayer ability:"Power Strike"
```

The Game Master receives an ephemeral confirmation message while the target player is sent a DM with the standard ability card embed.

## Database Migration

The updated schema introduces a `user_ability_cards` table and a new
`equipped_ability_id` column on `users`.

1. Run the statements in `db-schema.sql` against your MySQL database.
2. For existing installs, create a `user_ability_cards` row for each
   player's current ability and update `users.equipped_ability_id` to
   point to that card.

New deployments only need to execute the schema file.

## Running Tests

The bot includes a Jest test suite located in the `tests/` directory. Install
dependencies and run the suite with:

```bash
npm install
npm test
```

`npm test` runs Jest and executes all tests.
