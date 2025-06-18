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

## Gameplay UI

The battle screen includes an expandable log panel. Entries are categorized and
can be filtered to show only combat, healing, status or utility events. Each log
line displays an icon and round summaries appear at the end of every round.
Hovering a log entry highlights the relevant combatant on the board.

An announcer box briefly appears in the center of the screen to show ability
messages, with the main text and a smaller subtitle.

When hovering any status effect icon on a card, a tooltip displays the status
name, remaining duration and description.

