# Monster Design Document (Monster GDD)

## 1. Monster Card System Overview

### Monster Concept
- Players can choose to play as a Monster instead of a traditional champion.
- Monsters have unique Monster Ability Decks that mirror class decks.
- Monster decks will feature monstrous traits, brutal attacks, and unique status effects (e.g., fear, disease, corruption).

### Monster Deck Structure
Like champions, monsters will build decks from:
- Monster Abilities (core attacks & powers)
- Monster Traits (passive abilities, e.g., regeneration, armor scales)
- Monster Items (optional, cursed artifacts, etc.)

### Balanced Design Approach
To ensure monsters are balanced against classes, we’ll:
- Ensure monsters follow the same 6-card deck cap system.
- Apply the same energy cost structure (Common = 1 energy, Legendary = 4 energy).
- Assign roles to monsters (e.g., brute, controller, support) just like player classes.

## 2. Monster Archetypes

### 2.1. Monster Archetype: Blood Witch (Dark Support / Curses)
- **Role:** A cursed spellcaster who excels at self-healing, cursing enemies, and supporting allies with dark magic.
- **Common Abilities (1 Energy each):**
    - **Blood Leech:** Deal 2 damage and heal 2 HP.
    - **Hex:** Apply -1 attack to an enemy for 2 turns.
    - **Dark Pact:** Sacrifice 1 HP to gain +1 energy.
    - **Blood Mist:** Fear an enemy (-1 attack) and gain +1 evasion this turn.
    - **Necrotic Touch:** Deal 2 damage and apply Poison (1 dmg/turn for 2 turns).
- **Uncommon Abilities (2 Energy each):**
    - **Sanguine Ritual:** Heal 4 HP and grant an ally +1 attack for 2 turns.
    - **Curse of Weakness:** Apply -2 attack to all enemies for 1 turn.
    - **Hemorrhage:** Deal 3 damage and apply Bleed (1 dmg/turn for 3 turns).
    - **Vile Empowerment:** Heal 5 HP, but take 1 self-damage per turn for 2 turns.
    - **Shadow Blood:** Heal 2 HP and gain +1 evasion for 2 turns.
- **Rare Abilities (3 Energy each):**
    - **Bloodstorm:** Deal 2 damage to all enemies and heal 1 HP for each enemy hit.
    - **Cursed Ground:** Enemies in an AoE take 1 damage/turn and have -1 speed for 2 turns.
    - **Sanguine Ward:** All allies reduce damage by 1 and heal 2 HP this turn.
    - **Life Siphon:** Deal 4 damage and heal 4 HP.
    - **Blood Moon Ritual:** Apply Fear and Bleed to all enemies for 2 turns.
- **Legendary Abilities (4 Energy each):**
    - **Crimson Ascension:** For 2 turns, all damage dealt by you heals you for full damage.
    - **Plague of Shadows:** Deal 5 damage to all enemies and apply Fear for 2 turns.
    - **Blood Curse:** Mark an enemy: they take +2 bonus damage from all sources for 2 turns.
    - **Dark Vow:** Sacrifice 5 HP to gain +3 energy and +2 attack this turn.
    - **Ritual of Eternal Hunger:** Revive at 1 HP after death and immediately heal 5 HP.
- **Playstyle Summary:** Hybrid support and self-sustaining debuffer. Can keep herself and allies alive while weakening the enemy’s offense with Fear and attack debuffs. Counters burst-heavy classes like Barbarian or Rogue by weakening their attack.

### 2.2. Monster Archetype: Brute (Tank / Heavy DPS)
- **Role:** Frontline bruiser with stuns, armor breaks, and high raw damage.
- **Common Abilities (1 Energy each):**
    - **Bonecrusher Slam:** Deal 3 damage and stun the enemy for 1 turn.
    - **Overpower:** Deal 2 damage and reduce target’s attack by 1 for 1 turn.
    - **Savage Swipe:** Deal 2 damage to 2 enemies.
    - **Thick Hide:** Gain +2 defense for 1 turn.
    - **Battle Roar:** All enemies gain -1 attack next turn.
- **Uncommon Abilities (2 Energy each):**
    - **Unstoppable Rage:** Gain +2 attack and +2 defense for 1 turn.
    - **Earthshaker Stomp:** Stun all enemies if they have already been slowed or rooted.
    - **Reckless Smash:** Deal 4 damage but take 1 self-damage.
    - **Crushing Grasp:** Deal 2 damage and root the target for 1 turn.
    - **Roar of Defiance:** Gain +1 energy and +1 defense this turn.
- **Rare Abilities (3 Energy each):**
    - **Shatter Armor:** Deal 4 damage and reduce the target’s defense by 1 for 2 turns.
    - **Titanic Charge:** Deal 5 damage, bypasses 1 armor, and pushes the enemy to the end of initiative.
    - **Unbreakable:** Prevent defeat this turn (stay at 1 HP minimum).
    - **Seismic Slam:** Deal 3 damage to all enemies and slow them for 1 turn.
    - **Flesh Rend:** Deal 4 damage and apply Bleed (1 dmg/turn for 3 turns).
- **Legendary Abilities (4 Energy each):**
    - **Worldbreaker’s Wrath:** Deal 7 damage to one enemy and stun them for 2 turns.
    - **Colossal Fortitude:** Reduce all incoming damage to 0 this turn and heal 5 HP.
    - **Savage Earthquake:** Deal 5 damage to all enemies and apply Vulnerable (+1 damage taken) for 2 turns.
    - **Blood Frenzy:** If below 50% HP, gain +3 attack for 2 turns.
    - **Ironhide Regeneration:** Heal 10 HP over 2 turns and gain +1 defense during the duration.
- **Playstyle Summary:** Specializes in stuns, AoE slows, and damage reduction. Brute decks will naturally counter glass cannon or evasion-based classes like Rogues or Sorcerers. Has multiple ways to control initiative and dominate the front line.

### 2.3. Monster Archetype: Frost Revenant (Crowd Control / Ice & Debuff)
- **Role:** A cold-hearted controller who excels at slows, roots, and ice-based AoE effects to freeze enemies in place.
- **Common Abilities (1 Energy each):**
    - **Icy Touch:** Deal 2 damage and Slow the target by 1 speed for 1 turn.
    - **Frozen Grasp:** Root a target for 1 turn.
    - **Chillwind Strike:** Deal 2 damage and apply -1 attack for 1 turn.
    - **Ice Barrier:** Reduce damage by 2 this turn and Slow attackers by 1 speed.
    - **Hail Shard:** Deal 1 damage to all enemies and Slow them for 1 turn.
- **Uncommon Abilities (2 Energy each):**
    - **Glacial Spikes:** Deal 3 damage to 2 enemies and apply Slow for 1 turn.
    - **Frozen Aura:** Enemies that end their turn adjacent to you suffer -1 speed next round.
    - **Permafrost Cage:** Root one enemy for 2 turns.
    - **Chilling Veil:** Gain +2 defense for 2 turns and attackers are Slowed.
    - **Hoarfrost Shroud:** Slow all enemies by 2 speed this turn.
- **Rare Abilities (3 Energy each):**
    - **Ice Storm:** Deal 3 damage to all enemies and Slow them for 2 turns.
    - **Frozen Pulse:** Deal 4 damage and Stun the target if they are Slowed.
    - **Eternal Winter:** Apply Slow and -1 defense to all enemies for 2 turns.
    - **Shatter Strike:** Deal 5 damage to a rooted or stunned enemy.
    - **Icebound Fortitude:** Reduce damage by 3 for 2 turns, immune to Roots and Slows.
- **Legendary Abilities (4 Energy each):**
    - **Blizzard’s Wrath:** Deal 5 damage to all enemies and apply Root to all Slowed enemies.
    - **Frozen Grave:** Root all enemies for 2 turns and apply Vulnerable (+1 damage taken).
    - **Absolute Zero:** Deal 6 damage and Stun an enemy for 2 turns (requires them to be Slowed).
    - **Frozen Dominion:** For 2 turns, Slow all enemies by 2 speed and your attacks deal +2 damage.
    - **Tomb of Ice:** Encases a target in ice: they skip their next 2 actions but take no damage until freed.
- **Playstyle Summary:** Focused on initiative control, root-locking enemies, and slow stacking for combo plays. Excels at shutting down high-speed classes like Rangers and Rogues.

### 2.4. Monster Archetype: Grave Titan (Tank / Siege)
- **Role:** A massive juggernaut that focuses on damage soak, area control, and crushing physical blows.
- **Common Abilities (1 Energy each):**
    - **Titanic Slam:** Deal 2 damage and stun the target if they have already acted this turn.
    - **Stonehide:** Reduce damage by 2 this turn.
    - **Crushing Blow:** Deal 3 damage to a single target.
    - **Imposing Presence:** Enemies targeting you deal -1 damage this turn.
    - **Gravequake:** Deal 1 damage to all enemies and slow them for 1 turn.
- **Uncommon Abilities (2 Energy each):**
    - **Boulder Toss:** Deal 4 damage to one enemy and push them to end of initiative.
    - **Earthen Grasp:** Root an enemy and reduce their defense by 1.
    - **Titan’s Roar:** Fear all enemies (-1 attack) for 1 turn.
    - **Pulverize:** Deal 3 damage to 2 enemies and stun them if they are rooted.
    - **Seismic Fortitude:** Reduce damage by 3 for 2 turns, but lose 1 speed during this time.
- **Rare Abilities (3 Energy each):**
    - **Grave Collapse:** Deal 4 damage to all enemies and apply Slow for 2 turns.
    - **Iron Colossus Form:** For 2 turns, reduce damage by 3 and become immune to stuns.
    - **Titan’s Grip:** Deal 5 damage and root the target for 2 turns.
    - **Cataclysmic Strike:** Deal 6 damage to one enemy, ignores armor.
    - **Fortified Ground:** Allies gain +1 defense and +1 speed while near the Titan (2 turns AoE aura).
- **Legendary Abilities (4 Energy each):**
    - **Grave Titan’s Wrath:** Deal 6 damage to all enemies and apply Fear.
    - **Unbreakable Core:** Become immune to all damage this turn and heal 5 HP.
    - **Earthen Shockwave:** Deal 5 damage to all enemies and root them if they are already Slowed.
    - **Titan’s Domination:** For 2 turns, all enemy attacks deal -2 damage and lose 1 speed.
    - **Monolith Stance:** Reduce damage to 0 for 1 turn, but skip your next action.
- **Playstyle Summary:** Focused on massive area control, AoE slows/stuns, and damage soaking. Counters aggressive melee teams and excels in outlasting opponents.

### 2.5. Monster Archetype: Infernal Beast (Fire AoE / Rampaging DPS)
- **Role:** A reckless fire-spewing monster that thrives on area damage, burn effects, and brute force.
- **Common Abilities (1 Energy each):**
    - **Fiery Bite:** Deal 3 damage. If target is Burning, deal +1 bonus damage.
    - **Lava Breath:** Deal 1 fire damage to all enemies and apply Burn (1 dmg/turn for 1 turn).
    - **Molten Scales:** Reflect 1 damage to attackers this turn.
    - **Heat Wave:** Apply Burn (1 dmg/turn for 2 turns) to 1 target.
    - **Infernal Roar:** Apply Fear (-1 attack) to all enemies for 1 turn.
- **Uncommon Abilities (2 Energy each):**
    - **Blazing Charge:** Deal 4 damage to one enemy and apply Burn (2 turns).
    - **Flame Armor:** Reduce damage by 2 this turn and apply Burn to attackers.
    - **Magma Spikes:** Deal 2 damage to 3 enemies.
    - **Inferno’s Hunger:** Heal 4 HP if at least one enemy is Burning.
    - **Flame Howl:** Slow all enemies by 1 speed and apply Burn for 1 turn.
- **Rare Abilities (3 Energy each):**
    - **Meteor Slam:** Deal 5 damage and apply Burn to one enemy, push them to end of initiative.
    - **Volcanic Eruption:** Deal 3 damage and Burn to all enemies for 2 turns.
    - **Infernal Endurance:** Reduce damage by 3 for 2 turns, immune to Fear and Burn.
    - **Scorched Earth:** Enemies in an AoE take 2 damage and suffer -1 defense for 2 turns.
    - **Magma Barrage:** Deal 2 damage to all enemies, repeat next turn if you survive.
- **Legendary Abilities (4 Energy each):**
    - **Hellfire Nova:** Deal 6 fire damage to all enemies and apply Burn (3 turns).
    - **Lava Titan’s Wrath:** Deal 7 damage, ignores armor, and Fear the target.
    - **Infernal Rebirth:** Upon defeat, revive at 5 HP and Burn all enemies for 3 turns.
    - **Pyroclasmic Surge:** For 2 turns, your abilities apply Burn and deal +2 bonus damage.
    - **Flamebound Fury:** Deal 5 damage and gain +2 attack for 2 turns.
- **Playstyle Summary:** Specializes in Burn stacking, AoE fire damage, and sustain through fire-themed self-healing. Counters summon-heavy decks or low-health classes like Enchanters or Rogues due to wide-area pressure.

### 2.6. Monster Archetype: Necromancer (Summoner / Dark Controller)
- **Role:** A master of summoning minions, applying fear, and battlefield disruption with dark magic.
- **Common Abilities (1 Energy each):**
    - **Raise Skeleton:** Summon a Skeleton (2 HP, deals 1 damage per attack, lasts until defeated).
    - **Dark Pulse:** Deal 2 damage and apply Fear (target loses 1 attack next turn).
    - **Bone Spear:** Deal 3 damage to a single enemy.
    - **Death’s Whisper:** Fear all enemies (reduce attack by 1) for 1 turn.
    - **Lich’s Shield:** Block the next attack against you or an ally.
- **Uncommon Abilities (2 Energy each):**
    - **Gravebind:** Root an enemy for 1 turn and apply -1 defense.
    - **Ghoul Frenzy:** Summon a Ghoul (3 HP, deals 2 damage per attack, lasts 2 turns).
    - **Shadow Pact:** Sacrifice 2 HP to gain +2 energy this turn.
    - **Withering Aura:** Enemies within range lose 1 attack for 2 turns.
    - **Necrotic Lance:** Deal 4 damage and apply Vulnerable (+1 damage taken) for 2 turns.
- **Rare Abilities (3 Energy each):**
    - **Mass Grave:** Summon 2 Skeletons and apply Fear to all enemies.
    - **Corpse Explosion:** Deal 4 AoE damage to all enemies for each minion that has died this encounter (max 2 minions trigger).
    - **Unholy Resurrection:** Revive all fallen Skeletons and Ghouls at full HP.
    - **Death’s Grip:** Root and deal 3 damage to a target, applies Vulnerable.
    - **Soul Drain:** Deal 3 damage to one enemy and heal 3 HP.
- **Legendary Abilities (4 Energy each):**
    - **Army of the Dead:** Summon 3 Skeletons and 1 Ghoul simultaneously.
    - **Dark Ascension:** Summon a Wight (5 HP, deals 3 damage, applies Fear on hit).
    - **Plague Ritual:** Apply Fear and -2 speed to all enemies for 2 turns.
    - **Soul Harvest:** Deal 5 damage to all enemies and heal 5 HP for each minion in play.
    - **Necrotic Requiem:** If at least 3 minions are active, deal 6 AoE damage and Fear all enemies for 2 turns.
- **Playstyle Summary:** Controls the battlefield by flooding it with minions and debuffing enemies with Fear and roots. Counters low-AoE teams like Enchanter + Rogue, but weak to burst damage or anti-summon builds.

### 2.7. Monster Archetype: Shadowfiend (Stealth / Assassin)
- **Role:** A shadowy assassin who thrives on evasion, critical hits, and ambush damage.
- **Common Abilities (1 Energy each):**
    - **Shadow Slash:** Deal 3 damage to an enemy. If you have evasion active, deal +1 bonus damage.
    - **Fade Into Shadows:** Gain +2 evasion for 1 turn.
    - **Venom Shank:** Deal 1 damage and apply Poison (1 dmg/turn for 2 turns).
    - **Shadow Step:** Avoid the next attack and gain +1 speed next turn.
    - **Dark Ambush:** If the enemy is slowed or rooted, deal 4 damage instead of 2.
- **Uncommon Abilities (2 Energy each):**
    - **Assassin’s Mark:** Apply Vulnerable (+1 damage taken) for 2 turns to a target.
    - **Bleeding Cut:** Deal 3 damage and apply Bleed (1 dmg/turn for 2 turns).
    - **Cloak of Night:** Become untargetable for 1 turn and gain +1 energy next turn.
    - **Quick Kill:** Deal 4 damage, or 5 damage if you are stealthed or evading.
    - **Evasive Reflexes:** Gain +2 evasion and +1 speed for 2 turns.
- **Rare Abilities (3 Energy each):**
    - **Shadowstorm Blades:** Deal 2 damage to 3 enemies. If they are slowed or Poisoned, apply Bleed as well.
    - **Neck Snap:** Deal 5 damage to a stunned or rooted enemy.
    - **Lurking Death:** For 2 turns, your evasion-based abilities also double critical damage.
    - **Blackout Smoke:** Blind all enemies (50% miss chance) for 1 turn and gain +2 evasion.
    - **Soulpiercer Strike:** Deal 4 damage, bypasses all armor and evasion.
- **Legendary Abilities (4 Energy each):**
    - **Assassinate from Beyond:** Deal 7 damage. If the target is Poisoned, Bleeding, or Vulnerable, deal +2 bonus damage.
    - **Perfect Execution:** Deal 4 damage, gain an extra action immediately.
    - **Nightfall Cloak:** Become untargetable for 2 turns and gain +1 attack while cloaked.
    - **Final Hour:** For 2 turns, all your attacks deal +3 bonus damage but you take 1 self-damage each time you attack.
    - **Shadow Mastery:** Gain +2 evasion, +1 speed, and all attacks deal critical hits for 2 turns.
- **Playstyle Summary:** Specializes in high single-target burst and evasion stacking. Combos well with Bleed/Poison synergies, thrives on enemies being rooted, stunned, or weakened. Counters slow or defensive builds like Heavy Armor users, but weak to AoE or persistent DoTs.

### 2.8. Monster Archetype: Storm Serpent (Lightning AoE / Speed Manipulator)
- **Role:** A swift elemental serpent that manipulates initiative, applies shock debuffs, and excels in high-speed AoE damage.
- **Common Abilities (1 Energy each):**
    - **Lightning Bite:** Deal 3 lightning damage and apply Shock (50% chance target misses next action).
    - **Storm Surge:** Gain +1 speed and +1 attack for 1 turn.
    - **Static Charge:** Deal 1 lightning damage to all enemies.
    - **Electric Veil:** Reduce damage by 1 this turn and apply Shock to attackers.
    - **Jolt:** Deal 2 damage and Slow the target by 1 speed.
- **Uncommon Abilities (2 Energy each):**
    - **Chain Lightning:** Deal 3 damage to one enemy, then 2 damage to another.
    - **Thunderstrike:** Deal 4 damage and apply Shock (50% miss chance).
    - **Tempest Shroud:** Gain +2 speed and +2 evasion for 1 turn.
    - **Storm’s Fury:** Deal 2 damage to all enemies and Slow them by 1 speed.
    - **Ion Coil:** Steal 1 energy from each enemy in a chain (up to 2 targets).
- **Rare Abilities (3 Energy each):**
    - **Eye of the Storm:** For 2 turns, you take your action at the top of the initiative order.
    - **Voltaic Storm:** Deal 3 damage to all enemies and apply Shock for 1 turn.
    - **Lightning Reflexes:** Gain +3 speed and +1 energy next turn.
    - **Thunderclap Coil:** Deal 5 damage and push the target to the end of the initiative queue.
    - **Static Field:** All enemies that act next turn take 2 shock damage after their action.
- **Legendary Abilities (4 Energy each):**
    - **Tempest Ascendant:** For 2 turns, your AoE attacks deal +2 bonus damage and always apply Shock.
    - **Stormbinder’s Wrath:** Deal 6 lightning damage to all enemies and Slow them by 2 speed.
    - **Lightning Overload:** Deal 5 damage and apply Shock to all enemies. If enemies are already shocked, stun them instead.
    - **Eternal Storm Form:** For 2 turns, gain +3 speed, +2 evasion, and +1 energy regeneration.
    - **Thunder God’s Judgment:** Deal 7 damage to a single enemy and ignore all defense buffs.
- **Playstyle Summary:** Specializes in initiative disruption, AoE shock/stun loops, and high-speed burst damage. Counters slow teams like Grave Titan + Paladin builds, excels at striking first.

### 2.9. Monster Archetype: Venomspawn (Poison / Controller)
- **Role:** Specializes in damage-over-time via Poison, rooting enemies, and healing debuffs.
- **Common Abilities (1 Energy each):**
    - **Venomous Strike:** Deal 1 damage and apply Poison (1 dmg/turn for 2 turns).
    - **Toxic Fang:** Deal 2 damage to a single target. If the target is already Poisoned, deal an additional +1 damage.
    - **Lurking Poison:** Apply Poison (1 dmg/turn for 3 turns) but no immediate damage.
    - **Vile Reflexes:** Gain +2 evasion for 1 turn and apply Poison to the next enemy who misses you.
    - **Acid Spit:** Deal 1 damage and reduce the target’s defense by 1 for 2 turns.
- **Uncommon Abilities (2 Energy each):**
    - **Acidic Web:** Deal 2 damage and root the target for 1 turn. Apply Poison for 2 turns.
    - **Toxic Trail:** All enemies who target you this turn gain Poison for 2 turns.
    - **Neurotoxin Bite:** Deal 3 damage and reduce the target’s attack by 1 for 1 turn.
    - **Venom Surge:** Apply Poison to all enemies for 2 turns.
    - **Cloying Sludge:** Slow a target by 1 speed and apply Poison (1 dmg/turn for 3 turns).
- **Rare Abilities (3 Energy each):**
    - **Corrosive Burst:** Deal 2 AoE poison damage and reduce enemy healing by 50% for 2 turns.
    - **Paralyzing Venom:** Deal 3 damage and stun if the target is Poisoned.
    - **Toxic Bloom:** Apply Poison to all enemies (2 dmg/turn for 3 turns).
    - **Molten Acid Gland:** Deal 4 damage and reduce defense by 2 for 2 turns.
    - **Serpent’s Hunger:** Heal 4 HP for each enemy affected by Poison.
- **Legendary Abilities (4 Energy each):**
    - **Toxic Deluge:** Apply Poison (3 dmg/turn for 3 turns) to all enemies.
    - **Plagueburst Explosion:** Deal 5 damage and apply Bleed to all enemies who are Poisoned.
    - **Virulent Mastery:** For 2 turns, all Poison applied by you deals double damage.
    - **Cursed Venoms:** Apply Poison and Fear (-1 attack) to all enemies for 2 turns.
    - **Acidstorm Eruption:** Deal 5 damage to all enemies, reduce their defense by 1, and Poison them for 2 turns.
- **Playstyle Summary:** Master of stacking Poison across multiple enemies. Synergizes around controlling the battlefield via roots, slows, and healing reduction. Counters healer-heavy compositions like Cleric/Bard teams.

### 2.10. Monster Archetype: Void Horror (Disruptor / Reality-Bending)
- **Role:** A terrifying entity that manipulates energy, hand disruption, and chaotic debuffs.
- **Common Abilities (1 Energy each):**
    - **Warping Claws:** Deal 2 damage and the target discards 1 card at random.
    - **Reality Tear:** Deal 3 damage and apply Fear (-1 attack) for 1 turn.
    - **Void Pulse:** Steal 1 energy from an enemy.
    - **Unstable Echo:** Deal 2 damage to 2 enemies, but you take 1 self-damage.
    - **Mind Fracture:** Apply Confuse (50% miss chance) to one enemy for 1 turn.
- **Uncommon Abilities (2 Energy each):**
    - **Entropy Coil:** Deal 3 damage and Slow the target by 1 speed for 2 turns.
    - **Mind Leech:** Deal 2 damage and steal 1 card from an enemy's hand until end of turn.
    - **Reality Warp:** Swap initiative order with an enemy and gain +1 energy.
    - **Null Field:** Enemies deal -1 damage this turn.
    - **Void Rift:** Deal 3 damage to all enemies, discard 1 random card from each enemy.
- **Rare Abilities (3 Energy each):**
    - **Devour Mind:** Steal 2 energy from an enemy and apply Fear.
    - **Voidstorm Surge:** Deal 4 damage to all enemies and apply Confuse for 1 turn.
    - **Eldritch Grasp:** Root a target and discard 1 card from their hand.
    - **Reality Collapse:** Discard 2 cards from all enemies' hands (AoE discard).
    - **Wormhole Breach:** Deal 5 damage and teleport the target to last in initiative order.
- **Legendary Abilities (4 Energy each):**
    - **Absolute Oblivion:** Deal 6 damage, stun, and force the target to discard their entire hand.
    - **Voidform Ascension:** Become untargetable for 2 turns, and steal 1 energy every turn from all enemies.
    - **Eternal Dread:** Apply Fear and Confuse to all enemies for 2 turns.
    - **Paradox Strike:** Deal 7 damage, bypasses armor, evasion, and all defense buffs.
    - **Mind Prison:** One enemy skips their next 2 turns and discards their hand.
- **Playstyle Summary:** Disrupts energy economy and hand size, specializes in initiative manipulation and chaos debuffs. Counters combo-heavy classes (e.g., Sorcerer, Bard) by stripping key cards.

