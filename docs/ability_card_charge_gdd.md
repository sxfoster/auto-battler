# Ability Card & Charge System

## 1. Concept Overview
This system replaces temporary drafted abilities with persistent Ability Cards that drop from monsters. Cards are stored in the player's inventory and must be equipped to use in combat. Each card carries a limited number of charges, adding resource management to battles.

## 2. Core Mechanics
### 2.1 Acquiring Ability Cards
- **Loot Drops:** Monsters have a chance to drop an Ability Card matching their class.
- **Initial Charges:** Newly dropped cards start with **10/10** charges.

### 2.2 Inventory Management
- **Stacking:** Duplicate cards do not merge; each occupies its own slot.
- **Stack Limit:** Up to 25 copies of the same card may be held.
- **Display:** `/inventory` lists each card with its current charge count, e.g.
  - `Shield Bash 10/10`
  - `Shield Bash 7/10`
  - `Power Strike 0/10`

### 2.3 Equipping and Using Abilities
- **Setting an Ability:** Players select one card from their inventory to become their active ability. Only one ability can be set at a time.
- **Combat Usage:**
  - Heroes gain 1 energy per round.
  - When enough energy is available, the equipped ability is used automatically.
  - Each use consumes one charge from the card.

## 3. System Logic & Edge Cases
### 3.1 Charge Depletion & Swapping
- When the equipped card reaches **0 charges** during combat, the system searches the inventory for another copy with remaining charges.
- If found, that card automatically becomes the active ability while the depleted card stays in the inventory.
- If no charged copy exists, the hero can only perform basic attacks until a new ability is set.

## 4. Future Considerations
- **Recharging:** A later update will let players recharge depleted cards.
- **Card Merging:** Duplicate cards may be consumed to add charges to another copy.
- **Ability Tiers:** Higher-tier abilities will rely on the charge system for balance.
