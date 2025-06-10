# Class & Card Design Document (Class GDD)

## 1. Class & Keyword Specialization

### 1.1. Warrior
* **Specializes in:**
    * Stun (Shield Bash, Juggernaut Charge)
    * Defense Boost (Fortify)
    * Extra Action (Relentless Pursuit)

### 1.2. Bard
* **Specializes in:**
    * Attack Boost (Inspiring Tune, Battle Roar)
    * Speed Boost (Quick Tempo)
    * Evasion Boost (Harmony)
    * Extra Action (Encore)

### 1.3. Barbarian
* **Specializes in:**
    * Bleed (Savage Cleave)
    * Attack Boost (Battle Roar, Last Stand)
    * Taunt (Warlord’s Challenge)
    * Vulnerable (via Reckless Charge’s self-debuffs)

### 1.4. Cleric
* **Specializes in:**
    * Healing (Divine Light, Radiant Wave)
    * Defense Boost (Holy Barrier, Sacred Shield)
    * Attack Down (Judgment)
    * Resurrection (Lay on Hands, Resurrect)

### 1.5. Druid
* **Specializes in:**
    * Poison (Nature’s Wrath, Poison Storm)
    * Root (Entangle)
    * Regeneration (Regrowth, Wild Growth)
    * Defense Boost (Barkskin)

### 1.6. Enchanter
* **Specializes in:**
    * Charm / Mind Control (Charm, Dominate Mind)
    * Confuse (Illusionary Strike, Phantasmal Blades)
    * Evasion Boost (Mirror Image)
    * Attack Down (Mass Suggestion)

### 1.7. Paladin
* **Specializes in:**
    * Defense Boost (Sacred Vow, Aegis Aura)
    * Healing (Holy Light, Lay on Hands)
    * Damage Mitigation / Immunity (Divine Intervention)
    * Anti-Undead Bonus (Judgment, Radiant Smite)

### 1.8. Rogue
* **Specializes in:**
    * Poison (Poison Blade, Deadly Poison)
    * Bleed (Bleeding Strike)
    * Evasion Boost (Smoke Bomb, Shadow Step)
    * Critical Hits (Shadow Mastery)

### 1.9. Ranger
* **Specializes in:**
    * Evasion Boost (Camouflage)
    * Root (Trap Mastery)
    * Summons (Animal Companions)
    * Multi-Target Damage (Multi-Shot, Rain of Arrows)

### 1.10. Sorcerer
* **Specializes in:**
    * Burn (Firestorm)
    * Shock (Chain Lightning)
    * Attack Down (via elemental debuffs)
    * AoE Damage (Arcane Explosion, Annihilation Sphere)

### 1.11. Wizard
* **Specializes in:**
    * Slow (Ice Storm, Ice Lance)
    * Shock (Lightning Bolt)
    * Time Manipulation (Time Warp, Temporal Mastery)
    * Arcane Buffs (Arcane Focus)

## 2. Class Ability Decks

### 2.1. Bard Class Ability Deck
* **Primary Role:** Support/control hybrid
* **Strengths:** Buffing allies, manipulating initiative, minor AoE damage/debuffs
* **Weaknesses:** Lower direct damage output compared to melee classes like Warrior
* **Common Abilities (1 Energy each):**
    * **Inspiring Tune:** All allies gain +1 attack for 2 turns.
    * **Dissonant Chord:** Deal 1 damage and reduce the enemy’s attack by 1 next turn.
    * **Quick Tempo:** Choose an ally: they may immediately take 1 extra action.
* **Uncommon Abilities (2 Energy each):**
    * **Song of Restoration:** Heal an ally for 3 HP per turn over 2 turns.
    * **Encore:** Replay your last Bard ability.
    * **Harmony:** Buff all allies: +1 attack and +1 evasion for 1 turn.
* **Rare Abilities (3 Energy each):**
    * **Ballad of Courage:** All allies gain +2 attack and +2 speed for 2 turns.
    * **Discordant Blast:** Deal 2 damage to all enemies and reduce their attack by 1 for 1 turn.
    * **Rhythm Shift:** Swap turn order: You or an ally moves to the top of the initiative queue.
* **Legendary Abilities (4 Energy each):**
    * **Crescendo:** All allies gain +3 attack and take an immediate action.
    * **Song of Rebirth:** Revive all fallen allies at 50% HP.

### 2.2. Barbarian Class Ability Deck
* **Primary Role:** High damage dealer with self-sacrifice mechanics
* **Strengths:** AoE attacks, strong offensive buffs, "last-stand" style effects
* **Weaknesses:** Frequently lowers own defenses or health for extra power
* **Common Abilities (1 Energy each):**
    * **Raging Strike:** Deal 3 damage, but reduce your defense by 1 until next turn.
    * **Battle Roar:** Gain +2 attack for 2 turns.
    * **Reckless Charge:** Deal 2 damage to all enemies, but you take 1 self-damage.
* **Uncommon Abilities (2 Energy each):**
    * **Unbreakable Will:** Prevent defeat if your HP would drop to 0 this turn (survive with 1 HP).
    * **Savage Cleave:** Deal 4 damage to one enemy. If you kill them, gain +1 attack on your next action.
    * **Frenzied Defense:** Take -2 damage reduction this turn and deal 2 damage back when attacked.
* **Rare Abilities (3 Energy each):**
    * **Bloodbath:** Deal 3 damage to all enemies. For each enemy hit, gain +1 attack next turn.
    * **Last Stand:** If under 50% HP, all attacks this turn deal double damage.
    * **Warlord’s Challenge:** Force all enemies to target you next turn and gain +2 defense.
* **Legendary Abilities (4 Energy each):**
    * **Berserker’s Rage:** For 2 turns, all attacks deal +2 damage and you cannot be stunned or debuffed.
    * **Titan Breaker:** Deal 7 damage to a single enemy and ignore all their defenses/armor.

### 2.3. Cleric Class Ability Deck
* **Primary Role:** Dedicated support and healer
* **Strengths:** Powerful group healing, protective buffs, undead-slaying damage
* **Weaknesses:** Lower direct damage output, but excels at sustain and utility
* **Common Abilities (1 Energy each):**
    * **Divine Light:** Heal an ally for 4 HP.
    * **Smite Evil:** Deal 2 damage (or 4 damage to undead/dark enemies).
    * **Holy Barrier:** Reduce all damage taken by all allies by 1 this turn.
* **Uncommon Abilities (2 Energy each):**
    * **Bless:** All allies gain +1 attack and +1 evasion for 2 turns.
    * **Purify:** Remove all negative status effects from an ally and heal 3 HP.
    * **Sacred Shield:** One ally becomes immune to damage this turn.
* **Rare Abilities (3 Energy each):**
    * **Judgment:** Deal 3 damage and reduce the enemy’s defense by 1 for 2 turns.
    * **Radiant Wave:** Heal all allies for 3 HP and remove 1 debuff from each.
    * **Divine Retribution:** Deal 3 damage to all enemies and heal all allies for 2 HP.
* **Legendary Abilities (4 Energy each):**
    * **Lay on Hands:** Fully restore one ally’s HP.
    * **Resurrect:** Revive a fallen ally at 50% HP and remove all debuffs from them.

### 2.4. Druid Class Ability Deck
* **Primary Role:** Hybrid support and damage-over-time controller
* **Strengths:** Poison damage, healing over time, shapeshift buffs, crowd control
* **Weaknesses:** Lower burst damage; relies on time-based effects and planning
* **Common Abilities (1 Energy each):**
    * **Nature’s Wrath:** Deal 1 damage and inflict Poison (1 damage per turn for 2 turns).
    * **Regrowth:** Heal an ally for 2 HP per turn over 3 turns.
    * **Entangle:** Root an enemy: they cannot act next turn.
* **Uncommon Abilities (2 Energy each):**
    * **Wild Growth:** Heal all allies for 2 HP and give +1 defense for 1 turn.
    * **Shapeshift – Bear Form:** Gain +2 attack and +2 defense for 2 turns, then revert.
    * **Venom Thorns:** Deal 2 damage, and if enemy attacks next turn, they take 2 poison damage.
* **Rare Abilities (3 Energy each):**
    * **Shapeshift – Wolf Form:** Gain +2 speed and +1 attack for 3 turns, then revert.
    * **Poison Storm:** Deal 1 damage to all enemies and Poison them for 2 turns.
    * **Barkskin:** All allies reduce damage by 2 for 1 turn.
* **Legendary Abilities (4 Energy each):**
    * **Avatar of the Wild:** Shapeshift into Avatar Form for 3 turns: Gain +2 attack, +2 defense, and Poison immunity. All attacks Poison enemies for 2 turns.
    * **Nature’s Renewal:** Heal all allies for 6 HP and remove all debuffs.

### 2.5. Enchanter Class Ability Deck
* **Primary Role:** Control and disruption specialist
* **Strengths:** Mind control, debuffs, illusions, battlefield manipulation
* **Weaknesses:** Minimal raw damage; relies heavily on controlling the enemy’s actions
* **Common Abilities (1 Energy each):**
    * **Charm:** Temporarily turn an enemy into an ally for 1 turn.
    * **Mind Fog:** Reduce an enemy’s accuracy by 50% for 2 turns.
    * **Illusionary Strike:** Deal 2 damage and confuse the target (50% chance they miss their next action).
* **Uncommon Abilities (2 Energy each):**
    * **Arcane Ward:** Absorb the next magical attack targeting you or an ally.
    * **Mass Suggestion:** Reduce all enemies’ attack by 1 for 2 turns.
    * **Mirror Image:** Create an illusion, giving you +2 evasion for 2 turns.
* **Rare Abilities (3 Energy each):**
    * **Dominate Mind:** Take control of an enemy for 1 full turn (they attack for you).
    * **Phantasmal Blades:** Deal 2 damage to all enemies and apply Confusion (50% miss chance) for 1 turn.
    * **Warding Sigil:** Allies gain immunity to debuffs and +1 defense for 2 turns.
* **Legendary Abilities (4 Energy each):**
    * **Master of Illusions:** For 2 turns, you create 2 illusions: When attacked, you or your illusions can completely negate damage (2 charges).
    * **Mass Domination:** Take control of all enemies for 1 turn (they attack themselves or their allies).

### 2.6. Paladin Class Ability Deck
* **Primary Role:** Tank/healer hybrid
* **Strengths:** Strong defensive buffs, team healing, anti-undead abilities
* **Weaknesses:** Slower playstyle, less focus on burst damage
* **Common Abilities (1 Energy each):**
    * **Divine Strike:** Deal 2 damage and heal yourself for 2 HP.
    * **Righteous Shield:** Block the next attack completely.
    * **Holy Light:** Heal an ally for 4 HP.
* **Uncommon Abilities (2 Energy each):**
    * **Judgment:** Deal 3 damage and reduce the enemy’s defense by 1 for 2 turns.
    * **Blessing of Valor:** All allies gain +1 attack and +1 defense for 2 turns.
    * **Aegis Aura:** All allies reduce incoming damage by 1 for 2 turns.
* **Rare Abilities (3 Energy each):**
    * **Lay on Hands:** Fully heal one ally to max HP.
    * **Radiant Smite:** Deal 4 holy damage and stun the enemy if they are undead/dark-aligned.
    * **Sacred Vow:** You take half damage and cannot be debuffed for 2 turns.
* **Legendary Abilities (4 Energy each):**
    * **Divine Intervention:** Prevent all allies from taking damage this turn (total immunity).
    * **Light’s Wrath:** Deal 5 holy damage to all enemies and heal all allies for 5 HP.

### 2.7. Rogue Class Ability Deck
* **Primary Role:** Burst damage and evasion specialist
* **Strengths:** High single-target damage, poisons, turn manipulation
* **Weaknesses:** Fragile when caught out, reliant on evasion and positioning
* **Common Abilities (1 Energy each):**
    * **Backstab:** Deal 2 damage, or 4 damage if the enemy is stunned or distracted.
    * **Smoke Bomb:** Gain +2 evasion for 2 turns.
    * **Poison Blade:** Deal 1 damage and apply Poison (1 damage per turn for 3 turns).
* **Uncommon Abilities (2 Energy each):**
    * **Shadow Step:** Avoid the next attack and gain +1 extra action this turn.
    * **Bleeding Strike:** Deal 3 damage and apply Bleed (1 damage per turn for 2 turns).
    * **Ambush:** Deal 3 damage, or 5 damage if you have evasion active.
* **Rare Abilities (3 Energy each):**
    * **Flurry of Blades:** Deal 2 damage to 3 enemies (total 6 damage).
    * **Deadly Poison:** Apply Poison (2 damage per turn for 3 turns) to all enemies.
    * **Cloak of Shadows:** Become untargetable until your next turn and gain +1 speed.
* **Legendary Abilities (4 Energy each):**
    * **Assassinate:** Instantly deal 7 damage to one enemy. If the target is below 50% HP, deal 9 damage instead.
    * **Shadow Mastery:** For 2 turns, all attacks are guaranteed critical hits and you gain evasion +2.

### 2.8. Ranger Class Ability Deck
* **Primary Role:** Ranged AoE and single-target DPS hybrid
* **Strengths:** Versatile toolkit (damage, evasion, animal companions), battlefield control
* **Weaknesses:** Less direct healing or heavy defense, relies on positioning and companions
* **Common Abilities (1 Energy each):**
    * **Precision Shot:** Deal 3 damage to a single enemy.
    * **Camouflage:** Gain +2 evasion for 1 turn and +1 speed next turn.
    * **Animal Companion – Wolf:** Summon a Wolf that deals 2 damage and lasts for 1 turn.
* **Uncommon Abilities (2 Energy each):**
    * **Multi-Shot:** Deal 2 damage to up to 3 enemies (can spread or focus).
    * **Hawk Eye:** Gain +1 attack and +1 crit chance for 2 turns.
    * **Animal Companion – Bear:** Summon a Bear that deals 3 damage and taunts enemies (forces them to target the bear) for 1 turn.
* **Rare Abilities (3 Energy each):**
    * **Rain of Arrows:** Deal 3 damage to all enemies.
    * **Trap Mastery:** Set a trap: the next enemy to attack you takes 4 damage and is rooted (can’t act next turn).
    * **Animal Companion – Falcon:** Summon a Falcon that grants +1 attack and reveals hidden enemies (ignores stealth effects) for 2 turns.
* **Legendary Abilities (4 Energy each):**
    * **Alpha's Call:** Summon all 3 animal companions (Wolf, Bear, Falcon) simultaneously.
    * **True Shot:** Deal 7 damage to one enemy, ignoring evasion and armor.

### 2.9. Sorcerer Class Ability Deck
* **Primary Role:** AoE and elemental damage powerhouse
* **Strengths:** Randomized elemental damage, high mana regeneration, wide-area control
* **Weaknesses:** Unpredictable damage types, moderate survivability
* **Common Abilities (1 Energy each):**
    * **Chaos Bolt:** Deal 3 damage of a random elemental type (fire, ice, lightning).
    * **Mana Surge:** Restore 2 energy/mana and gain +1 attack for spells this turn.
    * **Elemental Spark:** Deal 2 damage and apply a random debuff (burn, slow, or shock).
* **Uncommon Abilities (2 Energy each):**
    * **Arcane Explosion:** Deal 2 damage to all enemies.
    * **Elemental Infusion:** All spells deal +1 damage for 2 turns.
    * **Chain Lightning:** Deal 3 lightning damage to one enemy and 2 damage to a second nearby enemy.
* **Rare Abilities (3 Energy each):**
    * **Firestorm:** Deal 3 fire damage to all enemies and apply Burn (1 damage per turn for 2 turns).
    * **Elemental Rift:** Deal 4 damage of a random element to one enemy and root them for 1 turn.
    * **Spell Mirror:** Reflect the next magical attack back at the caster.
* **Legendary Abilities (4 Energy each):**
    * **Annihilation Sphere:** Deal 5 damage to all enemies and apply a random status (Burn, Shock, Freeze, or Weakness) to each.
    * **Chaos Mastery:** For 3 turns, your spells deal +2 damage, and enemies cannot resist or block elemental damage.

### 2.10. Warrior Class Ability Deck (Revised)
* **Primary Role:** Tank/Heavy DPS (Implied from abilities)
* **Strengths:** Stuns, defense buffs, burst damage under certain conditions (Implied from abilities)
* **Weaknesses:** Potentially self-damaging or conditional power spikes (Implied from abilities)
* **Common Abilities (1 Energy each):**
    * **Power Strike:** Deal 2 damage to one enemy.
    * **Shield Bash:** Deal 1 damage and stun the enemy for 1 turn.
    * **Fortify:** Reduce all incoming damage by 1 for 2 turns.
* **Uncommon Abilities (2 Energy each):**
    * **Crippling Blow:** Deal 3 damage and reduce the enemy’s attack by 1 next turn.
    * **Parry & Riposte:** Block next attack; if successful, counterattack for 2 damage.
    * **Battle Roar:** Gain +2 attack on your next attack.
* **Rare Abilities (3 Energy each):**
    * **Whirlwind Slash:** Deal 2 damage to all enemies.
    * **Blood Frenzy:** If under 50% HP, gain +2 attacks this turn.
    * **Relentless Pursuit:** Deal 3 damage and take an extra action if this kills the target.
* **Legendary Abilities (4 Energy each):**
    * **Juggernaut Charge:** Deal 5 damage to one enemy and stun for 1 turn.
    * **Champion’s Wrath:** Deal 4 damage to all enemies. If you KO at least 1 enemy, gain another full turn immediately.

### 2.11. Wizard Class Ability Deck
* **Primary Role:** Spellcaster specializing in control and burst damage
* **Strengths:** Powerful single-target and AoE spells, speed manipulation, time-bending effects
* **Weaknesses:** Relatively fragile, requires smart positioning and resource management
* **Common Abilities (1 Energy each):**
    * **Fireball:** Deal 3 fire damage to a single enemy.
    * **Ice Lance:** Deal 2 ice damage and slow the enemy (reduce speed by 1 for 2 turns).
    * **Arcane Focus:** Gain +1 attack and +1 crit chance for your next spell.
* **Uncommon Abilities (2 Energy each):**
    * **Lightning Bolt:** Deal 3 lightning damage and shock (50% chance to miss next action).
    * **Ice Storm:** Deal 2 ice damage to all enemies and slow them for 1 turn.
    * **Arcane Ward:** Absorb the next incoming magical attack.
* **Rare Abilities (3 Energy each):**
    * **Time Warp:** Take 2 actions during your next turn.
    * **Arcane Explosion:** Deal 4 magic damage to all enemies.
    * **Mana Drain:** Steal 2 energy/mana from an enemy and restore it to yourself.
* **Legendary Abilities (4 Energy each):**
    * **Temporal Mastery:** For 3 turns, you gain +1 action each turn and cannot be slowed or stunned.
    * **Elemental Convergence:** Deal 5 fire, 5 ice, and 5 lightning damage to all enemies (split between elements).
