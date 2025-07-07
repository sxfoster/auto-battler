Weapon Design Document (Weapon GDD)
1. Weapon Techniques
**1.1. Sword Techniques (Balanced | Slashing Damage)**
    * **Abilities:**
        | Rarity    | Ability             | Effect                                   | Energy Cost | Damage Type |
        | :-------- | :------------------ | :--------------------------------------- | :---------- | :---------- |
        | Common    | Slash               | Deal 2 damage.                           | 1           | Slashing    |
        | Uncommon  | Parry               | Block 1 attack and gain +1 defense next turn.| 2           | - (Defense) |
        | Rare      | Swordmaster’s Combo | Deal 3 damage, then draw 1 card.         | 3           | Slashing    |
        | Legendary | Blade Dance         | Deal 4 damage to up to 3 enemies.        | 4           | Slashing    |

**1.2. Axe Techniques (Heavy | Slashing Damage)**
    * **Abilities:**
        | Rarity    | Ability            | Effect                                       | Energy Cost | Damage Type |
        | :-------- | :----------------- | :------------------------------------------- | :---------- | :---------- |
        | Common    | Cleave             | Deal 2 damage to 2 enemies.                  | 1           | Slashing    |
        | Uncommon  | Brutal Swing       | Deal 4 damage, but reduce your speed by 1.   | 2           | Slashing    |
        | Rare      | Reckless Smash     | Deal 5 damage, but take 1 self-damage.       | 3           | Slashing    |
        | Legendary | Executioner’s Axe  | Deal 7 damage, ignores defense.              | 4           | Slashing    |

**1.3. Bow Techniques (Ranged | Piercing Damage)**
    * **Abilities:**
        | Rarity    | Ability            | Effect                                       | Energy Cost | Damage Type |
        | :-------- | :----------------- | :------------------------------------------- | :---------- | :---------- |
        | Common    | Piercing Shot      | Deal 3 damage, bypass 1 defense.             | 1           | Piercing    |
        | Uncommon  | Crippling Arrow    | Deal 2 damage and slow the enemy.            | 2           | Piercing    |
        | Rare      | Volley             | Deal 3 damage to 3 enemies.                  | 3           | Piercing    |
        | Legendary | Hawk’s Eye Barrage | Deal 5 damage to all enemies, cannot miss.   | 4           | Piercing    |

**1.4. Staff Techniques (Support & AoE | Magic Damage)**
    * **Abilities:**
        | Rarity    | Ability          | Effect                                       | Energy Cost | Damage Type |
        | :-------- | :--------------- | :------------------------------------------- | :---------- | :---------- |
        | Common    | Arcane Thrust    | Deal 2 magic damage.                         | 1           | Magic       |
        | Uncommon  | Magic Barrier    | Block the next magic attack on you or an ally.| 2           | - (Defense) |
        | Rare      | Ether Pulse      | Deal 3 damage and steal 1 energy.            | 3           | Magic       |
        | Legendary | Staff of Ruin    | Deal 5 magic damage to all enemies and shock them.| 4           | Magic       |

**1.5. Dagger Techniques (Assassin Style | Piercing Damage + Bleed/Poison Focus)**
    * **Themes:** Fast, single-target burst with Poison/Bleed synergy.
    * **Abilities:**
        | Rarity    | Ability         | Effect                                       | Energy Cost | Damage Type |
        | :-------- | :-------------- | :------------------------------------------- | :---------- | :---------- |
        | Common    | Quick Stab      | Deal 2 damage.                               | 1           | Piercing    |
        | Uncommon  | Poisoned Edge   | Deal 1 damage and apply Poison (1 dmg for 2 turns).| 2           | Piercing    |
        | Rare      | Ambush Strike   | Deal 4 damage, but only if you have evasion active.| 3           | Piercing    |
        | Legendary | Shadowfang      | Deal 5 damage and apply Bleed (1 dmg for 3 turns).| 4           | Piercing    |

**1.6. Spear Techniques (Reach & Control | Piercing Damage + Initiative Manipulation)**
    * **Themes:** Mid-range control; emphasize initiative manipulation and roots.
    * **Abilities:**
        | Rarity    | Ability            | Effect                                       | Energy Cost | Damage Type |
        | :-------- | :----------------- | :------------------------------------------- | :---------- | :---------- |
        | Common    | Piercing Lunge     | Deal 3 damage.                               | 1           | Piercing    |
        | Uncommon  | Disrupting Thrust  | Deal 2 damage and lower target’s speed by 1. | 2           | Piercing    |
        | Rare      | Skewer             | Deal 4 damage and root the target for 1 turn.| 3           | Piercing    |
        | Legendary | Phalanx Breaker    | Deal 5 damage and reduce enemy initiative (move them to the end of the turn order).| 4           | Piercing    |

**1.7. Mace Techniques (Crushing Blows | Bludgeoning Damage + Defense Reduction)**
    * **Themes:** Focus on defense reduction, bludgeoning damage, and stuns.
    * **Abilities:**
        | Rarity    | Ability            | Effect                                       | Energy Cost | Damage Type    |
        | :-------- | :----------------- | :------------------------------------------- | :---------- | :------------- |
        | Common    | Heavy Swing        | Deal 3 damage, but reduce your speed by 1.   | 1           | Bludgeoning    |
        | Uncommon  | Armor Shatter      | Deal 2 damage and reduce enemy defense by 1 for 2 turns.| 2           | Bludgeoning    |
        | Rare      | Earthquake Slam    | Deal 3 damage to all enemies and stun them if they are already slowed.| 3           | Bludgeoning    |
        | Legendary | Skullcrusher       | Deal 6 damage and stun target for 1 turn.    | 4           | Bludgeoning    |

2. Damage Types * Slashing: (Swords, Axes) * Piercing: (Daggers, Spears, Bows) * Bludgeoning: (Maces) * Magic: (Staffs, Spell-like weapon effects)
3. Armor Categories (For reference in effectiveness matrix) * Light Armor (e.g., leather, padded gear) * Medium Armor (e.g., chainmail, studded leather) * Heavy Armor (e.g., plate, tower shield) * Magical Wards (arcane barriers, enchanted robes)
4. Damage Type vs. Armor Effectiveness Matrix | Damage Type | Light Armor | Medium Armor | Heavy Armor | Magical Ward | | :----------- | :----------- | :----------- | :----------- | :------------- | | Slashing | Normal | -1 damage | -2 damage | Normal | | Piercing | +1 damage | Normal | -1 damage | Normal | | Bludgeoning | Normal | +1 damage | +2 damage | Normal | | Magic | Normal | Normal | Normal | -2 damage (if warded)|
* **Interpretation:**
    * **Slashing:** Less effective vs. heavier armor types, balanced against light/medium.
    * **Piercing:** Ideal for light armor users or agile enemies but drops off slightly vs. heavy armor.
    * **Bludgeoning:** Counter to heavy armor, dealing bonus damage to plate-wearers.
    * **Magic:** Ignores most physical resistances but struggles vs. magical defenses (wards).

* **Optional Interaction:**
    * **Critical Hit Boost:** Piercing weapons gain +5% crit chance vs. light armor.
    * **Bludgeoning weapons:** Ignore 1 point of armor vs. all armor types.
