# Auto-Battler Card RPG

This repository contains a simple browser-based card RPG prototype with accompanying design documents. It can serve as a starting point for building an auto-battler or turn-based combat system.

## Repository Structure

- **card_rpg_mvp/** – Minimal playable prototype containing HTML, CSS, JavaScript and PHP for a basic card RPG.
- **hero-battler-modular/** – Modernized hero draft & battle prototype using ES6 modules.
- **docs/** – Game design documents describing classes, cards, items, mechanics and other systems.
- **index.html** – Earlier single-file proof of concept kept for reference.

## Running the Prototypes Locally

This repository currently contains two small demos. Both can be run with a simple local web server.

### 1. `card_rpg_mvp` (PHP based)

1. Install PHP (7.4+ recommended).
2. Start the built-in PHP server from the repository root:
   ```bash
   php -S localhost:8000 -t card_rpg_mvp/public
   ```
3. Visit `http://localhost:8000` in your browser.

### 2. `hero-battler-modular` (ES6 modules)

This prototype is purely static but uses JavaScript modules, so the files must be served over HTTP. Any simple web server will work. One option is:

```bash
php -S localhost:8001 -t hero-battler-modular
```

Then open `http://localhost:8001` to try the modular draft & battle demo.

## Development Notes

- The main client logic lives in `card_rpg_mvp/public/app.js`.
- Basic styles are in `card_rpg_mvp/public/style.css`.
- API endpoints are under `card_rpg_mvp/public/api` and are written in PHP.

## Design Documents

The `docs/` folder contains markdown files with additional design details:

- `gdd.md` – overall game design document
- `class_card_gdd.md`, `armor_gdd.md`, `weapons_gdd.md` – details on cards and equipment
- `mechanics_gdd.md`, `game_modes_gdd.md` – status effects, PvP and other systems
- `event_schema.md` – contract for battle log events between backend and frontend

These documents are intended to guide future feature development.

## Contribution Guidelines

1. Fork the repository and create a new branch for your feature or bugfix.
2. Follow the existing coding style in JavaScript and PHP files.
3. Update or add tests if applicable.
4. Open a pull request with a clear description of your changes.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

