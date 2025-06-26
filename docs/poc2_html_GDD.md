# Game Design Document: poc2.html - Pack Opening & Draft UI Prototype

## 1. Overview / Introduction
*   **Project Title:** Character Draft Prototype (poc2.html)
*   **Core Concept:** A single HTML file prototyping the user interface and interaction flow for opening a virtual booster pack and then drafting two heroes from a selection of four revealed cards.
*   **Original Goals/Vision:**
    *   To visualize and test the UX of a pack opening sequence.
    *   To prototype a simple hero drafting mechanism where players select two heroes for a team.
    *   To refine compact card visuals suitable for a draft pool and team display.

## 2. Core Features Displayed

*   **Pack Opening Screen:**
    *   Presents a large, stylized "booster pack" graphic.
    *   Instructional text prompts the user to click the pack.
    *   Clicking the pack triggers a transition to the draft screen.
*   **Drafting Screen:**
    *   **Team Slots Area:**
        *   Displays two clearly marked, empty slots for "Hero 1" and "Hero 2".
        *   When a hero is selected, their compact card representation (art, name, rarity) fills the slot.
    *   **Draft Pool Area:**
        *   Shows four hero cards revealed from the "opened pack".
        *   These cards use a "compact card" design with circular art, name, and rarity.
        *   "Ultra Rare" cards have a shimmer animation.
    *   **Selection Interaction:**
        *   Users click on a hero card from the draft pool to assign it to the next available empty team slot.
        *   Selected heroes in the pool are visually marked (e.g., dimmed) to indicate they've been chosen.
        *   Users can click on a hero in a filled team slot to unselect them, making that hero available again in the pool and emptying the slot.
    *   **Confirmation:**
        *   A "Confirm Draft" button is present.
        *   The button becomes active only when both team slots have been filled with selected heroes.
*   **Card Visuals (Compact Style):**
    *   Designed for quick identification in a pool or team display.
    *   Features: Circular hero art, hero name, rarity.
    *   Rarity is indicated by border color and text (Common, Uncommon, Rare, "Ultra Rare").

## 3. Game Flow / Progression (Simplified)

1.  **Pack Opening:** User is presented with a booster pack and clicks it.
2.  **Transition:** Screen animates/fades to the draft interface.
3.  **Hero Selection (Draft Pool):** Four random hero cards are displayed.
4.  **Team Slot Filling:** User clicks two heroes from the pool to fill the two team slots.
    *   Can deselect from team slots to change choices.
5.  **Confirmation:** Once two heroes are selected, the "Confirm Draft" button activates.
    *   (PoC ends here; no further action on confirmation).

## 4. User Interface (UI) / User Experience (UX)

*   **Clear Visual Flow:** Guides the user from pack opening to team selection.
*   **Interactive Selection:** Provides immediate visual feedback when cards are selected or deselected.
*   **Minimalist Design:** Focuses on the core interaction of picking cards.
*   **Animated Transitions:** Simple opacity fades and card reveal animations enhance the experience.

## 5. Technical Implementation Details

*   **Platform:** Single HTML file (`poc2.html`).
*   **Technologies:**
    *   HTML
    *   CSS (Tailwind CSS via CDN, custom inline CSS for specific elements and animations).
    *   JavaScript for:
        *   Handling pack opening transition.
        *   Randomly selecting 4 heroes from a predefined array to populate the draft pool.
        *   Managing the selection/deselection of heroes into team slots.
        *   Updating the UI to reflect selections.
        *   Activating the confirm button.
*   **Data:**
    *   A hardcoded JavaScript array `allPossibleHeroes` (containing 12 sample heroes with `id`, `name`, `rarity`, and `art` URL) serves as the source for cards.
*   **Dependencies:** Font Awesome for icons, Google Fonts, Tailwind CSS CDN.

## 6. What Was Tried / Prototypes

*   This entire file is a UI/UX prototype for pack opening and a basic 2-hero draft.
*   It experiments with visual feedback for card selection and slot filling.
*   It introduces an animated transition between the "pack" state and the "draft" state.

## 7. Lessons Learned (Deduced)

*   **Visual Feedback is Key:** Clearly indicating selected cards and filled slots is important for user understanding in a draft.
*   **Staged Reveal:** The concept of opening a pack and then seeing a selection of cards is a common and engaging mechanic.
*   **Simplified Data for Prototyping:** Using a small, hardcoded dataset is effective for quickly prototyping UI interactions.

## 8. Connections to Other Projects

*   **Evolution of Drafting:** This PoC represents an earlier, simpler version of the multi-stage drafting (hero, then ability, then weapon, then armor) found in `hero-game/`.
*   **Card Visuals:** The compact card style with circular art is distinct from the rectangular art in `poc.html` and `hero-game/`, showing exploration of different visual approaches.
*   The "Ultra Rare" rarity likely maps to "Epic" in the more developed projects.

## 9. Future Ideas / Potential Improvements (If this PoC were to be expanded)

*   Expand the draft to include other card types (weapons, abilities, armor) per hero.
*   Allow drafting for more than two hero slots.
*   Integrate with a more dynamic data source.
*   Add more sophisticated animations for pack opening (e.g., cards physically flying out).
*   Implement further actions after "Confirm Draft" (e.g., proceeding to a battle setup screen).

This GDD for `poc2.html` is now created.
Finally, I will investigate `poc3.html`.
