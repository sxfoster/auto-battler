# Hero Game Prototype

This folder contains the current JavaScript prototype of the auto‑battler.  It is fully client side and uses ES modules for structure.

## Structure

```
hero-game/
├── index.html       # Entry point
├── style.css        # Minimal styles
└── js/
    ├── main.js      # Bootstraps the game and manages scene flow
    ├── data.js      # Static card and hero data
    ├── background-animation.js
    ├── utils.js
    ├── scenes/      # Scene classes (PackScene, DraftScene, BattleScene, ...)
    ├── systems/     # Game systems such as EffectProcessor
    └── ui/          # UI helpers such as CardRenderer
```

## Running

Serve the repository with any static server and open `/hero-game/` in your browser.  For example:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000/hero-game/`.

