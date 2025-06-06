# Client

This package contains the React user interface for the game. Vite provides
the development server and build tooling.

The UI now embeds the Phaser scenes via a `GameView` component. A grid based
`DungeonMap` lets you click through rooms and start battles which appear in a
combat overlay.

## Scripts

- `npm start` – start the Vite dev server.
- `npm run build` – create a production build in `dist/`.
- `npm run lint` – run ESLint over the source files.
