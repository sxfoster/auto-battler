# Game

This package hosts the Phaser 3 scenes that power the dungeon and battles. It
also uses Vite for local development and bundling.

The scenes can run on their own or be embedded inside the React client. The
`DungeonScene` manages fog‑of‑war exploration while `BattleScene` runs the
auto‑battler logic shown in the client's combat overlay.

## Scripts

- `npm start` – launch the dev server on <http://localhost:8080>.
- `npm run build` – create a production build.
