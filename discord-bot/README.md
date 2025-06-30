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

1. **Choose a hero** – pick a starter hero to establish your initial stats.
2. **Select an ability** – equip one starting ability.
3. **Pick a weapon** – add a weapon for attack bonuses.
4. **Choose armor** – round out your defenses.
5. **Confirm** – review the recap embed and finalize your champion.

After confirmation the champion is saved to your roster and you can explore the rest of the commands.

## Using `/game`

`/game` provides a quick introduction battle and hands you a starter ability card. When you confirm the prompt the bot equips that ability and launches a short fight against a goblin. Your hero is chosen dynamically based on the ability's **archetype** and rarity. You can rerun `/game` to try a different ability – swapping abilities changes which hero you field.

## Ability-Based Archetypes

Abilities belong to themed archetypes such as **Stalwart Defender** or **Raging Fighter**. The rarity of the equipped ability determines which hero from that archetype you control. Equipping a higher rarity card automatically upgrades your hero, while changing to a different archetype swaps you to a completely new hero.

## Using `/who`

`/who` displays a short character sheet for the mentioned player. You must mention the target user:

```bash
/who @SomePlayer
```

The command responds with a styled embed showing the player's name, current archetype, base HP and Attack, and the ability they currently have equipped. If the player has not started the game or has no ability equipped, the embed will indicate that instead.

Example output:

```
Character Sheet
Player: SomePlayer - Stalwart Defender
HP: 16
Attack: 2
Equipped Ability: Power Strike
```

## Using `/adventure`

`/adventure` sends your hero into a practice fight against a random goblin. The
command posts an embed that updates every couple seconds to show remaining HP
for all combatants. The battle log grows from top to bottom, with new entries
appended to the bottom of the list. When the fight ends a final embed announces
**Victory** or **Defeat** and any loot is granted.

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
