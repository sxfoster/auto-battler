# Game Design Document: poc.html - Card Visual Prototype

## 1. Overview / Introduction
*   **Project Title:** Hero Card Prototype (poc.html)
*   **Core Concept:** A single HTML file serving as a visual proof-of-concept for displaying hero cards in various formats, including detailed views with stats and abilities, compact views, and a view showing equippable gear.
*   **Original Goals/Vision:**
    *   To explore and demonstrate different visual designs for hero cards.
    *   To prototype UI elements like rarity indicators, tooltips, card flipping for lore, and visual representation of equipped items.
    *   To establish a visual style for cards using specific fonts and Tailwind CSS.

## 2. Core Features Displayed

*   **Card Visual Styles:**
    *   **Detail View:**
        *   Large card format (320x450px).
        *   Displays: Hero Art, Name (Cinzel font), HP, Attack stats, XP bar, a list of Abilities.
        *   Rarity Indication: Different border colors and background frame images (placeholders) for Common, Uncommon, Rare, and "Ultra Rare" (likely equivalent to Epic).
        *   Ultra Rare cards feature a "shimmer" animation effect.
        *   Flip Functionality: Cards can be clicked to flip over, revealing lore text on the back. The back also reflects the rarity frame.
    *   **Compact View:**
        *   Smaller card format (100x140px).
        *   Displays: Compact Art, Name, HP bar, and Attack value.
        *   Rarity borders are also applied.
    *   **Socketed Gear View:**
        *   Based on the Detail View.
        *   Visually attaches smaller "gear cards" (Weapon and Armor sockets) to the sides of the main hero card.
        *   These gear sockets also have tooltips showing their name and effects (e.g., "+2 Attack, +1 Speed").
*   **Interactive UI Elements:**
    *   **Tooltips:** Appear on hover over stats (to show base vs. modified values), abilities (to show effect descriptions and keywords like "Stun"), and gear sockets.
    *   **Card Flipping:** Clickable button on detail cards to flip them.
*   **Styling & Presentation:**
    *   Uses Google Fonts (Cinzel for names/titles, Inter for body text).
    *   Leverages Tailwind CSS for rapid styling and layout.
    *   Custom CSS for specific card aesthetics, animations (shimmer), and pseudo-elements for frames/tooltips.

## 3. Game Flow / Progression (Not Applicable)
*   This PoC is purely visual and does not contain any game flow, progression, or simulation logic. Data is hardcoded.

## 4. User Interface (UI) / User Experience (UX)
*   Focuses entirely on the visual presentation of cards.
*   Demonstrates how information hierarchy could be established on a card (name, art, stats, abilities).
*   Explores interactive elements like hover tooltips and card flipping to reveal more information without cluttering the main view.

## 5. Technical Implementation Details
*   **Platform:** Single HTML file (`poc.html`).
*   **Technologies:**
    *   HTML
    *   CSS (Tailwind CSS via CDN, custom inline CSS)
    *   Minimal JavaScript for card flipping interactivity.
*   **Data:** All hero and item information is hardcoded directly into the HTML structure. No external data files are used for this PoC.
*   **Dependencies:** Font Awesome for icons (flip button), Google Fonts, Tailwind CSS CDN.

## 6. What Was Tried / Prototypes
*   This entire file *is* a prototype, specifically for card visuals.
*   It tests different levels of detail for card presentation (full detail, compact, detail with gear).
*   It experiments with visual cues for rarity and special card types (shimmer for Ultra Rare).

## 7. Lessons Learned (Deduced)
*   **Visual Design Exploration:** Useful for quickly iterating on the look and feel of game assets.
*   **Component Reusability (Conceptual):** While not using a framework, the distinct card views suggest how different card components could be designed for various contexts in a full application.
*   **Tailwind CSS for Rapid UI Prototyping:** Demonstrates the utility of a utility-first CSS framework for quickly building UI mockups.

## 8. Connections to Other Projects
*   **Visual Basis:** Provides a potential visual direction for the cards used in the `auto-battler-react/` client and the `ironaccord-bot/` (especially for `cardRenderer.js`).
*   **Data Structure Ideas:** The hardcoded data (hero stats, abilities) reflects the kind of information that is structured in `data.js` files in other projects.
*   The "Ultra Rare" rarity used here likely corresponds to the "Epic" rarity defined in the main game data.

## 9. Future Ideas / Potential Improvements (If this PoC were to be expanded)
*   Integrate with a JavaScript data source (`data.js`) to dynamically generate cards instead of hardcoding.
*   Componentize the card designs using a JavaScript framework (like React, as seen in `auto-battler-react`).
*   Add more card types (abilities, items as separate visual cards).

This GDD for `poc.html` is now created.
Next, I will investigate `poc2`. I'll first check if it's a file or directory.
