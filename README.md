# Web Game Monorepo

This monorepo hosts a small web based game split into three workspaces:

- **client** – a React UI powered by Vite for menus and interface elements.
- **game** – Phaser&nbsp;3 scenes for the dungeon and battle logic.
- **shared** – common models and utilities used by both stacks.

Each package contains minimal build and start scripts. Run `npm install` in the
root and then `npm start` inside either the `client` or `game` folder to launch
their development servers.
