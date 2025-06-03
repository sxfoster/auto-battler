
# 🧭 Survival Dungeon CCG Auto-Battler — Game Design Document (GDD)

## 🎯 Game Concept

A **tactical survival dungeon crawler** built on **collectible card game (CCG)** mechanics and **auto-battler combat**.  
Players control a party of **1–5 characters**, assigning **up to 4 ability cards per character**, and guide them through procedurally generated **biome-themed dungeons** while managing **survival constraints**: Hunger, Thirst, and Fatigue.

- Every mechanic, item, action, or ability is implemented via **cards**.
- Players earn, craft, trade, and upgrade cards using a **player-driven economy** with a global **auction house**.
- Dungeons focus on **strategy, endurance, and preparation**, rather than reflex-based gameplay.

---

## ⚔️ Combat System

### 🔁 Core Combat Loop
- Players assign up to **4 ability cards** per character pre-combat.
- Characters act **automatically** in combat based on AI, speed, and context.
- Combat is resolved in **turns**, ordered by each unit’s `SpeedModifier`.

### 🎴 Card Execution
- All cards consume **Energy** and may have **cooldowns**.
- After each battle, all party members gain:
  - **+1 Fatigue**
  - **+1 Hunger**
  - **+1 Thirst**

---

## 📦 Card System

### 🧱 Card Categories

- **Ability Cards** — Used in auto-battles; cover attacks, buffs, heals, debuffs, and utility.
- **Equipment Cards** — Grant passive bonuses or enable specific card usage.
- **Ingredient Cards** — Collected from exploration/monsters, used in crafting.
- **Food/Drink Cards** — Restores Hunger/Thirst and may grant temporary buffs.
- **Elixir Cards** — Crafted potions with temporary dungeon-only passives.
- **Utility Cards** — Tools like traps, repair kits, campfires, etc.

### ⚖️ Role & Class Restrictions

- Each **Ability Card** has a `roleTag` and optional `classRestriction`.
- Cards used **outside the correct role** suffer a **-75% penalty** to effectiveness.
- Cards used by the **correct class** may unlock bonus effects or synergies.

### 🧪 Card Rarity & Scaling

- Rarities: **Common → Uncommon → Rare → Legendary**
- Higher rarities unlock at **character levels** (Lv 1–3: Common, Lv 10: Legendary).
- Cards are upgradeable via **crafting fusion** or dungeon achievements.

---

## 🛠️ Crafting System

### 🎓 Crafting Professions

- **Cooking** — Creates Food & Drink Cards (restores stats, grants buffs)
- **Smithing** — Upgrades base equipment (e.g., sword → flame sword)
- **Alchemy** — Creates Elixirs and Utility Cards

Each profession has a **level 1–10 progression system** with rewards such as:

- Higher crafting success rate
- Discovery of secret recipes
- Access to **exclusive** profession-only cards
- “**Crafted by [Player]**” tags on Auction House listings

### 🔮 Magical Pouch System

- Players drag up to **5 cards** into the pouch.
- No external crafting tools required.
- Every valid combination yields **at least a base result**.
- Recipes are:
  - **Discoverable through experimentation**
  - **Upgradeable** through repeat crafting or fusion

---

## 💰 Economy

### 💵 Currency

- **Gold** — Used for Town Market & basic goods
- **Guild Credits** — Earned via commissions, raid participation, or investment

### 🛒 Market Systems

1. **Town Marketplace** — Basic starter items and low-tier cards only
2. **Black Market** — Rare, cursed, or risky cards
3. **Guild Exchange** — Shared trading within guilds
4. **Auction House** *(Player Economy)*:
   - **Primary economic engine**
   - Players buy/sell crafted and looted cards
   - Only **Common** cards are purchasable with Gold
   - Everything else flows through player listings

---

## 🧑‍🤝‍🧑 Classes & Roles

### 🎭 Roles

- **Tank** — Draw aggro, soak damage, protect
- **Healer** — Restore HP, cleanse debuffs
- **Support** — Buff, control tempo, extend combos
- **DPS** — High single-target or AoE damage

### 🔖 Example Classes by Role

- **Tank**: Guardian, Warrior, Runestone Sentinel
- **Healer**: Cleric, Herbalist, Bloodweaver
- **Support**: Bard, Chronomancer, Totem Warden
- **DPS**: Blademaster, Wizard, Shadowblade, Ranger, Pyromancer

Each class has access to:

- **Core Cards** (all roles)
- **Role Cards**
- **Class-Specific Cards**

---

## 🧟 Enemy Design: Fungal Depths

| Enemy             | Type        | Abilities                                           |
|------------------|-------------|-----------------------------------------------------|
| Rotgrub Swarm     | Creature    | Bite Swarm (DoT), Burrow Latch (latched DoT)       |
| Spore Witch       | Demi-human  | Spore Veil (miss chance), Heal Fungus              |
| Myconid Brute     | Creature    | Fungal Slam (knockback), Thick Hide (damage resist)|
| Mushroom Shaman   | Demi-human  | Mind Spore (slow), Hallucinate (confuse)           |

---

## 🧭 Encounter Flow

1. **Card Assignment Phase** – Player equips cards to each character
2. **Enter Dungeon** – Procedural biome floors generated
3. **Combat Phase** – Auto-battle executes based on speed and card AI logic
4. **Post-Battle** – Gain loot, fatigue, hunger, thirst
5. **Rest** – Use Food/Drink to recover, apply buffs
6. **Continue or Exit** – Players may advance deeper or retreat to reset

---

## 🧩 Core Data Models

Includes detailed field names for all card, character, enemy, profession, and recipe types. [Omitted here for brevity; maintained in backend schema]

---

## 🌍 Biome Synergy Bonuses

Each dungeon biome enhances its native enemies with unique, passive bonuses that reflect the biome’s thematic identity and difficulty curve. These bonuses are automatically applied to all enemies spawned within the biome.

### Biome Bonus Examples

- **Fungal Depths**: Poison effects last +1 turn. First debuff applied to any monster has a 50% chance to fail.
- **Frozen Bastion**: Ice casters gain +1 SpeedModifier. Defensive spells reduce +10% extra damage.
- **Inferno Ruins**: Burn effects can stack one additional time. Enemies ignore first tick of DoTs.
- **Thornwild Grove**: Root effects gain +1 duration. Regeneration heals +1 per turn.
- **Ashen Necropolis**: Undead are immune to fear/charm. 10% chance to revive with 20% HP.
- **Crystalline Hollow**: 10% magic damage reflection. Caster enemies gain +1 energy every 2 turns.
- **Sunken Deep**: Melee attacks vs aquatic enemies have -15% accuracy. Enemies below 50% HP gain +1 SpeedModifier.
- **Obsidian Reach**: 20% chance to evade AoE. Shadow cards cost 0 energy, but cause self-debuffs.

---

## 🌋 Floor-Wide Dynamic Events

Dynamic dungeon events are randomly assigned to certain floors to alter combat flow, increase variety, and force adaptive strategy.

### Examples by Biome

- **Fungal Depths – Spore Bloom**: +15% miss chance for 3 turns.
- **Frozen Bastion – Mana Freeze**: Halved energy regen for first 3 turns.
- **Inferno Ruins – Volcanic Eruption**: Random burn every 4 turns.
- **Thornwild Grove – Vine Wrath**: 10% root chance per turn.
- **Ashen Necropolis – Haunting Echoes**: 30% chance for first card each turn to cast twice.
- **Crystalline Hollow – Arcane Overload**: +25% spell damage, 15% fumble risk.
- **Sunken Deep – Crashing Wave**: All frontliners pushed back every 5 turns.
- **Obsidian Reach – Whispers in the Dark**: Random cooldowns increased each round.

Events are shown at the top of the combat UI and may be toggled for added challenge or disabled in standard runs.

---

## 🤖 Combo-Aware Enemy AI

Enemies with combo-aware AI can sequence their actions intelligently, using starter and finisher cards within the same combat window or across units in the same enemy party.

### Features

- Tracks last used card and synergy tags.
- Prioritizes combo finishers if a valid setup occurred within X turns.
- Weighs target selection based on status (e.g., marked, poisoned, stunned).
- Elite groups may share synergy memory for group-wide combos.

### EnemyAIProfile Additions

```csharp
public bool enableComboAwareness;
public int comboWindowTurns = 2;
public bool prefersFinisherChains;
public string[] preferredComboTags;
```

### Sample Chain

- **Turn 1**: Spore Witch casts "Mark Target" (isComboStarter, synergyTag: Execute)
- **Turn 2**: Mushroom Shaman casts "Shadow Execution" (isComboFinisher, synergyTag: Execute)

---

