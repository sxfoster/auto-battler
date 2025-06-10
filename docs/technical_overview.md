# Technical Overview

This document explains the structure of the MVP code in `card_rpg_mvp/public` and how the pieces fit together. It is intended for developers who want to extend the prototype or integrate AI generated features.

## Folder Layout

```
card_rpg_mvp/public/
├── api/            # PHP endpoints for saving/loading data
├── app.js          # Main client-side logic
├── index.html      # Entry point for the browser game
├── style.css       # Basic styling
└── includes/       # Shared PHP includes
```

### API Endpoints

The `api/` directory contains simple PHP scripts used for data persistence:

- `save.php` – saves a JSON payload to `data.json` on the server
- `load.php` – returns the contents of `data.json`

These scripts are intentionally minimal and can be replaced with a real backend.

### Client Logic

`app.js` manages the user interface and communicates with the PHP API via `fetch`. Key features include:

- Dynamic creation of character and card elements
- Simple turn-based battle loop
- Logging of battle events for replay

The code is organized by scene (setup, battle, tournament). Each scene has helper functions for rendering and user interactions.

## Suggested Improvements

- Replace the PHP API with a more robust backend (Node.js, Python, etc.) and a real database if persistent storage is required.
- Split `app.js` into modules or components to improve maintainability.
- Add tests for combat logic and API functions.
- Consider using a JavaScript framework (React/Vue) for complex UI flows.

## Related Design Docs

For gameplay and balancing details, consult the other documents in this folder:

- [gdd.md](gdd.md)
- [mechanics_gdd.md](mechanics_gdd.md)
- [game_modes_gdd.md](game_modes_gdd.md)

