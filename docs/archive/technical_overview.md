# Technical Overview

This document explains the structure of the playable prototype located in `auto-battler-react/` and how the pieces fit together. It is intended for developers who want to extend the prototype or integrate AI generated features.

Additional design documents are listed in [README.md](README.md).

## Folder Layout

```
auto-battler-react/
├── index.html            # HTML entry point loaded by Vite
├── src/
│   ├── main.jsx          # Application bootstrap
│   ├── data/             # Static card and hero data
│   ├── scenes/           # Individual scenes (pack, draft, battle, recap)
│   ├── components/       # Shared React components
│   └── store.js          # Zustand store and helpers
└── public/
    └── vite.svg          # Example static asset
```

## Running Locally

From the repository root run the React development server:

```bash
cd ../auto-battler-react
npm install
npm run dev
```

This will launch Vite on `http://localhost:5173` by default. Additional options are described in [../README.md](../README.md).

### Client Logic

The project is entirely client side. `js/main.js` manages the overall state machine and coordinates the various scenes. Supporting modules under `js/scenes/`, `js/ui/` and `js/systems/` implement the draft flow, battle simulator and rendering helpers.

All card and hero definitions live in `js/data.js`.  Editing this file is the quickest way to experiment with new abilities or unit stats.

`js/data.js` also defines an `allPossibleMinions` object that lists every summonable unit. Ability cards can include a `summons` property referencing one or more of those keys. `BattleScene.js` uses this information to create minions via a `_summonUnit` helper and recalculates the turn queue so newly spawned units act at the correct time. Status effects apply specific aura classes to the affected card and each icon displays a tooltip describing the effect.

### Suggested Improvements

- Introduce a real backend (Node.js, Python, etc.) if persistent storage or matchmaking is desired.
- Break large modules into smaller units and add tests for combat logic.
- Consider using a framework such as React or Vue for complex UI flows.

## Battle Event System

The combat simulator outputs a stream of JSON messages used to update the interface.
Each message includes an `eventType` and payload as described in [event_schema.md](event_schema.md).
Animation guidelines for these events are listed in [animation_timing_map.md](animation_timing_map.md).

## Related Design Docs

For gameplay and balancing details, consult the other documents in this folder:

- [gdd.md](gdd.md)
- [mechanics_gdd.md](mechanics_gdd.md)
- [game_modes_gdd.md](game_modes_gdd.md)

