# Technical Overview

This document explains the structure of the playable prototype located in `hero-game/` and how the pieces fit together. It is intended for developers who want to extend the prototype or integrate AI generated features.

## Folder Layout

```
hero-game/
├── index.html       # Entry point for the browser game
├── style.css        # Basic styling
└── js/
    ├── main.js      # Game bootstrap and scene management
    ├── data.js      # Static card and hero data
    ├── background-animation.js
    ├── utils.js
    ├── scenes/      # Individual scenes (pack, draft, battle, recap)
    ├── systems/     # Game systems such as EffectProcessor
    └── ui/          # UI helpers like CardRenderer
```

### Client Logic

The project is entirely client side. `js/main.js` manages the overall state machine and coordinates the various scenes. Supporting modules under `js/scenes/`, `js/ui/` and `js/systems/` implement the draft flow, battle simulator and rendering helpers.

### Suggested Improvements

- Introduce a real backend (Node.js, Python, etc.) if persistent storage or matchmaking is desired.
- Break large modules into smaller units and add tests for combat logic.
- Consider using a framework such as React or Vue for complex UI flows.

## Related Design Docs

For gameplay and balancing details, consult the other documents in this folder:

- [gdd.md](gdd.md)
- [mechanics_gdd.md](mechanics_gdd.md)
- [game_modes_gdd.md](game_modes_gdd.md)

