# Game Design Document (GDD)

## 1. Game Overview
- **Title:** [TBD]
- **Genre:** Session-based PvP 'Pack Draft' Auto-Battler
- **Platform:** Digital card game
- **Target Audience:** Strategy and RPG fans, ages 12+
- **Core Concept:** Build a squad by drafting Hero, Weapon, and Ability cards each turn and battle opponents in automated, turn-based combat.

## Prototype Design Pillars
1. **GENRE:** A session-based, PvP "Pack Draft" Auto-Battler.
2. **CORE LOOP:** Each turn, players draft one card each from a Hero Pack, a Weapon Pack, and an Ability Pack. There is no gold or shop.
3. **COMBAT:** Automatic and turn-based, using a Speed stat for turn order. Heroes perform a free "Auto-Attack" by default and spend saved **Energy** to use powerful equipped Abilities.
4. **HEROES:** Class-based "chassis" with innate keywords, specific card slots, and unchangeable AI Personas (e.g., "Squire - Aggressive").
5. **PROGRESSION:** All cards have four Tiers of rarity. Higher Tiers are unlocked in draft packs as the Player Level increases automatically each turn. The four tiers of each Hero Class tell a narrative story.

## 2. Gameplay Mechanics
- **Turn-Based Auto Combat:** Heroes act automatically in order of **Speed**. Each hero performs a free Auto-Attack when it is their turn and spends saved **Energy** to use equipped Abilities.
- **Pack Draft Loop:** Instead of a gold-based shop, players draft one card from a Hero Pack, a Weapon Pack, and an Ability Pack every turn.
- **Hero Chassis:** Classes determine innate keywords, card slots, and an unchangeable AI Persona that guides combat behavior.
- **Progression System:** Player Level increases automatically each turn, unlocking higher Tier cards in the draft packs.

-## 3. Game Components
- **Ability Cards:** Unique to each class, used for attacks, defense, and special effects.
  *Prototype note:* the codebase currently implements only a small set of eleven
  ability cards: Power Strike (3111), Raging Strike (3312), Divine Strike (3211),
  Divine Light (3511), Regrowth (3612), Illusionary Strike (4004), Dissonant
  Chord (3712), Precision Shot (3811), Chaos Bolt (3411), Backstab (4104) and
  Fireball (4201).
- **Item Cards:** Grant temporary buffs, healing, or special actions.
- **Monster Cards:** AI-controlled enemies with varying difficulty levels and attack patterns. Monsters can also be played by players and can take multiple team slots.
- **Player Board:** Tracks health, mana, and other status effects.
- **Dice/RNG Elements (Optional):** Adds an element of chance for critical hits, status effects, or card draws. Initially, the prototype will not include RNG. These elements may be phased in over time for critical hits, status effects, or card draws.

## 4. Class System

### Bard
The Bard uses music and performance to inspire allies and disrupt foes. They excel in a support role, manipulating turn order and providing buffs.
- **Inspiring Tune** – Buffs all allies, increasing attack power for two turns.
- **Dissonant Chord** – Deals minor damage and reduces an enemy’s next attack.
- **Song of Restoration** – Heals an ally over time.
- **Encore** – Allows a player to replay their last action.

#### Bard Builds
*   **Common Bard (Minstrel)**
    *   Stats: HP: Low, Speed: Medium, Role: Support, Base Attack: Low, Base Crit Chance: Low
    *   Abilities:
        *   **Inspiring Tune:** Slightly increases allies' attack.
        *   **Dissonant Chord:** Deals minor damage and slightly reduces enemy attack.
*   **Uncommon Bard (Troubadour)**
    *   Stats: HP: Low-Medium, Speed: Medium-High, Role: Support/Control, Base Attack: Low, Base Crit Chance: Medium-Low
    *   Abilities:
        *   **Song of Restoration:** Heals an ally gradually.
        *   **Quick Tempo:** Grants an ally an extra action.
*   **Rare Bard (Virtuoso)**
    *   Stats: HP: Medium, Speed: High, Role: Advanced Support/Control, Base Attack: Medium-Low, Base Crit Chance: Medium
    *   Abilities:
        *   **Ballad of Courage:** Significantly buffs allies' attack and speed.
        *   **Discordant Blast:** Damages all enemies and reduces their attack.
        *   **Harmony:** Buffs all allies' attack and evasion.
*   **Ultra Rare Bard (Maestro)**
    *   Stats: HP: Medium-High, Speed: Very High, Role: Master Support/Debuffer, Base Attack: Medium, Base Crit Chance: Medium-High
    *   Abilities:
        *   **Crescendo:** Massively buffs allies' attack and grants extra actions.
        *   **Song of Rebirth:** Revives fallen allies.
        *   **Rhythm Shift:** Manipulates turn order to your advantage.

### Barbarian
The Barbarian is a ferocious warrior who thrives in the heat of battle, often sacrificing defense for raw power.
- **Raging Strike** – Deals heavy melee damage but reduces defense.
- **Battle Roar** – Increases attack power for the next two turns.
- **Reckless Charge** – Attacks all enemies but leaves the Barbarian vulnerable.
- **Unbreakable Will** – Prevents defeat for one turn.

#### Barbarian Builds
*   **Common Barbarian (Brute)**
    *   Stats: HP: Medium, Speed: Medium, Role: Melee DPS, Base Attack: Medium, Base Crit Chance: Medium
    *   Abilities:
        *   **Raging Strike:** Deals damage, lowers own defense.
        *   **Reckless Charge:** Damages all enemies, takes self-damage.
*   **Uncommon Barbarian (Raider)**
    *   Stats: HP: Medium-High, Speed: Medium, Role: Melee DPS, Base Attack: Medium-High, Base Crit Chance: Medium
    *   Abilities:
        *   **Battle Roar:** Increases attack power.
        *   **Savage Cleave:** Deals more damage with a kill bonus.
*   **Rare Barbarian (Berserker)**
    *   Stats: HP: High, Speed: Medium-Low, Role: High DPS/Risk-Reward, Base Attack: High, Base Crit Chance: Medium-High
    *   Abilities:
        *   **Unbreakable Will:** Survives a fatal blow.
        *   **Bloodbath:** Damages all enemies, gains attack per enemy hit.
        *   **Last Stand:** Massive damage increase at low HP.
*   **Ultra Rare Barbarian (Warlord)**
    *   Stats: HP: Very High, Speed: Low, Role: Elite Melee DPS/Tank, Base Attack: Very High, Base Crit Chance: High
    *   Abilities:
        *   **Berserker’s Rage:** Sustained high damage and debuff immunity.
        *   **Titan Breaker:** Massive single-target damage, ignores defense.
        *   **Warlord’s Challenge:** Taunts enemies and increases own defense.

### Cleric
The Cleric is a divine agent, focusing on healing allies, providing protection, and smiting evil.
- **Divine Light** – Restores a large amount of health to an ally.
- **Smite Evil** – Deals extra damage to undead or dark creatures.
- **Holy Barrier** – Reduces all incoming damage for one turn.
- **Resurrect** – Revives a fallen ally with partial health.

#### Cleric Builds
*   **Common Cleric (Acolyte)**
    *   Stats: HP: Low-Medium, Speed: Low, Role: Healer, Base Attack: Low, Base Crit Chance: Low
    *   Abilities:
        *   **Divine Light:** Heals an ally.
        *   **Smite Evil:** Deals damage, bonus to undead.
*   **Uncommon Cleric (Priest/Priestess)**
    *   Stats: HP: Medium, Speed: Low-Medium, Role: Healer/Support, Base Attack: Low-Medium, Base Crit Chance: Low
    *   Abilities:
        *   **Holy Barrier:** Reduces damage for all allies.
        *   **Purify:** Removes debuffs and heals.
        *   **Bless:** Buffs allies' attack and evasion.
*   **Rare Cleric (Bishop)**
    *   Stats: HP: Medium-High, Speed: Medium, Role: Advanced Healer/Support, Base Attack: Medium, Base Crit Chance: Medium-Low
    *   Abilities:
        *   **Sacred Shield:** Makes one ally immune to damage for a turn.
        *   **Radiant Wave:** Heals all allies and removes a debuff.
        *   **Judgment:** Damages and reduces enemy defense.
*   **Ultra Rare Cleric (Saint)**
    *   Stats: HP: High, Speed: Medium, Role: Master Healer/Protector, Base Attack: Medium-High, Base Crit Chance: Medium
    *   Abilities:
        *   **Lay on Hands:** Fully heals an ally.
        *   **Resurrect:** Revives a fallen ally.
        *   **Divine Retribution:** Damages all enemies and heals all allies.

### Druid
The Druid channels the power of nature to heal, entangle foes, and shapeshift into powerful beasts.
- **Nature’s Wrath** – Deals damage over time with poison effects.
- **Shapeshift** – Temporarily transforms into a beast, altering abilities.
- **Regrowth** – Gradually heals an ally over time.
- **Entangle** – Roots an enemy in place, preventing their next action.

#### Druid Builds
*   **Common Druid (Initiate)**
    *   Stats: HP: Medium, Speed: Medium, Role: Hybrid DPS/Support, Base Attack: Medium, Base Crit Chance: Low
    *   Abilities:
        *   **Nature’s Wrath:** Deals damage and poisons.
        *   **Regrowth:** Heals an ally over time.
*   **Uncommon Druid (Shapeshifter)**
    *   Stats: HP: Medium, Speed: Medium-High, Role: Hybrid DPS/Control, Base Attack: Medium, Base Crit Chance: Medium-Low
    *   Abilities:
        *   **Entangle:** Roots an enemy.
        *   **Shapeshift – Bear Form:** Gains attack and defense.
        *   **Venom Thorns:** Deals damage and retaliatory poison.
*   **Rare Druid (Guardian of the Wild)**
    *   Stats: HP: Medium-High, Speed: Medium, Role: Advanced Hybrid/Controller, Base Attack: Medium-High, Base Crit Chance: Medium
    *   Abilities:
        *   **Wild Growth:** Heals all allies and grants defense.
        *   **Shapeshift – Wolf Form:** Gains speed and attack.
        *   **Poison Storm:** Poisons all enemies.
        *   **Barkskin:** Reduces damage for all allies.
*   **Ultra Rare Druid (Archdruid)**
    *   Stats: HP: High, Speed: Medium-High, Role: Master Hybrid/Shapeshifter, Base Attack: High, Base Crit Chance: Medium-High
    *   Abilities:
        *   **Avatar of the Wild:** Powerful shapeshift with multiple bonuses.
        *   **Nature’s Renewal:** Mass heal and debuff removal.

### Enchanter
The Enchanter manipulates minds and arcane energies to control the battlefield and deceive enemies.
- **Charm** – Temporarily turns an enemy into an ally.
- **Mind Fog** – Reduces an enemy’s accuracy.
- **Arcane Ward** – Absorbs the next incoming magical attack.
- **Illusionary Strike** – Deals damage and confuses the target.

#### Enchanter Builds
*   **Common Enchanter (Apprentice)**
    *   Stats: HP: Low, Speed: Medium, Role: Control/Debuffer, Base Attack: Low, Base Crit Chance: Low
    *   Abilities:
        *   **Mind Fog:** Reduces enemy accuracy.
        *   **Illusionary Strike:** Deals damage and confuses.
*   **Uncommon Enchanter (Illusionist)**
    *   Stats: HP: Low-Medium, Speed: Medium-High, Role: Control/Debuffer, Base Attack: Low, Base Crit Chance: Medium-Low
    *   Abilities:
        *   **Charm:** Turns an enemy into an ally for one turn.
        *   **Arcane Ward:** Absorbs a magical attack.
        *   **Mirror Image:** Increases evasion.
*   **Rare Enchanter (Mesmerist)**
    *   Stats: HP: Medium, Speed: High, Role: Advanced Control/Disruptor, Base Attack: Medium-Low, Base Crit Chance: Medium
    *   Abilities:
        *   **Mass Suggestion:** Reduces all enemies' attack.
        *   **Dominate Mind:** Controls an enemy for a turn.
        *   **Phantasmal Blades:** Damages all enemies and applies Confusion.
*   **Ultra Rare Enchanter (Archon of Deception)**
    *   Stats: HP: Medium-High, Speed: Very High, Role: Master Controller/Manipulator, Base Attack: Medium, Base Crit Chance: Medium-High
    *   Abilities:
        *   **Master of Illusions:** Creates illusions that negate damage.
        *   **Mass Domination:** Controls all enemies for one turn.
        *   **Warding Sigil:** Grants allies debuff immunity and defense.

### Paladin
The Paladin is a holy warrior, combining martial prowess with divine blessings to protect allies and smite foes.
- **Divine Strike** – Deals holy damage and restores health to the Paladin.
- **Righteous Shield** – Blocks the next attack completely.
- **Lay on Hands** – Fully restores an ally’s health.
- **Judgment** – Deals damage and reduces an enemy’s defense.

#### Paladin Builds
*   **Common Paladin (Crusader)**
    *   Stats: HP: Medium-High, Speed: Low, Role: Tank/Support, Base Attack: Medium, Base Crit Chance: Low
    *   Abilities:
        *   **Divine Strike:** Deals damage and self-heals.
        *   **Holy Light:** Heals an ally.
*   **Uncommon Paladin (Guardian)**
    *   Stats: HP: High, Speed: Low-Medium, Role: Tank/Healer, Base Attack: Medium, Base Crit Chance: Low
    *   Abilities:
        *   **Righteous Shield:** Blocks an attack.
        *   **Judgment:** Damages and reduces enemy defense.
        *   **Aegis Aura:** Reduces incoming damage for allies.
*   **Rare Paladin (Justicar)**
    *   Stats: HP: Very High, Speed: Medium, Role: Advanced Tank/Support, Base Attack: Medium-High, Base Crit Chance: Medium-Low
    *   Abilities:
        *   **Lay on Hands:** Fully heals an ally.
        *   **Radiant Smite:** Deals holy damage and stuns undead/dark enemies.
        *   **Blessing of Valor:** Buffs allies' attack and defense.
*   **Ultra Rare Paladin (Divine Champion)**
    *   Stats: HP: Extremely High, Speed: Medium, Role: Ultimate Tank/Protector, Base Attack: High, Base Crit Chance: Medium
    *   Abilities:
        *   **Divine Intervention:** Makes all allies immune to damage for a turn.
        *   **Light’s Wrath:** Damages all enemies and heals all allies.
        *   **Sacred Vow:** Reduces self-damage and grants debuff immunity.

### Rogue
The Rogue is a master of stealth and subterfuge, striking from the shadows and exploiting enemy weaknesses.
- **Backstab** – Deals double damage if the target is distracted.
- **Smoke Bomb** – Increases evasion for two turns.
- **Poison Blade** – Inflicts damage over time.
- **Shadow Step** – Avoids an attack and gains an extra action.

#### Rogue Builds
*   **Common Rogue (Thief)**
    *   Stats: HP: Low, Speed: High, Role: Melee DPS/Evasion, Base Attack: Medium, Base Crit Chance: Medium-High
    *   Abilities:
        *   **Backstab:** Deals bonus damage to distracted targets.
        *   **Poison Blade:** Deals damage and applies poison.
*   **Uncommon Rogue (Assassin)**
    *   Stats: HP: Low-Medium, Speed: Very High, Role: Melee DPS/Evasion, Base Attack: Medium-High, Base Crit Chance: High
    *   Abilities:
        *   **Smoke Bomb:** Increases evasion.
        *   **Shadow Step:** Avoids an attack and gains an extra action.
        *   **Bleeding Strike:** Deals damage and applies bleed.
*   **Rare Rogue (Shadowblade)**
    *   Stats: HP: Medium, Speed: Extremely High, Role: Advanced DPS/Control, Base Attack: High, Base Crit Chance: Very High
    *   Abilities:
        *   **Ambush:** Deals bonus damage if evasion is active.
        *   **Flurry of Blades:** Damages multiple enemies.
        *   **Deadly Poison:** Applies strong poison to all enemies.
*   **Ultra Rare Rogue (Master of Shadows)**
    *   Stats: HP: Medium-High, Speed: Godlike, Role: Elite DPS/Assassin, Base Attack: Very High, Base Crit Chance: Extremely High
    *   Abilities:
        *   **Assassinate:** Massive single-target damage, bonus to low HP targets.
        *   **Shadow Mastery:** Guaranteed critical hits and evasion boost.
        *   **Cloak of Shadows:** Becomes untargetable and gains speed.

### Ranger
The Ranger is a skilled hunter and tracker, adept with ranged weapons and often accompanied by animal companions.
- **Precision Shot** – Deals high damage to a single enemy.
- **Camouflage** – Increases evasion for the next turn.
- **Multi-Shot** – Hits multiple enemies for moderate damage.
- **Animal Companion** – Summons an ally for temporary assistance.

#### Ranger Builds
*   **Common Ranger (Scout)**
    *   Stats: HP: Medium, Speed: Medium-High, Role: Ranged DPS, Base Attack: Medium, Base Crit Chance: Medium
    *   Abilities:
        *   **Precision Shot:** Deals damage to a single enemy.
        *   **Camouflage:** Increases evasion and next turn speed.
*   **Uncommon Ranger (Hunter)**
    *   Stats: HP: Medium, Speed: High, Role: Ranged DPS/Summoner, Base Attack: Medium-High, Base Crit Chance: Medium-High
    *   Abilities:
        *   **Multi-Shot:** Hits multiple enemies.
        *   **Animal Companion – Wolf:** Summons a wolf.
        *   **Hawk Eye:** Buffs attack and crit chance.
*   **Rare Ranger (Trailblazer)**
    *   Stats: HP: Medium-High, Speed: Very High, Role: Advanced Ranged DPS/Controller, Base Attack: High, Base Crit Chance: High
    *   Abilities:
        *   **Animal Companion – Bear:** Summons a taunting bear.
        *   **Rain of Arrows:** Damages all enemies.
        *   **Trap Mastery:** Sets a trap that damages and roots an enemy.
*   **Ultra Rare Ranger (Beastmaster)**
    *   Stats: HP: High, Speed: Extremely High, Role: Elite Ranged DPS/Summoner, Base Attack: Very High, Base Crit Chance: Very High
    *   Abilities:
        *   **Alpha's Call:** Summons all animal companions (Wolf, Bear, Falcon).
        *   **True Shot:** Massive single-target damage, ignores evasion/armor.
        *   **Animal Companion – Falcon:** Summons a falcon that buffs attack and reveals stealthed enemies.

### Sorcerer
The Sorcerer wields raw, chaotic magic, often with unpredictable but powerful elemental effects.
- **Chaos Bolt** – Deals random elemental damage.
- **Mana Surge** – Restores energy and increases spell damage.
- **Arcane Explosion** – Deals area-of-effect magic damage.
- **Spell Mirror** – Reflects the next magic attack.

#### Sorcerer Builds
*   **Common Sorcerer (Adept)**
    *   Stats: HP: Low, Speed: Medium, Role: Ranged DPS/Elemental, Base Attack: Medium (Spell Power), Base Crit Chance: Low
    *   Abilities:
        *   **Chaos Bolt:** Deals random elemental damage.
        *   **Elemental Spark:** Deals damage and applies a random debuff.
*   **Uncommon Sorcerer (Elementalist)**
    *   Stats: HP: Low-Medium, Speed: Medium, Role: Ranged DPS/Elemental, Base Attack: Medium-High (Spell Power), Base Crit Chance: Medium-Low
    *   Abilities:
        *   **Mana Surge:** Restores energy and buffs spell damage.
        *   **Arcane Explosion:** Deals AoE damage.
        *   **Chain Lightning:** Damages multiple enemies.
*   **Rare Sorcerer (Chaos Mage)**
    *   Stats: HP: Medium, Speed: Medium-High, Role: Advanced Ranged DPS/Controller, Base Attack: High (Spell Power), Base Crit Chance: Medium
    *   Abilities:
        *   **Elemental Infusion:** Buffs elemental spell damage.
        *   **Firestorm:** Deals AoE fire damage and applies burn.
        *   **Spell Mirror:** Reflects a spell.
*   **Ultra Rare Sorcerer (Avatar of Chaos)**
    *   Stats: HP: Medium-High, Speed: High, Role: Elite Ranged DPS/Elemental Master, Base Attack: Very High (Spell Power), Base Crit Chance: Medium-High
    *   Abilities:
        *   **Annihilation Sphere:** Massive AoE damage with random status effects.
        *   **Chaos Mastery:** Enhances spell damage and bypasses elemental resistance.
        *   **Elemental Rift:** Deals damage and roots an enemy.

### Warrior
The Warrior is a stalwart combatant, excelling in direct confrontation and battlefield control. They can specialize in defensive stances or powerful offensive maneuvers.
- **Power Strike** – Deals heavy melee damage.
- **Shield Bash** – Deals minor damage and stuns an enemy.
- **Fortify** – Reduces incoming damage for two turns.
- **Whirlwind Slash** – Attacks all enemies for moderate damage.

#### Warrior Builds
*   **Common Warrior (Squire)**
    *   Stats: HP: Medium, Speed: Medium, Role: Melee DPS/Tank, Base Attack: Medium, Base Crit Chance: Low
    *   Abilities:
        *   **Power Strike:** Deals basic melee damage.
        *   **Fortify:** Slightly reduces incoming damage for 1 turn. (Passive: Takes 1 less damage from attacks)
*   **Uncommon Warrior (Footman)**
    *   Stats: HP: Medium-High, Speed: Medium, Role: Melee DPS/Tank, Base Attack: Medium-High, Base Crit Chance: Low
    *   Abilities:
        *   **Enhanced Power Strike:** Deals moderate melee damage.
        *   **Shield Bash:** Deals low damage and has a chance to Stun for 1 turn. (Strategic: Uses if target not stunned)
        *   **Improved Fortify:** Reduces incoming damage for 2 turns.
*   **Rare Warrior (Knight)**
    *   Stats: HP: High, Speed: Medium-Low, Role: Tank/Control, Base Attack: Medium, Base Crit Chance: Medium
    *   Abilities:
        *   **Mighty Strike:** Deals high melee damage.
        *   **Reliable Shield Bash:** Deals low damage and Stuns for 1 turn.
        *   **Whirlwind Slash:** Deals moderate damage to all enemies.
*   **Ultra Rare Warrior (Champion)**
    *   Stats: HP: Very High, Speed: Low, Role: Elite Tank/DPS, Base Attack: High, Base Crit Chance: Medium-High
    *   Abilities:
        *   **Execute:** Deals massive damage to a single target, especially if they are low health. (Standard attack if Whirlwind conditions not met)
        *   **Whirlwind:** Deals moderate damage to all enemies. (Strategic: Uses if two enemies are alive)
        *   **Juggernaut Charge:** Deals high damage and stuns.

### Wizard
The Wizard is a scholarly spellcaster, mastering precise arcane formulas for devastating effects and battlefield manipulation.
- **Fireball** – Deals magic damage to a single enemy.
- **Ice Storm** – Slows all enemies and deals minor damage.
- **Lightning Bolt** – Has a chance to paralyze an enemy.
- **Time Warp** – Allows the Wizard to take two actions in one turn.

#### Wizard Builds
*   **Common Wizard (Apprentice Mage)**
    *   Stats: HP: Low, Speed: Low, Role: Ranged DPS/Control, Base Attack: Medium (Spell Power), Base Crit Chance: Low
    *   Abilities:
        *   **Fireball:** Deals single-target fire damage.
        *   **Ice Lance:** Deals ice damage and slows.
*   **Uncommon Wizard (Mage)**
    *   Stats: HP: Low-Medium, Speed: Low-Medium, Role: Ranged DPS/Control, Base Attack: Medium-High (Spell Power), Base Crit Chance: Medium-Low
    *   Abilities:
        *   **Lightning Bolt:** Deals lightning damage with a chance to shock.
        *   **Arcane Focus:** Buffs next spell's attack and crit chance.
        *   **Arcane Ward:** Absorbs a magical attack.
*   **Rare Wizard (Archmage)**
    *   Stats: HP: Medium, Speed: Medium, Role: Advanced Ranged DPS/Controller, Base Attack: High (Spell Power), Base Crit Chance: Medium
    *   Abilities:
        *   **Ice Storm:** Deals AoE ice damage and slows all enemies.
        *   **Time Warp:** Takes two actions next turn.
        *   **Arcane Explosion:** Deals AoE magic damage.
*   **Ultra Rare Wizard (Grand Magus)**
    *   Stats: HP: Medium-High, Speed: Medium-High, Role: Elite Ranged DPS/Time Manipulator, Base Attack: Very High (Spell Power), Base Crit Chance: Medium-High
    *   Abilities:
        *   **Temporal Mastery:** Gains extra actions and stun/slow immunity for several turns.
        *   **Elemental Convergence:** Massive multi-elemental AoE damage.
        *   **Mana Drain:** Steals energy from an enemy.

## 5. Battle System
- **Initiative System:** Determines turn order based on agility or dice rolls.
- **Card Phases:** Draw phase, action phase (play cards), and resolution phase.
- **Victory Conditions:** Defeat all enemies or fulfill specific battle objectives.
- **Failure Conditions:** Lose all HP or fail objectives.

## 6. Progression & Rewards
- **Experience Points (XP):** Earned from battles, unlocking new abilities.
- **New Cards:** Gained from loot drops, shops, or leveling up.
- **Equipment System:** Equippable gear that provides passive bonuses.

## 7. Multiplayer & Cooperative Play (Optional)
- **PvE Co-op:** Team up against stronger AI-controlled bosses.
- **PvP Duels:** Test decks against other players in strategic battles.
- **PvP Tournament:** A structured 1v1 competitive mode with weekly/daily schedules, XP and bonus card rewards for high-ranking players.

## 8. Art & Theme
- **Art Style:** Fantasy-themed, with detailed illustrations for each card, drawing inspiration from *Delicious in Dungeon*'s unique blend of fantasy and resourcefulness.
- **Story Setting:** A mystical world where adventurers battle legendary creatures for power and treasure. A mystical world where adventurers manage a party of heroes, battling creatures and navigating survival challenges within dungeon ecosystems.

## 9. Monetization (For Digital Version)
- **Expansion Packs:** New classes, cards, and monsters.
- **Cosmetic Items:** Alternate card designs, themes, and effects.
- **Battle Pass (Optional):** Seasonal rewards and progression system.

## 10. Development Roadmap
- **Prototype Development:** Create basic card mechanics and battle system, focusing on core energy and survival mechanics, and AI player personas.
- **Playtesting:** Gather feedback and balance card abilities.
- **Art & Design:** Develop card visuals and UI elements.
- **Final Release:** Launch digital version.

## 11. Monster Card System
For detailed information on Monster Archetypes, Abilities, Traits, and Items, please refer to the separate **Monster Design Document (Monster GDD)**.

## 12. Item System
For detailed information on Item Tiers and specific Item Lists, please refer to the separate **Item Design Document (Item GDD)**.

## 13. Armor System
For detailed information on Armor Categories, Abilities, Synergy, Drop Rates, and Crafting, please refer to the separate **Armor Design Document (Armor GDD)**.

## 14. Weapon System
For detailed information on Weapon Techniques, Damage Types, and Effectiveness against Armor, please refer to the separate **Weapon Design Document (Weapon GDD)**.

## 15. UI/UX Elements
For detailed information on the Card Tooltip Layout, please refer to the separate **UI/UX Design Document**.

## 16. Game Modes
For detailed information on the PvP Tournament Flowchart with XP System and PvP Stat Framework, please refer to the separate **Game Modes Design Document**.

## 17. Game Mechanics - Status Effects
For detailed information on Core Status Conditions, Buff Keywords, and Debuff Keywords, please refer to the separate **Game Mechanics Design Document - Status Effects**.

## 18. Progression & Economy
For detailed information on Deck Size Progression, Card Power Curves, and Loot Distribution, please refer to the separate **[Progression & Economy Design Document](progression_economy_gdd.md)**.

## 19. Auto-Battle Scene
### Scene Layout
- The scene is split into two sides: Player team on the left, Enemy team on the right.
- Heroes on each side are arranged in a vertical column (top and bottom positions).
- A Battle Log is displayed at the bottom of the screen to show turn-by-turn actions.
- A "Speed Control" button is present at the top-center of the screen.
- In the Discord bot version the battle log is streamed live by editing a single message every few seconds.

### Team Generation
- The Player's team consists of the 2 heroes and 2 weapons they drafted.
- The Enemy's team is generated randomly, consisting of 2 heroes and 2 weapons from the master list.

### Combat Mechanics & Rules
**Turn Order:**
The battle follows a fixed, repeating loop:
1.  Player Hero 1 (Top Position)
2.  Enemy Hero 1 (Top Position)
3.  Player Hero 2 (Bottom Position)
4.  Enemy Hero 2 (Bottom Position)

**Targeting Logic:**
An attacking hero will always target the highest-position (top-most) enemy hero that has health remaining.

**Damage Calculation:**
A hero's basic attack damage is calculated as: (Hero's Base Attack Stat) + (Equipped Weapon's Damage Bonus).

#### Speed Control
The UI button cycles through three speeds in the following order: 1x -> 2x -> 0.5x. The default speed is 1x.

#### Status Effects
*   **Stun:** A stunned hero skips their next attack turn completely. (Duration: 1 turn)
*   **Poison:** A poisoned hero takes damage at the start of their turn. The damage is equal to 10% of the original attacker's base Attack stat (rounded up). The poison effect lasts for a random duration of 2 to 4 turns.

#### Hero & Weapon Ability Logic
*   **Fortify (Squire):** Passive ability. The hero takes 1 less damage from all incoming attacks.
*   **Shield Bash (Warrior):** Strategic ability. If the Warrior's target is NOT currently stunned, the Warrior will use Shield Bash instead of a normal attack. This ability deals 1 damage and applies Stun for 1 turn.
*   **Whirlwind (Champion):** Strategic ability. If there are two enemies alive, the Champion will use Whirlwind instead of a normal attack. It deals 4 damage to all living enemies.
*   **Execute (Champion):** This is the Champion's standard single-target attack when Whirlwind conditions are not met. It deals a flat 10 damage.
*   **Cleave (Iron Sword):** When a hero with this weapon attacks a primary target, the other living enemy takes 50% of the primary attack's damage.
*   **Fireball (Mage Staff):** The hero's basic attack becomes Fireball. Its damage is calculated using the standard formula (Hero Attack + Weapon Damage).
*   **Poison Tip (Glimmering Dagger):** On a successful basic attack, there is a 10% chance to apply the Poison status effect.

**Victory/Defeat Conditions:**
*   **Victory:** Achieved when both enemy heroes have 0 HP.
*   **Defeat:** Occurs when both player heroes have 0 HP.
*   The end screen displays a "VICTORY" or "DEFEAT" message, shows the final state of the player's team, and includes a "Play Again" button that restarts the entire application flow.
