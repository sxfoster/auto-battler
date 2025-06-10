# UI/UX Design Document

## 1. Card Tooltip Layout

### 1.1. Core Elements for Each Card Tooltip:

- **Card Name:** Displayed prominently (e.g., "Reckless Smash").
- **Energy Cost:** Display energy cost next to the card name (e.g., "⚡ 3 Energy").
- **Damage/Effect Summary:** E.g., "Deal 5 damage, take 1 self-damage".
- **Damage Type Icon + Label:** A small symbol and text indicating type: 🗡️ Slashing, 🎯 Piercing, 🔨 Bludgeoning, ✨ Magic.
- **Armor Interactions (Subtext or Hover Detail):** Automatically show how the damage type interacts with armor: "Deals +2 damage vs. Heavy Armor," "Deals -2 damage vs. Heavy Armor," "Ignores 1 armor when hitting Heavy targets".
- **Status Effects (if any):** "Applies Bleed (1 dmg/turn for 2 turns)" or "Stuns for 1 turn if target is already Slowed".
- **Flavor Text (Optional):** Add lore or class flavor (e.g., "Favored by brutal warlords").

### 1.2. Tooltip Example:

- 🗡️ Reckless Smash
- ⚡ 3 Energy
- Deal 5 damage, but take 1 self-damage.
- 🔨 Bludgeoning
- +2 damage vs. Heavy Armor
- Applies Stun if target is Slowed.
- Favored by berserkers who value raw power.

### 1.3. Advanced Version (Optional):

- Tooltips can dynamically update during combat.
- **Example:** If a target is wearing Heavy Armor, the tooltip could flash: "Current Bonus: +2 damage (Heavy Armor Vulnerability)".
