<?php
// public/includes/BattleSimulator.php

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/utils.php';
require_once __DIR__ . '/GameEntity.php';
require_once __DIR__ . '/Champion.php';
require_once __DIR__ . '/Monster.php';
require_once __DIR__ . '/Card.php';
require_once __DIR__ . '/StatusEffect.php';
require_once __DIR__ . '/BuffManager.php';
require_once __DIR__ . '/AIPlayer.php';
require_once __DIR__ . '/Team.php';

class BattleSimulator {
    private $db_conn;
    private $battleLog = [];
    private $playerTeam;
    private $opponentTeam;
    private $aiPlayer;

    public function __construct() {
        $database = new Database();
        $this->db_conn = $database->getConnection();
    }

    private function logEvent(string $eventType, array $payload = []) {
        $this->battleLog[] = [
            'eventType' => $eventType,
            'payload' => $payload,
            'timestamp' => microtime(true)
        ];
    }

    private function safeFormat(string $template, array $args): string {
        $expected = preg_match_all('/%[sd]/', $template, $matches);
        if ($expected > count($args)) {
            $args = array_pad($args, $expected, '');
        }
        return @vsprintf($template, $args) ?: $template;
    }

    public function simulateBattle(Team $playerTeam, Team $opponentTeam, AIPlayer $aiPlayer) {
        $this->playerTeam = $playerTeam;
        $this->opponentTeam = $opponentTeam;
        $this->aiPlayer = $aiPlayer;

        $turn = 0;
        $maxTurns = 50;

        $this->logEvent('BATTLE_START', [
            'turn' => 0,
            'actor' => 'System',
            'player_team_names' => array_map(fn($e) => $e->display_name, $playerTeam->entities),
            'player_initial_hp_1' => $playerTeam->entities[0]->current_hp,
            'player_initial_hp_2' => $playerTeam->entities[1]->current_hp,
            'opponent_team_names' => array_map(fn($e) => $e->display_name, $opponentTeam->entities),
            'opponent_initial_hp_1' => $opponentTeam->entities[0]->current_hp,
            'opponent_initial_hp_2' => $opponentTeam->entities[1]->current_hp
        ]);

        while (!$this->playerTeam->isDefeated() && !$this->opponentTeam->isDefeated() && $turn < $maxTurns) {
            $turn++;
            $this->logEvent('TURN_START', ['turn' => $turn, 'actor' => 'System']);

            foreach ($this->playerTeam->entities as $entity) {
                $entity->resetTemporaryStats();
                BuffManager::updateEntityStats($entity);
            }
            foreach ($this->opponentTeam->entities as $entity) {
                $entity->resetTemporaryStats();
                BuffManager::updateEntityStats($entity);
            }

            $allActive = array_merge($this->playerTeam->getActiveEntities(), $this->opponentTeam->getActiveEntities());
            usort($allActive, function($a,$b){
                if ($a->current_speed == $b->current_speed) return 0;
                return ($a->current_speed > $b->current_speed) ? -1 : 1;
            });

            foreach ($allActive as $actor) {
                if ($actor->current_hp <= 0) {
                    $this->logEvent('TURN_SKIPPED', ['turn'=>$turn,'actor'=>$actor->toArray(),'reason'=>'Defeated']);
                    continue;
                }
                $skipReason = null;
                foreach ($actor->debuffs as $effect) {
                    if ($effect->type === 'Stun' || $effect->type === 'Root') {
                        $skipReason = $effect->type;
                        break;
                    }
                }
                if ($skipReason) {
                    $this->logEvent('TURN_SKIPPED', ['turn'=>$turn,'actor'=>$actor->toArray(),'reason'=>$skipReason]);
                    continue;
                }

                $this->logEvent('TURN_ACTION', ['turn'=>$turn,'actor'=>$actor->toArray(),'energy_before'=>$actor->current_energy]);
                $actor->current_energy = min($actor->current_energy + 1, 4);
                $this->logEvent('ENERGY_GAIN', ['turn'=>$turn,'actor'=>$actor->toArray(),'energy_gained'=>1,'energy_after'=>$actor->current_energy]);

                $actingTeam = $actor->team;
                $opposingTeam = ($actingTeam === $this->playerTeam) ? $this->opponentTeam : $this->playerTeam;
                $chosen = $this->aiPlayer->decideAction($actor, $actingTeam, $opposingTeam, $actor->hand);

                $statusFail = null;
                foreach ($actor->debuffs as $effect) {
                    if ($effect->type === 'Confuse' || $effect->type === 'Shock') {
                        $statusFail = $effect->type;
                        break;
                    }
                }
                if ($statusFail) {
                    $this->logEvent('TURN_SKIPPED', ['turn'=>$turn,'actor'=>$actor->toArray(),'reason'=>$statusFail]);
                    continue;
                }

                if ($chosen && $actor->current_energy >= $chosen['card']->energy_cost) {
                    $card = $chosen['card'];
                    $targetForLog = $chosen['target_entity'] ? $chosen['target_entity']->display_name : '(self or no specific target)';
                    $actor->current_energy -= $card->energy_cost;
                    $this->logEvent('CARD_PLAYED', [
                        'turn' => $turn,
                        'caster' => $actor->toArray(),
                        'card' => $card->toArray(),
                        'target_display_name' => $targetForLog,
                        'target_entity' => $chosen['target_entity'] ? $chosen['target_entity']->toArray() : null
                    ]);
                    $this->applyCardEffect($actor, $card, $opposingTeam, $actingTeam, $chosen['target_entity'] ?? null, $turn);
                } else {
                    $this->logEvent('TURN_PASSED', ['turn'=>$turn,'actor'=>$actor->toArray(),'reason'=>'No affordable cards or valid action']);
                }

                if ($this->playerTeam->isDefeated() || $this->opponentTeam->isDefeated()) break;
            }

            foreach ($this->playerTeam->entities as $entity) BuffManager::decrementDurations($entity);
            foreach ($this->opponentTeam->entities as $entity) BuffManager::decrementDurations($entity);

            if ($this->playerTeam->isDefeated() || $this->opponentTeam->isDefeated()) break;

            $this->logEvent('TURN_END', [
                'turn' => $turn,
                'actor' => 'System',
                'player_hp_1'=>$this->playerTeam->entities[0]->current_hp,
                'player_hp_2'=>$this->playerTeam->entities[1]->current_hp,
                'opponent_hp_1'=>$this->opponentTeam->entities[0]->current_hp,
                'opponent_hp_2'=>$this->opponentTeam->entities[1]->current_hp
            ]);
        }

        $winner = null;
        $result = 'draw';
        if ($this->playerTeam->isDefeated() && !$this->opponentTeam->isDefeated()) {
            $winner = $this->opponentTeam->entities[0]->display_name . " & " . $this->opponentTeam->entities[1]->display_name . " (Team)";
            $result = 'loss';
        } elseif (!$this->playerTeam->isDefeated() && $this->opponentTeam->isDefeated()) {
            $winner = $this->playerTeam->entities[0]->display_name . " & " . $this->playerTeam->entities[1]->display_name . " (Team)";
            $result = 'win';
        } elseif ($this->playerTeam->isDefeated() && $this->opponentTeam->isDefeated()) {
            $winner = 'None (Double KO)';
            $result = 'draw';
        } else {
            $winner = 'None (Max Turns)';
            $result = 'draw';
        }

        $xp_awarded = ($result === 'win' ? 60 : 30);

        $this->logEvent('BATTLE_END', [
            'turn' => $turn,
            'actor' => 'System',
            'winner' => $winner,
            'result' => $result
        ]);


        return [
            "message" => "Battle simulated.",
            "player_final_hp_1" => $this->playerTeam->entities[0]->current_hp,
            "player_final_hp_2" => $this->playerTeam->entities[1]->current_hp,
            "opponent_final_hp_1" => $this->opponentTeam->entities[0]->current_hp,
            "opponent_final_hp_2" => $this->opponentTeam->entities[1]->current_hp,
            "winner" => $winner,
            "result" => $result,
            "xp_awarded" => $xp_awarded,
            "log" => $this->battleLog,
            // Final energy values for each combatant
            "player_energy_1" => $this->playerTeam->entities[0]->current_energy,
            "player_energy_2" => $this->playerTeam->entities[1]->current_energy,
            "opponent_energy_1" => $this->opponentTeam->entities[0]->current_energy,
            "opponent_energy_2" => $this->opponentTeam->entities[1]->current_energy,
            // Serialize active buffs and debuffs for final UI state
            "player_1_active_effects" => array_map(fn($e) => [
                'type' => $e->type,
                'duration' => $e->duration,
                'is_debuff' => $e->is_debuff
            ], array_merge($this->playerTeam->entities[0]->buffs, $this->playerTeam->entities[0]->debuffs)),
            "player_2_active_effects" => array_map(fn($e) => [
                'type' => $e->type,
                'duration' => $e->duration,
                'is_debuff' => $e->is_debuff
            ], array_merge($this->playerTeam->entities[1]->buffs, $this->playerTeam->entities[1]->debuffs)),
            "opponent_1_active_effects" => array_map(fn($e) => [
                'type' => $e->type,
                'duration' => $e->duration,
                'is_debuff' => $e->is_debuff
            ], array_merge($this->opponentTeam->entities[0]->buffs, $this->opponentTeam->entities[0]->debuffs)),
            "opponent_2_active_effects" => array_map(fn($e) => [
                'type' => $e->type,
                'duration' => $e->duration,
                'is_debuff' => $e->is_debuff
            ], array_merge($this->opponentTeam->entities[1]->buffs, $this->opponentTeam->entities[1]->debuffs)),
            "opponent_class_name_1" => $this->opponentTeam->entities[0]->name,
            "opponent_display_name_1_short" => explode(' ', $this->opponentTeam->entities[0]->display_name)[1] ?? $this->opponentTeam->entities[0]->display_name,
            "opponent_class_name_2" => $this->opponentTeam->entities[1]->name,
            "opponent_display_name_2_short" => explode(' ', $this->opponentTeam->entities[1]->display_name)[1] ?? $this->opponentTeam->entities[1]->display_name,
            "player_team_persona_name" => $this->aiPlayer->getPersonaName(),
            "opponent_team_persona_name" => $this->aiPlayer->getPersonaName()
        ];
    }

    private function determineInitiative(GameEntity $entity1, GameEntity $entity2) {
        return 0; // obsolete
    }

    private function applyCardEffect(GameEntity $caster, Card $card, Team $opposingTeam, Team $actingTeam, ?GameEntity $explicitTarget, int $turnNumber) {
        $effectDetails = $card->effect_details;
        if (!$effectDetails) return;

        $targets = [];
        if ($explicitTarget) {
            $targets = [$explicitTarget];
        } elseif (isset($effectDetails['target'])) {
            switch ($effectDetails['target']) {
                case 'self':
                    $targets = [$caster];
                    break;
                case 'single_ally':
                case 'all_allies':
                    $targets = $actingTeam->getActiveEntities();
                    break;
                case 'single_enemy':
                case 'random_enemy':
                case 'all_enemies':
                    $targets = $opposingTeam->getActiveEntities();
                    break;
                default:
                    $targets = [$caster];
                    break;
            }
        } else {
            if ($card->card_type === 'armor' || (strpos($effectDetails['type'] ?? '', 'buff') !== false && strpos($effectDetails['type'] ?? '', 'damage') === false)) {
                $targets = [$caster];
            } elseif ($card->card_type === 'weapon' || strpos($effectDetails['type'] ?? '', 'damage') !== false) {
                $targets = $opposingTeam->getActiveEntities();
            } else {
                $targets = [$caster];
            }
        }

        $targets = array_filter($targets, fn($t) => $t instanceof GameEntity && $t->current_hp > 0);
        if (empty($targets)) {
            $this->logEvent('ACTION_FAILED', [
                'turn' => $turnNumber,
                'caster' => $caster->toArray(),
                'card' => $card->toArray(),
                'reason' => 'No active or valid targets for card effect.'
            ]);
            return;
        }

        foreach ($targets as $actualTarget) {
            $this->logEvent('EFFECT_APPLYING', [
                'turn' => $turnNumber,
                'caster' => $caster->toArray(),
                'card' => $card->toArray(),
                'effect_type' => $effectDetails['type'],
                'target' => $actualTarget->toArray()
            ]);

            switch ($effectDetails['type']) {
                case 'damage':
                case 'aoe_damage':
                    $damageDealt = calculateDamage($effectDetails['damage'], $card->damage_type, $actualTarget->armor_type ?? NULL);
                    $actualTarget->takeDamage($damageDealt, $card->damage_type);
                    $this->logEvent('DAMAGE_DEALT', [
                        'turn' => $turnNumber,
                        'caster' => $caster->toArray(),
                        'target' => $actualTarget->toArray(),
                        'card' => $card->toArray(),
                        'result' => ['damageDealt' => $damageDealt, 'targetHpAfter' => $actualTarget->current_hp]
                    ]);
                    if ($actualTarget->current_hp <= 0) {
                        $this->logEvent('ENTITY_DIED', ['turn' => $turnNumber, 'target' => $actualTarget->toArray(), 'killer' => $caster->toArray(), 'card' => $card->toArray()]);
                    }
                    break;
                case 'damage_heal': // Lifesteal
                    $damageDealt = calculateDamage($effectDetails['damage'], $card->damage_type, $actualTarget->armor_type ?? NULL);
                    $actualTarget->takeDamage($damageDealt, $card->damage_type);
                    $this->logEvent('DAMAGE_DEALT', [
                        'turn' => $turnNumber,
                        'caster' => $caster->toArray(),
                        'target' => $actualTarget->toArray(),
                        'card' => $card->toArray(),
                        'result' => ['damageDealt' => $damageDealt, 'targetHpAfter' => $actualTarget->current_hp]
                    ]);
                    if ($actualTarget->current_hp <= 0) {
                        $this->logEvent('ENTITY_DIED', ['turn' => $turnNumber, 'target' => $actualTarget->toArray(), 'killer' => $caster->toArray(), 'card' => $card->toArray()]);
                    }
                    // Heal the caster
                    $healAmount = $effectDetails['heal'];
                    $caster->heal($healAmount);
                    $this->logEvent('HEAL_APPLIED', [
                        'turn' => $turnNumber,
                        'caster' => $caster->toArray(), // Caster is also the one performing the heal action
                        'target' => $caster->toArray(), // Target of the heal is the caster
                        'card' => $card->toArray(),
                        'result' => ['healed' => $healAmount, 'targetHpAfter' => $caster->current_hp]
                    ]);
                    break;

                case 'heal':
                    $healAmount = $effectDetails['amount'];
                    $actualTarget->heal($healAmount);
                    $this->logEvent('HEAL_APPLIED', [
                        'turn' => $turnNumber,
                        'caster' => $caster->toArray(),
                        'target' => $actualTarget->toArray(),
                        'card' => $card->toArray(),
                        'result' => ['healed' => $healAmount, 'targetHpAfter' => $actualTarget->current_hp]
                    ]);
                    break;

                case 'buff':
                    BuffManager::applyEffect($actualTarget, $card, $effectDetails);
                    $this->logEvent('STATUS_EFFECT_APPLIED', [
                        'turn' => $turnNumber,
                        'caster' => $caster->toArray(),
                        'target' => $actualTarget->toArray(),
                        'card' => $card->toArray(),
                        'effect' => [
                            'type_name' => 'Buff',
                            'stat_affected' => $effectDetails['stat'],
                            'amount' => $effectDetails['amount'],
                            'duration' => $effectDetails['duration'],
                            'is_debuff' => false
                        ]
                    ]);
                    break;

                case 'debuff':
                    BuffManager::applyEffect($actualTarget, $card, $effectDetails);
                    $this->logEvent('STATUS_EFFECT_APPLIED', [
                        'turn' => $turnNumber,
                        'caster' => $caster->toArray(),
                        'target' => $actualTarget->toArray(),
                        'card' => $card->toArray(),
                        'effect' => [
                            'type_name' => 'Debuff',
                            'stat_affected' => $effectDetails['stat'],
                            'amount' => $effectDetails['amount'],
                            'duration' => $effectDetails['duration'],
                            'is_debuff' => true
                        ]
                    ]);
                    break;

                case 'status_effect': // Generic status effect
                    BuffManager::applyEffect($actualTarget, $card, $effectDetails);
                    $this->logEvent('STATUS_EFFECT_APPLIED', [
                        'turn' => $turnNumber,
                        'caster' => $caster->toArray(),
                        'target' => $actualTarget->toArray(),
                        'card' => $card->toArray(),
                        'effect' => [
                            'type_name' => $effectDetails['effect'], // e.g. "Stun", "Root" as per card data
                            'duration' => $effectDetails['duration'],
                            // Determine if it's a debuff based on a new field in effect_details or a predefined list
                            'is_debuff' => $effectDetails['is_debuff'] ?? true // Assuming most generic status effects are debuffs if not specified
                        ]
                    ]);
                    break;

                case 'damage_dot':
                    $damageDealt = calculateDamage($effectDetails['damage'], $card->damage_type, $actualTarget->armor_type ?? NULL);
                    $actualTarget->takeDamage($damageDealt, $card->damage_type);
                    $this->logEvent('DAMAGE_DEALT', [
                        'turn' => $turnNumber,
                        'caster' => $caster->toArray(),
                        'target' => $actualTarget->toArray(),
                        'card' => $card->toArray(),
                        'result' => ['damageDealt' => $damageDealt, 'targetHpAfter' => $actualTarget->current_hp]
                    ]);
                    if ($actualTarget->current_hp <= 0) {
                        $this->logEvent('ENTITY_DIED', ['turn' => $turnNumber, 'target' => $actualTarget->toArray(), 'killer' => $caster->toArray(), 'card' => $card->toArray()]);
                    }
                    // Apply DOT
                    $dotEffect = new StatusEffect($effectDetails['dot_type'], $effectDetails['dot_amount'], $effectDetails['dot_duration'], true, 'dot_damage');
                    $actualTarget->addStatusEffect($dotEffect);
                    $this->logEvent('STATUS_EFFECT_APPLIED', [
                        'turn' => $turnNumber,
                        'caster' => $caster->toArray(),
                        'target' => $actualTarget->toArray(),
                        'card' => $card->toArray(),
                        'effect' => [
                            'type_name' => $effectDetails['dot_type'],
                            'amount' => $effectDetails['dot_amount'],
                            'duration' => $effectDetails['dot_duration'],
                            'is_debuff' => true,
                            'dot_damage' => true
                        ]
                    ]);
                    break;

                case 'heal_over_time':
                    $hotEffect = new StatusEffect('HoT', $effectDetails['amount_per_turn'], $effectDetails['duration'], false, 'hp_over_time');
                    $actualTarget->addStatusEffect($hotEffect);
                    $this->logEvent('STATUS_EFFECT_APPLIED', [
                        'turn' => $turnNumber,
                        'caster' => $caster->toArray(),
                        'target' => $actualTarget->toArray(),
                        'card' => $card->toArray(),
                        'effect' => [
                            'type_name' => 'HoT',
                            'amount_per_turn' => $effectDetails['amount_per_turn'],
                            'duration' => $effectDetails['duration'],
                            'is_debuff' => false
                        ]
                    ]);
                    break;

                case 'damage_bypass_defense':
                    $damageDealt = $effectDetails['damage'];
                    // $actualTarget->current_hp -= $damageDealt; // takeDamage handles this
                    $actualTarget->takeDamage($damageDealt, 'bypass'); // Assuming 'bypass' or similar damage type
                    $this->logEvent('DAMAGE_DEALT', [
                        'turn' => $turnNumber,
                        'caster' => $caster->toArray(),
                        'target' => $actualTarget->toArray(),
                        'card' => $card->toArray(),
                        'result' => ['damageDealt' => $damageDealt, 'targetHpAfter' => $actualTarget->current_hp]
                    ]);
                    if ($actualTarget->current_hp <= 0) {
                        $this->logEvent('ENTITY_DIED', ['turn' => $turnNumber, 'target' => $actualTarget->toArray(), 'killer' => $caster->toArray(), 'card' => $card->toArray()]);
                    }
                    break;

                case 'damage_random_element':
                case 'damage_random_debuff':
                    $elements = $effectDetails['elements'] ?? ['physical']; // Default to physical if no elements defined
                    $chosenElement = $elements[array_rand($elements)];
                    $damageDealt = calculateDamage($effectDetails['damage'], $chosenElement, $actualTarget->armor_type ?? NULL);
                    $actualTarget->takeDamage($damageDealt, $chosenElement);
                    $this->logEvent('DAMAGE_DEALT', [
                        'turn' => $turnNumber,
                        'caster' => $caster->toArray(),
                        'target' => $actualTarget->toArray(),
                        'card' => $card->toArray(),
                        'result' => ['damageDealt' => $damageDealt, 'element' => $chosenElement, 'targetHpAfter' => $actualTarget->current_hp]
                    ]);
                    if ($actualTarget->current_hp <= 0) {
                        $this->logEvent('ENTITY_DIED', ['turn' => $turnNumber, 'target' => $actualTarget->toArray(), 'killer' => $caster->toArray(), 'card' => $card->toArray()]);
                    }

                    if ($effectDetails['type'] === 'damage_random_debuff') {
                        $debuffs = $effectDetails['debuff_types'];
                        $chosenDebuff = $debuffs[array_rand($debuffs)];
                        $debuffEffect = new StatusEffect($chosenDebuff, $effectDetails['debuff_amount'] ?? null, $effectDetails['duration'], true); // Assuming is_debuff = true
                        $actualTarget->addStatusEffect($debuffEffect);
                        $this->logEvent('STATUS_EFFECT_APPLIED', [
                            'turn' => $turnNumber,
                            'caster' => $caster->toArray(),
                            'target' => $actualTarget->toArray(),
                            'card' => $card->toArray(),
                            'effect' => [
                                'type_name' => $chosenDebuff,
                                'amount' => $effectDetails['debuff_amount'] ?? null,
                                'duration' => $effectDetails['duration'],
                                'is_debuff' => true
                            ]
                        ]);
                    }
                    break;

                case 'damage_self_debuff':
                    // Damage to target
                    $damageDealt = calculateDamage($effectDetails['damage'], $card->damage_type, $actualTarget->armor_type ?? NULL);
                    $actualTarget->takeDamage($damageDealt, $card->damage_type);
                    $this->logEvent('DAMAGE_DEALT', [
                        'turn' => $turnNumber,
                        'caster' => $caster->toArray(),
                        'target' => $actualTarget->toArray(),
                        'card' => $card->toArray(),
                        'result' => ['damageDealt' => $damageDealt, 'targetHpAfter' => $actualTarget->current_hp]
                    ]);
                    if ($actualTarget->current_hp <= 0) {
                        $this->logEvent('ENTITY_DIED', ['turn' => $turnNumber, 'target' => $actualTarget->toArray(), 'killer' => $caster->toArray(), 'card' => $card->toArray()]);
                    }
                    // Debuff to caster
                    // BuffManager::applyEffect($caster, $card, $effectDetails); // This seems to assume effectDetails is for caster
                    $selfDebuffDetails = [ // Construct a specific detail for self-debuff
                        'stat' => $effectDetails['debuff_stat'],
                        'amount' => $effectDetails['debuff_amount'],
                        'duration' => $effectDetails['debuff_duration'],
                        'effect' => $effectDetails['debuff_stat'] // Assuming type_name can be derived from stat
                    ];
                    BuffManager::applyEffect($caster, $card, $selfDebuffDetails); // Pass appropriate details
                    $this->logEvent('STATUS_EFFECT_APPLIED', [
                        'turn' => $turnNumber,
                        'caster' => $caster->toArray(), // Action performer
                        'target' => $caster->toArray(), // Target of debuff is caster
                        'card' => $card->toArray(),
                        'effect' => [
                            'type_name' => $effectDetails['debuff_stat'], // Or a more specific name like 'SelfAttackDown'
                            'stat_affected' => $effectDetails['debuff_stat'],
                            'amount' => $effectDetails['debuff_amount'],
                            'duration' => $effectDetails['debuff_duration'],
                            'is_debuff' => true
                        ]
                    ]);
                    break;

                case 'damage_conditional':
                    $baseDamage = $effectDetails['damage'];
                    $finalDamage = $baseDamage;
                    if (isset($effectDetails['condition'])) {
                        $conditionMet = false;
                        switch ($effectDetails['condition']) {
                            case 'target_stunned':
                                foreach ($actualTarget->debuffs as $d) { if ($d->type === 'Stun') { $conditionMet = true; break; } }
                                break;
                            case 'evasion_active': // This condition refers to caster's evasion
                                foreach ($caster->buffs as $b) { if ($b->stat_affected === 'evasion' && $b->amount > 0) { $conditionMet = true; break; } }
                                break;
                        }
                        if ($conditionMet) {
                            $finalDamage += $effectDetails['bonus_damage'] ?? 0;
                        }
                    }
                    $damageDealt = calculateDamage($finalDamage, $card->damage_type, $actualTarget->armor_type ?? NULL);
                    $actualTarget->takeDamage($damageDealt, $card->damage_type);
                    $this->logEvent('DAMAGE_DEALT', [
                        'turn' => $turnNumber,
                        'caster' => $caster->toArray(),
                        'target' => $actualTarget->toArray(),
                        'card' => $card->toArray(),
                        'result' => ['damageDealt' => $damageDealt, 'targetHpAfter' => $actualTarget->current_hp, 'condition_met' => $conditionMet ?? false, 'base_damage' => $baseDamage, 'bonus_damage' => ($finalDamage-$baseDamage)]
                    ]);
                    if ($actualTarget->current_hp <= 0) {
                        $this->logEvent('ENTITY_DIED', ['turn' => $turnNumber, 'target' => $actualTarget->toArray(), 'killer' => $caster->toArray(), 'card' => $card->toArray()]);
                    }
                    break;

                case 'energy_gain':
                    $energyGained = $effectDetails['amount'];
                    $actualTarget->current_energy = min($actualTarget->current_energy + $energyGained, 4);
                    $this->logEvent('STATUS_EFFECT_APPLIED', [
                        'turn' => $turnNumber,
                        'caster' => $caster->toArray(),
                        'target' => $actualTarget->toArray(),
                        'card' => $card->toArray(),
                        'effect' => [
                            'type_name' => 'EnergyGainEffect',
                            'amount' => $energyGained,
                            'energy_after' => $actualTarget->current_energy,
                            'is_debuff' => false
                        ]
                    ]);
                    break;

                case 'extra_action': // This might be a buff applied to the caster for next turn or an immediate action. Assuming it's a flag or state.
                                    // For logging, it implies an effect was applied.
                    $this->logEvent('STATUS_EFFECT_APPLIED', [
                        'turn' => $turnNumber,
                        'caster' => $caster->toArray(),
                        'target' => $actualTarget->toArray(), // Usually caster, but can be other target based on card
                        'card' => $card->toArray(),
                        'effect' => [
                            'type_name' => 'ExtraActionGranted', // Or similar
                            'duration' => $effectDetails['duration'] ?? 1, // If it's a buff
                            'is_debuff' => false
                        ]
                    ]);
                    break;

                case 'damage_draw':
                    $damageDealt = calculateDamage($effectDetails['damage'], $card->damage_type, $actualTarget->armor_type ?? NULL);
                    $actualTarget->takeDamage($damageDealt, $card->damage_type);
                    $this->logEvent('DAMAGE_DEALT', [
                        'turn' => $turnNumber,
                        'caster' => $caster->toArray(),
                        'target' => $actualTarget->toArray(),
                        'card' => $card->toArray(),
                        'result' => ['damageDealt' => $damageDealt, 'targetHpAfter' => $actualTarget->current_hp]
                    ]);
                    if ($actualTarget->current_hp <= 0) {
                        $this->logEvent('ENTITY_DIED', ['turn' => $turnNumber, 'target' => $actualTarget->toArray(), 'killer' => $caster->toArray(), 'card' => $card->toArray()]);
                    }
                    // Card draw for caster
                    // Actual draw logic is likely in Player/AI, this just logs the intent from card effect
                    $this->logEvent('STATUS_EFFECT_APPLIED', [ // Or a more specific CARD_DRAW_EFFECT
                        'turn' => $turnNumber,
                        'caster' => $caster->toArray(),
                        'target' => $caster->toArray(), // Card draw benefits caster
                        'card' => $card->toArray(),
                        'effect' => [
                            'type_name' => 'CardDrawEffect',
                            'draw_count' => $effectDetails['draw_count'],
                            'is_debuff' => false
                        ]
                    ]);
                    break;

                case 'damage_energy_steal':
                    // Damage to target
                    $damageDealt = calculateDamage($effectDetails['damage'], $card->damage_type, $actualTarget->armor_type ?? NULL);
                    $actualTarget->takeDamage($damageDealt, $card->damage_type);
                    $this->logEvent('DAMAGE_DEALT', [
                        'turn' => $turnNumber,
                        'caster' => $caster->toArray(),
                        'target' => $actualTarget->toArray(),
                        'card' => $card->toArray(),
                        'result' => ['damageDealt' => $damageDealt, 'targetHpAfter' => $actualTarget->current_hp]
                    ]);
                    if ($actualTarget->current_hp <= 0) {
                        $this->logEvent('ENTITY_DIED', ['turn' => $turnNumber, 'target' => $actualTarget->toArray(), 'killer' => $caster->toArray(), 'card' => $card->toArray()]);
                    }

                    // Energy gain for caster
                    $energyStolen = $effectDetails['energy_amount'];
                    $casterOldEnergy = $caster->current_energy;
                    $caster->current_energy = min($caster->current_energy + $energyStolen, 4);
                    $this->logEvent('STATUS_EFFECT_APPLIED', [
                        'turn' => $turnNumber,
                        'caster' => $caster->toArray(),
                        'target' => $caster->toArray(),
                        'card' => $card->toArray(),
                        'effect' => [
                            'type_name' => 'EnergyStealGain',
                            'amount' => $energyStolen,
                            'energy_after' => $caster->current_energy,
                            'energy_before' => $casterOldEnergy,
                            'is_debuff' => false
                        ]
                    ]);

                    // Energy loss for target
                    $targetOldEnergy = $actualTarget->current_energy;
                    $actualTarget->current_energy = max(0, $actualTarget->current_energy - $energyStolen);
                    $this->logEvent('STATUS_EFFECT_APPLIED', [
                        'turn' => $turnNumber,
                        'caster' => $caster->toArray(),
                        'target' => $actualTarget->toArray(),
                        'card' => $card->toArray(),
                        'effect' => [
                            'type_name' => 'EnergyStealLoss',
                            'amount' => $energyStolen,
                            'energy_after' => $actualTarget->current_energy,
                            'energy_before' => $targetOldEnergy,
                            'is_debuff' => true
                        ]
                    ]);
                    break;

                case 'damage_debuff':
                    // Damage to target
                    $damageDealt = calculateDamage($effectDetails['damage'], $card->damage_type, $actualTarget->armor_type ?? NULL);
                    $actualTarget->takeDamage($damageDealt, $card->damage_type);
                    $this->logEvent('DAMAGE_DEALT', [
                        'turn' => $turnNumber,
                        'caster' => $caster->toArray(),
                        'target' => $actualTarget->toArray(),
                        'card' => $card->toArray(),
                        'result' => ['damageDealt' => $damageDealt, 'targetHpAfter' => $actualTarget->current_hp]
                    ]);
                    if ($actualTarget->current_hp <= 0) {
                        $this->logEvent('ENTITY_DIED', ['turn' => $turnNumber, 'target' => $actualTarget->toArray(), 'killer' => $caster->toArray(), 'card' => $card->toArray()]);
                    }
                    // Apply debuff to target
                    $debuffEffect = new StatusEffect($effectDetails['debuff_stat'], $effectDetails['debuff_amount'], $effectDetails['debuff_duration'], true, $effectDetails['debuff_stat']);
                    $actualTarget->addStatusEffect($debuffEffect);
                    $this->logEvent('STATUS_EFFECT_APPLIED', [
                        'turn' => $turnNumber,
                        'caster' => $caster->toArray(),
                        'target' => $actualTarget->toArray(),
                        'card' => $card->toArray(),
                        'effect' => [
                            'type_name' => $effectDetails['debuff_stat'], // e.g. AttackDown
                            'stat_affected' => $effectDetails['debuff_stat'],
                            'amount' => $effectDetails['debuff_amount'],
                            'duration' => $effectDetails['debuff_duration'],
                            'is_debuff' => true
                        ]
                    ]);
                    break;

                // Cases for buffs like damage_reduction_buff, damage_reduction_reflect, etc.
                // These apply a status effect (buff)
                case 'damage_reduction_buff':
                case 'damage_reduction_reflect': // Reflect part needs separate handling if it's direct damage
                case 'damage_reduction_aoe_buff': // AoE part handled by target loop
                case 'damage_reduction':
                case 'magic_damage_reduction':
                    $buffTypeName = 'DefenseBoost'; // Generic, can be more specific
                    $statAffected = 'defense_reduction'; // Placeholder, might need specific stat from card details
                    if ($effectDetails['type'] === 'magic_damage_reduction') {
                        $buffTypeName = 'MagicDefenseBoost';
                        $statAffected = 'magic_defense_reduction';
                    }

                    $buff = new StatusEffect($buffTypeName, $effectDetails['amount'], $effectDetails['duration'], false, $statAffected);
                    $actualTarget->addStatusEffect($buff);
                    $this->logEvent('STATUS_EFFECT_APPLIED', [
                        'turn' => $turnNumber,
                        'caster' => $caster->toArray(),
                        'target' => $actualTarget->toArray(),
                        'card' => $card->toArray(),
                        'effect' => [
                            'type_name' => $buffTypeName,
                            'stat_affected' => $statAffected,
                            'amount' => $effectDetails['amount'],
                            'duration' => $effectDetails['duration'],
                            'is_debuff' => false
                        ]
                    ]);
                    // Handle reflect damage for 'damage_reduction_reflect'
                    if ($effectDetails['type'] === 'damage_reduction_reflect' && isset($effectDetails['reflect_damage'])) {
                        // This part is tricky: reflect usually happens when the buffed entity is attacked.
                        // If card *itself* causes reflect damage *immediately*, it needs a target.
                        // Assuming it means the *caster* reflects or a designated target.
                        // For now, let's assume it applies buff, and reflect is passive.
                        // If immediate damage:
                        // $reflectTarget = $opposingTeam->getRandomActiveEntity(); // Or specific target
                        // if ($reflectTarget) {
                        //     $reflectDamageDealt = $effectDetails['reflect_damage'];
                        //     $reflectTarget->takeDamage($reflectDamageDealt, 'pure'); // Assuming pure or magic
                        //     $this->logEvent('DAMAGE_DEALT', [
                        //         'turn' => $turnNumber,
                        //         'caster' => $actualTarget->toArray(), // The one with the reflect buff is "causing" it
                        //         'target' => $reflectTarget->toArray(),
                        //         'card' => $card->toArray(), // Original card
                        //         'result' => ['damageDealt' => $reflectDamageDealt, 'targetHpAfter' => $reflectTarget->current_hp, 'is_reflection' => true]
                        //     ]);
                        //     if ($reflectTarget->current_hp <= 0) {
                        //          $this->logEvent('ENTITY_DIED', ['turn' => $turnNumber, 'target' => $reflectTarget->toArray(), 'killer' => $actualTarget->toArray(), 'card' => $card->toArray()]);
                        //     }
                        // }
                    }
                    // Handle AoE buff part for 'damage_reduction_aoe_buff' - this is complex if it targets another ally simultaneously
                    // The current loop handles one $actualTarget. If it buffs another ally with different params, it's outside this iteration.
                    // Assuming $effectDetails['ally_amount'] applies to a *different* ally, not the current $actualTarget.
                    // This part might need restructuring if a single card effect has multiple distinct actions on different targets simultaneously.
                    // For now, this case will buff $actualTarget. The AOE aspect is implicitly handled by iterating over $targets.
                    break;


                case 'block':
                    $blockEffect = new StatusEffect('Block', $effectDetails['amount'], 1, false, 'block_incoming');
                    $actualTarget->addStatusEffect($blockEffect);
                    $this->logEvent('STATUS_EFFECT_APPLIED', [
                        'turn' => $turnNumber,
                        'caster' => $caster->toArray(),
                        'target' => $actualTarget->toArray(),
                        'card' => $card->toArray(),
                        'effect' => [
                            'type_name' => 'Block',
                            'amount' => $effectDetails['amount'],
                            'duration' => 1, // Typically 1 turn or until consumed
                            'is_debuff' => false
                        ]
                    ]);
                    break;

                case 'block_magic':
                    $blockEffect = new StatusEffect('Block Magic', $effectDetails['amount'], 1, false, 'block_magic_incoming');
                    $actualTarget->addStatusEffect($blockEffect);
                    $this->logEvent('STATUS_EFFECT_APPLIED', [
                        'turn' => $turnNumber,
                        'caster' => $caster->toArray(),
                        'target' => $actualTarget->toArray(),
                        'card' => $card->toArray(),
                        'effect' => [
                            'type_name' => 'BlockMagic',
                            'amount' => $effectDetails['amount'],
                            'duration' => 1,
                            'is_debuff' => false
                        ]
                    ]);
                    break;

                case 'stun':
                    $stunEffect = new StatusEffect('Stun', null, $effectDetails['duration'] ?? 1, true);
                    $actualTarget->addStatusEffect($stunEffect);
                    $this->logEvent('STATUS_EFFECT_APPLIED', [
                        'turn' => $turnNumber,
                        'caster' => $caster->toArray(),
                        'target' => $actualTarget->toArray(),
                        'card' => $card->toArray(),
                        'effect' => [
                            'type_name' => 'Stun',
                            'duration' => $effectDetails['duration'] ?? 1,
                            'is_debuff' => true
                        ]
                    ]);
                    break;

                case 'root':
                    $rootEffect = new StatusEffect('Root', null, $effectDetails['duration'] ?? 1, true);
                    $actualTarget->addStatusEffect($rootEffect);
                    $this->logEvent('STATUS_EFFECT_APPLIED', [
                        'turn' => $turnNumber,
                        'caster' => $caster->toArray(),
                        'target' => $actualTarget->toArray(),
                        'card' => $card->toArray(),
                        'effect' => [
                            'type_name' => 'Root',
                            'duration' => $effectDetails['duration'] ?? 1,
                            'is_debuff' => true
                        ]
                    ]);
                    break;

                case 'slow':
                    $slowEffect = new StatusEffect('Slow', $effectDetails['amount'] ?? 1, $effectDetails['duration'] ?? 1, true, 'speed');
                    $actualTarget->addStatusEffect($slowEffect);
                    $this->logEvent('STATUS_EFFECT_APPLIED', [
                        'turn' => $turnNumber,
                        'caster' => $caster->toArray(),
                        'target' => $actualTarget->toArray(),
                        'card' => $card->toArray(),
                        'effect' => [
                            'type_name' => 'Slow',
                            'stat_affected' => 'speed',
                            'amount' => $effectDetails['amount'] ?? 1,
                            'duration' => $effectDetails['duration'] ?? 1,
                            'is_debuff' => true
                        ]
                    ]);
                    break;

                case 'confuse':
                    $confEffect = new StatusEffect('Confuse', null, $effectDetails['duration'] ?? 1, true);
                    $actualTarget->addStatusEffect($confEffect);
                    $this->logEvent('STATUS_EFFECT_APPLIED', [
                        'turn' => $turnNumber,
                        'caster' => $caster->toArray(),
                        'target' => $actualTarget->toArray(),
                        'card' => $card->toArray(),
                        'effect' => [
                            'type_name' => 'Confuse',
                            'duration' => $effectDetails['duration'] ?? 1,
                            'is_debuff' => true
                        ]
                    ]);
                    break;

                case 'shock':
                    $shockEffect = new StatusEffect('Shock', null, $effectDetails['duration'] ?? 1, true);
                    $actualTarget->addStatusEffect($shockEffect);
                    $this->logEvent('STATUS_EFFECT_APPLIED', [
                        'turn' => $turnNumber,
                        'caster' => $caster->toArray(),
                        'target' => $actualTarget->toArray(),
                        'card' => $card->toArray(),
                        'effect' => [
                            'type_name' => 'Shock',
                            'duration' => $effectDetails['duration'] ?? 1,
                            'is_debuff' => true
                        ]
                    ]);
                    break;

                case 'fear':
                    $fearEffect = new StatusEffect('Fear', $effectDetails['amount'] ?? 1, $effectDetails['duration'] ?? 1, true, 'attack'); // Assuming Fear affects attack
                    $actualTarget->addStatusEffect($fearEffect);
                    $this->logEvent('STATUS_EFFECT_APPLIED', [
                        'turn' => $turnNumber,
                        'caster' => $caster->toArray(),
                        'target' => $actualTarget->toArray(),
                        'card' => $card->toArray(),
                        'effect' => [
                            'type_name' => 'Fear',
                            'stat_affected' => 'attack',
                            'amount' => $effectDetails['amount'] ?? 1,
                            'duration' => $effectDetails['duration'] ?? 1,
                            'is_debuff' => true
                        ]
                    ]);
                    break;

                case 'attack_down':
                    $atkDebuff = new StatusEffect('Attack Down', $effectDetails['amount'], $effectDetails['duration'], true, 'attack');
                    $actualTarget->addStatusEffect($atkDebuff);
                    $this->logEvent('STATUS_EFFECT_APPLIED', [
                        'turn' => $turnNumber,
                        'caster' => $caster->toArray(),
                        'target' => $actualTarget->toArray(),
                        'card' => $card->toArray(),
                        'effect' => [
                            'type_name' => 'AttackDown',
                            'stat_affected' => 'attack',
                            'amount' => $effectDetails['amount'],
                            'duration' => $effectDetails['duration'],
                            'is_debuff' => true
                        ]
                    ]);
                    break;

                case 'defense_down':
                    $defDebuff = new StatusEffect('Defense Down', $effectDetails['amount'], $effectDetails['duration'], true, 'defense');
                    $actualTarget->addStatusEffect($defDebuff);
                    $this->logEvent('STATUS_EFFECT_APPLIED', [
                        'turn' => $turnNumber,
                        'caster' => $caster->toArray(),
                        'target' => $actualTarget->toArray(),
                        'card' => $card->toArray(),
                        'effect' => [
                            'type_name' => 'DefenseDown',
                            'stat_affected' => 'defense',
                            'amount' => $effectDetails['amount'],
                            'duration' => $effectDetails['duration'],
                            'is_debuff' => true
                        ]
                    ]);
                    break;

                case 'vulnerable':
                    $vuln = new StatusEffect('Vulnerable', $effectDetails['amount'], $effectDetails['duration'], true, 'vulnerable'); // 'vulnerable' might mean takes more damage
                    $actualTarget->addStatusEffect($vuln);
                    $this->logEvent('STATUS_EFFECT_APPLIED', [
                        'turn' => $turnNumber,
                        'caster' => $caster->toArray(),
                        'target' => $actualTarget->toArray(),
                        'card' => $card->toArray(),
                        'effect' => [
                            'type_name' => 'Vulnerable',
                            'amount' => $effectDetails['amount'], // This could be a percentage or flat increase
                            'duration' => $effectDetails['duration'],
                            'is_debuff' => true
                        ]
                    ]);
                    break;

                case 'evasion_buff':
                    $evasionBuff = new StatusEffect('Evasion Buff', $effectDetails['amount'], $effectDetails['duration'], false, 'evasion');
                    $actualTarget->addStatusEffect($evasionBuff);
                    $this->logEvent('STATUS_EFFECT_APPLIED', [
                        'turn' => $turnNumber,
                        'caster' => $caster->toArray(),
                        'target' => $actualTarget->toArray(),
                        'card' => $card->toArray(),
                        'effect' => [
                            'type_name' => 'EvasionUp',
                            'stat_affected' => 'evasion',
                            'amount' => $effectDetails['amount'],
                            'duration' => $effectDetails['duration'],
                            'is_debuff' => false
                        ]
                    ]);
                    break;

                case 'speed_buff':
                    $speedBuff = new StatusEffect('Speed Buff', $effectDetails['amount'], $effectDetails['duration'], false, 'speed');
                    $actualTarget->addStatusEffect($speedBuff);
                    $this->logEvent('STATUS_EFFECT_APPLIED', [
                        'turn' => $turnNumber,
                        'caster' => $caster->toArray(),
                        'target' => $actualTarget->toArray(),
                        'card' => $card->toArray(),
                        'effect' => [
                            'type_name' => 'SpeedUp',
                            'stat_affected' => 'speed',
                            'amount' => $effectDetails['amount'],
                            'duration' => $effectDetails['duration'],
                            'is_debuff' => false
                        ]
                    ]);
                    break;

                case 'crit_chance_buff':
                    $critBuff = new StatusEffect('Crit Chance', $effectDetails['amount'], $effectDetails['duration'], false, 'crit_chance');
                    $actualTarget->addStatusEffect($critBuff);
                    $this->logEvent('STATUS_EFFECT_APPLIED', [
                        'turn' => $turnNumber,
                        'caster' => $caster->toArray(),
                        'target' => $actualTarget->toArray(),
                        'card' => $card->toArray(),
                        'effect' => [
                            'type_name' => 'CritChanceUp',
                            'stat_affected' => 'crit_chance',
                            'amount' => $effectDetails['amount'],
                            'duration' => $effectDetails['duration'],
                            'is_debuff' => false
                        ]
                    ]);
                    break;

                case 'total_immunity':
                    $immunity = new StatusEffect('Total Immunity', null, $effectDetails['duration'], false, 'total_immunity');
                    $actualTarget->addStatusEffect($immunity);
                    $this->logEvent('STATUS_EFFECT_APPLIED', [
                        'turn' => $turnNumber,
                        'caster' => $caster->toArray(),
                        'target' => $actualTarget->toArray(),
                        'card' => $card->toArray(),
                        'effect' => [
                            'type_name' => 'TotalImmunity',
                            'duration' => $effectDetails['duration'],
                            'is_debuff' => false
                        ]
                    ]);
                    break;

                case 'aoe_damage_debuff':
                    // Damage
                    $damageDealt = calculateDamage($effectDetails['damage'], $card->damage_type, $actualTarget->armor_type ?? NULL);
                    $actualTarget->takeDamage($damageDealt, $card->damage_type);
                    $this->logEvent('DAMAGE_DEALT', [
                        'turn' => $turnNumber,
                        'caster' => $caster->toArray(),
                        'target' => $actualTarget->toArray(),
                        'card' => $card->toArray(),
                        'result' => ['damageDealt' => $damageDealt, 'targetHpAfter' => $actualTarget->current_hp]
                    ]);
                    if ($actualTarget->current_hp <= 0) {
                        $this->logEvent('ENTITY_DIED', ['turn' => $turnNumber, 'target' => $actualTarget->toArray(), 'killer' => $caster->toArray(), 'card' => $card->toArray()]);
                    }
                    // Debuff
                    $debuff = new StatusEffect($effectDetails['debuff_stat'], $effectDetails['debuff_amount'], $effectDetails['debuff_duration'], true, $effectDetails['debuff_stat']);
                    $actualTarget->addStatusEffect($debuff);
                    $this->logEvent('STATUS_EFFECT_APPLIED', [
                        'turn' => $turnNumber,
                        'caster' => $caster->toArray(),
                        'target' => $actualTarget->toArray(),
                        'card' => $card->toArray(),
                        'effect' => [
                            'type_name' => $effectDetails['debuff_stat'], // e.g. 'AttackDown'
                            'stat_affected' => $effectDetails['debuff_stat'],
                            'amount' => $effectDetails['debuff_amount'],
                            'duration' => $effectDetails['debuff_duration'],
                            'is_debuff' => true
                        ]
                    ]);
                    break;

                case 'aoe_damage_dot':
                    // Initial Damage
                    $damageDealt = calculateDamage($effectDetails['damage'], $card->damage_type, $actualTarget->armor_type ?? NULL);
                    $actualTarget->takeDamage($damageDealt, $card->damage_type);
                    $this->logEvent('DAMAGE_DEALT', [
                        'turn' => $turnNumber,
                        'caster' => $caster->toArray(),
                        'target' => $actualTarget->toArray(),
                        'card' => $card->toArray(),
                        'result' => ['damageDealt' => $damageDealt, 'targetHpAfter' => $actualTarget->current_hp]
                    ]);
                    if ($actualTarget->current_hp <= 0) {
                        $this->logEvent('ENTITY_DIED', ['turn' => $turnNumber, 'target' => $actualTarget->toArray(), 'killer' => $caster->toArray(), 'card' => $card->toArray()]);
                    }
                    // Apply DOT
                    $dot = new StatusEffect($effectDetails['dot_type'], $effectDetails['dot_amount'], $effectDetails['dot_duration'], true, 'dot_damage');
                    $actualTarget->addStatusEffect($dot);
                    $this->logEvent('STATUS_EFFECT_APPLIED', [
                        'turn' => $turnNumber,
                        'caster' => $caster->toArray(),
                        'target' => $actualTarget->toArray(),
                        'card' => $card->toArray(),
                        'effect' => [
                            'type_name' => $effectDetails['dot_type'], // e.g. 'Burn'
                            'amount' => $effectDetails['dot_amount'],
                            'duration' => $effectDetails['dot_duration'],
                            'is_debuff' => true,
                            'dot_damage' => true
                        ]
                    ]);
                    break;

                case 'extra_actions_next_turn':
                    $extra = new StatusEffect('Extra Actions', $effectDetails['amount'] ?? 1, 1, false, 'extra_actions_next_turn'); // Duration 1 for next turn
                    $actualTarget->addStatusEffect($extra); // Usually caster
                    $this->logEvent('STATUS_EFFECT_APPLIED', [
                        'turn' => $turnNumber,
                        'caster' => $caster->toArray(),
                        'target' => $actualTarget->toArray(),
                        'card' => $card->toArray(),
                        'effect' => [
                            'type_name' => 'ExtraActionsNextTurn',
                            'amount' => $effectDetails['amount'] ?? 1,
                            'duration' => 1,
                            'is_debuff' => false
                        ]
                    ]);
                    break;

                case 'buff_extra_action_immunity':
                    $buff = new StatusEffect('Extra Action Immunity', null, $effectDetails['duration'] ?? 1, false, 'extra_action_immunity');
                    $actualTarget->addStatusEffect($buff);
                    $this->logEvent('STATUS_EFFECT_APPLIED', [
                        'turn' => $turnNumber,
                        'caster' => $caster->toArray(),
                        'target' => $actualTarget->toArray(),
                        'card' => $card->toArray(),
                        'effect' => [
                            'type_name' => 'ExtraActionImmunity',
                            'duration' => $effectDetails['duration'] ?? 1,
                            'is_debuff' => false
                        ]
                    ]);
                    break;

                case 'taunt_buff': // Typically on self, or on an enemy to force attacks
                    $taunt = new StatusEffect('Taunt', null, $effectDetails['duration'] ?? 1, $effectDetails['is_debuff'] ?? false, 'taunt'); // is_debuff depends on who it's cast on
                    $actualTarget->addStatusEffect($taunt);
                    $this->logEvent('STATUS_EFFECT_APPLIED', [
                        'turn' => $turnNumber,
                        'caster' => $caster->toArray(),
                        'target' => $actualTarget->toArray(),
                        'card' => $card->toArray(),
                        'effect' => [
                            'type_name' => 'Taunt',
                            'duration' => $effectDetails['duration'] ?? 1,
                            'is_debuff' => $effectDetails['is_debuff'] ?? false // If caster taunts self, not a debuff. If forces enemy, could be.
                        ]
                    ]);
                    break;

                case 'summon':
                    // Actual summon logic might be complex (creating new GameEntity, adding to team)
                    // This log assumes the summon action itself is what's being recorded.
                    $this->logEvent('ENTITY_SUMMONED', [ // Or use generic STATUS_EFFECT_APPLIED if ENTITY_SUMMONED is not a defined event type
                        'turn' => $turnNumber,
                        'caster' => $caster->toArray(),
                        'target' => $actualTarget->toArray(), // Or null if summon doesn't target existing entity
                        'card' => $card->toArray(),
                        'result' => [ // Or 'effect'
                            'summon_name' => $effectDetails['summon_name'] ?? 'unknown',
                            // Could add details of summoned unit if available
                        ]
                    ]);
                    break;

                case 'prevent_defeat':
                    $effect = new StatusEffect('Prevent Defeat', null, $effectDetails['duration'] ?? 1, false, 'prevent_defeat');
                    $actualTarget->addStatusEffect($effect);
                    $this->logEvent('STATUS_EFFECT_APPLIED', [
                        'turn' => $turnNumber,
                        'caster' => $caster->toArray(),
                        'target' => $actualTarget->toArray(),
                        'card' => $card->toArray(),
                        'effect' => [
                            'type_name' => 'PreventDefeat',
                            'duration' => $effectDetails['duration'] ?? 1,
                            'is_debuff' => false
                        ]
                    ]);
                    break;

                case 'full_heal':
                    $healAmount = $actualTarget->max_hp - $actualTarget->current_hp;
                    $actualTarget->heal($healAmount);
                    $this->logEvent('HEAL_APPLIED', [
                        'turn' => $turnNumber,
                        'caster' => $caster->toArray(),
                        'target' => $actualTarget->toArray(),
                        'card' => $card->toArray(),
                        'result' => ['healed' => $healAmount, 'targetHpAfter' => $actualTarget->current_hp, 'is_full_heal' => true]
                    ]);
                    break;

                case 'revive':
                    if ($actualTarget->current_hp <= 0) { // Only if target is actually dead
                        $reviveAmount = $effectDetails['amount'] ?? $actualTarget->max_hp; // Heal to amount or full
                        $actualTarget->current_hp = min($reviveAmount, $actualTarget->max_hp);
                        // Reset any "dead" flags on actualTarget if necessary
                        $this->logEvent('ENTITY_REVIVED', [ // Or STATUS_EFFECT_APPLIED if no ENTITY_REVIVED
                            'turn' => $turnNumber,
                            'caster' => $caster->toArray(),
                            'target' => $actualTarget->toArray(),
                            'card' => $card->toArray(),
                            'result' => ['revived_hp' => $actualTarget->current_hp, 'revive_amount_requested' => $reviveAmount]
                        ]);
                    }
                    break;

                case 'aoe_heal_cleanse':
                    // Heal
                    $healAmount = $effectDetails['heal'];
                    $actualTarget->heal($healAmount);
                    $this->logEvent('HEAL_APPLIED', [
                        'turn' => $turnNumber,
                        'caster' => $caster->toArray(),
                        'target' => $actualTarget->toArray(),
                        'card' => $card->toArray(),
                        'result' => ['healed' => $healAmount, 'targetHpAfter' => $actualTarget->current_hp]
                    ]);
                    // Cleanse (remove debuffs) - actual cleanse logic might be in BuffManager or GameEntity
                    // $actualTarget->cleanseDebuffs(); // Assuming such a method exists
                    $this->logEvent('STATUS_EFFECT_APPLIED', [ // Or a specific CLEANSE_EFFECT
                        'turn' => $turnNumber,
                        'caster' => $caster->toArray(),
                        'target' => $actualTarget->toArray(),
                        'card' => $card->toArray(),
                        'effect' => [
                            'type_name' => 'CleanseDebuffs',
                            'is_debuff' => false // The cleanse effect itself is not a debuff
                            // Could list debuffs removed if tracked
                        ]
                    ]);
                    break;

                case 'aoe_heal_buff':
                    // Heal
                    $healAmount = $effectDetails['heal'];
                    $actualTarget->heal($healAmount);
                    $this->logEvent('HEAL_APPLIED', [
                        'turn' => $turnNumber,
                        'caster' => $caster->toArray(),
                        'target' => $actualTarget->toArray(),
                        'card' => $card->toArray(),
                        'result' => ['healed' => $healAmount, 'targetHpAfter' => $actualTarget->current_hp]
                    ]);
                    // Buff
                    BuffManager::applyEffect($actualTarget, $card, $effectDetails); // Assuming applyEffect can parse buff details from this
                    $this->logEvent('STATUS_EFFECT_APPLIED', [
                        'turn' => $turnNumber,
                        'caster' => $caster->toArray(),
                        'target' => $actualTarget->toArray(),
                        'card' => $card->toArray(),
                        'effect' => [
                            'type_name' => $effectDetails['buff_stat'] ?? 'GenericBuff',
                            'stat_affected' => $effectDetails['buff_stat'],
                            'amount' => $effectDetails['buff_amount'],
                            'duration' => $effectDetails['duration'], // Assuming general duration field
                            'is_debuff' => false
                        ]
                    ]);
                    break;

                case 'initiative_manipulation':
                    // Logic for initiative change would be here, e.g., $actualTarget->modifyInitiative(X);
                    $this->logEvent('STATUS_EFFECT_APPLIED', [ // Or more specific INITIATIVE_CHANGE
                        'turn' => $turnNumber,
                        'caster' => $caster->toArray(),
                        'target' => $actualTarget->toArray(),
                        'card' => $card->toArray(),
                        'effect' => [
                            'type_name' => 'InitiativeChange',
                            // 'amount' => X, // How much it changed by
                            'is_debuff' => $effectDetails['is_debuff'] ?? false // Depending on if it's up or down
                        ]
                    ]);
                    break;

                case 'untargetable':
                case 'untargetable_buff':
                    $statusEffect = new StatusEffect('Untargetable', null, $effectDetails['duration'], false, 'untargetable');
                    $actualTarget->addStatusEffect($statusEffect);
                    $this->logEvent('STATUS_EFFECT_APPLIED', [
                        'turn' => $turnNumber,
                        'caster' => $caster->toArray(),
                        'target' => $actualTarget->toArray(),
                        'card' => $card->toArray(),
                        'effect' => [
                            'type_name' => 'Untargetable',
                            'duration' => $effectDetails['duration'],
                            'is_debuff' => false
                        ]
                    ]);
                    break;

                case 'mind_control':
                    // Complex: implies changing target's team or AI for a duration
                    $this->logEvent('STATUS_EFFECT_APPLIED', [ // Or specific MIND_CONTROL_EFFECT
                        'turn' => $turnNumber,
                        'caster' => $caster->toArray(),
                        'target' => $actualTarget->toArray(),
                        'card' => $card->toArray(),
                        'effect' => [
                            'type_name' => 'MindControl',
                            'duration' => $effectDetails['duration'],
                            'is_debuff' => true // Usually a debuff for the target
                        ]
                    ]);
                    break;

                case 'conditional_damage_modifier': // Applies a buff that modifies damage later
                    $buffEffect = new StatusEffect('Damage Modifier', $effectDetails['modifier_type'], $effectDetails['duration'], false, 'damage_modifier');
                    $caster->addStatusEffect($buffEffect); // Usually on caster
                    $this->logEvent('STATUS_EFFECT_APPLIED', [
                        'turn' => $turnNumber,
                        'caster' => $caster->toArray(),
                        'target' => $caster->toArray(), // Buff is on caster
                        'card' => $card->toArray(),
                        'effect' => [
                            'type_name' => 'ConditionalDamageModifier',
                            'modifier_type' => $effectDetails['modifier_type'], // e.g. "vs_stunned_targets"
                            'amount' => $effectDetails['modifier_amount'] ?? 0, // e.g. +20% damage
                            'duration' => $effectDetails['duration'],
                            'is_debuff' => false
                        ]
                    ]);
                    break;

                default:
                    $this->logEvent('UNKNOWN_CARD_EFFECT', [
                        'turn' => $turnNumber,
                        'caster' => $caster->toArray(),
                        'target' => $actualTarget->toArray(),
                        'card' => $card->toArray(),
                        'unhandled_effect_type' => $effectDetails['type']
                    ]);
                    break;
            }
        }
    }
}
?>
