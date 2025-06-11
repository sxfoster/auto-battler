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

    private function logAction($turn, $actorName, $actionType, $details = []) {
        $this->battleLog[] = createBattleLogEntry($turn, $actorName, $actionType, $details);
    }

    public function simulateBattle(Team $playerTeam, Team $opponentTeam, AIPlayer $aiPlayer) {
        $this->playerTeam = $playerTeam;
        $this->opponentTeam = $opponentTeam;
        $this->aiPlayer = $aiPlayer;

        $turn = 0;
        $maxTurns = 50;

        $this->logAction(0, "System", "Battle Start", [
            "player_team_names" => array_map(fn($e) => $e->display_name, $playerTeam->entities),
            "player_initial_hp_1" => $playerTeam->entities[0]->current_hp,
            "player_initial_hp_2" => $playerTeam->entities[1]->current_hp,
            "opponent_team_names" => array_map(fn($e) => $e->display_name, $opponentTeam->entities),
            "opponent_initial_hp_1" => $opponentTeam->entities[0]->current_hp,
            "opponent_initial_hp_2" => $opponentTeam->entities[1]->current_hp
        ]);

        while (!$this->playerTeam->isDefeated() && !$this->opponentTeam->isDefeated() && $turn < $maxTurns) {
            $turn++;
            $this->logAction($turn, "System", "Turn Start");

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
                    $this->logAction($turn, $actor->display_name, "Skipped Turn", ["reason" => "Defeated"]);
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
                    $this->logAction($turn, $actor->display_name, "Skipped Turn", ["reason"=>$skipReason]);
                    continue;
                }

                $this->logAction($turn, $actor->display_name, "Turn Action", ["energy_before" => $actor->current_energy]);
                $actor->current_energy = min($actor->current_energy + 1, 4);
                $this->logAction($turn, $actor->display_name, "Energy Gain", ["energy_gained"=>1, "energy_after"=>$actor->current_energy]);

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
                    $this->logAction($turn, $actor->display_name, "Skipped Turn", ["reason"=>$statusFail]);
                    continue;
                }

                if ($chosen && $actor->current_energy >= $chosen['card']->energy_cost) {
                    $card = $chosen['card'];
                    $targetForLog = $chosen['target_entity'] ? $chosen['target_entity']->display_name : '(self or no specific target)';
                    $actor->current_energy -= $card->energy_cost;
                    $this->logAction($turn, $actor->display_name, "Plays Card", [
                        "card_name" => $card->name,
                        "energy_spent" => $card->energy_cost,
                        "target" => $targetForLog
                    ]);
                    $this->applyCardEffect($actor, $card, $opposingTeam, $actingTeam, $chosen['target_entity'] ?? null);
                } else {
                    $this->logAction($turn, $actor->display_name, "Passes Turn", ["reason"=>"No affordable cards or valid action"]);
                }

                if ($this->playerTeam->isDefeated() || $this->opponentTeam->isDefeated()) break;
            }

            foreach ($this->playerTeam->entities as $entity) BuffManager::decrementDurations($entity);
            foreach ($this->opponentTeam->entities as $entity) BuffManager::decrementDurations($entity);

            if ($this->playerTeam->isDefeated() || $this->opponentTeam->isDefeated()) break;

            $this->logAction($turn, "System", "Turn End", [
                "player_hp_1"=>$this->playerTeam->entities[0]->current_hp,
                "player_hp_2"=>$this->playerTeam->entities[1]->current_hp,
                "opponent_hp_1"=>$this->opponentTeam->entities[0]->current_hp,
                "opponent_hp_2"=>$this->opponentTeam->entities[1]->current_hp
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

        $this->logAction($turn, "System", "Battle End", ["winner"=>$winner, "result"=>$result]);

        return [
            "message" => "Battle simulated.",
            "player_final_hp_1" => $this->playerTeam->entities[0]->current_hp,
            "player_final_hp_2" => $this->playerTeam->entities[1]->current_hp,
            "opponent_final_hp_1" => $this->opponentTeam->entities[0]->current_hp,
            "opponent_final_hp_2" => $this->opponentTeam->entities[1]->current_hp,
            "winner" => $winner,
            "result" => $result,
            "xp_awarded" => $xp_awarded,
            "log" => $this->battleLog
        ];
    }

    private function determineInitiative(GameEntity $entity1, GameEntity $entity2) {
        return 0; // obsolete
    }

    private function applyCardEffect(GameEntity $caster, Card $card, Team $opposingTeam, Team $actingTeam, ?GameEntity $explicitTarget) {
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
            $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->display_name, 'Action Failed', ['card_name' => $card->name, 'reason' => 'No active or valid targets for card effect.']);
            return;
        }

        foreach ($targets as $actualTarget) {
            $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->display_name, 'Applying Effect', ['card_name' => $card->name, 'effect_type' => $effectDetails['type'], 'target' => $actualTarget->display_name]);

            switch ($effectDetails['type']) {
                case 'damage':
                case 'aoe_damage':
                case 'damage_heal':
                    $damageDealt = calculateDamage($effectDetails['damage'], $card->damage_type, $actualTarget->armor_type ?? NULL);
                    $actualTarget->takeDamage($damageDealt, $card->damage_type);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->display_name, 'Deals Damage', ['target' => $actualTarget->display_name, 'amount' => $damageDealt, 'target_hp_after' => $actualTarget->current_hp]);
                    if ($effectDetails['type'] === 'damage_heal') {
                        $caster->heal($effectDetails['heal']);
                        $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->display_name, 'Heals Self', ['amount' => $effectDetails['heal'], 'target_hp_after' => $caster->current_hp]);
                    }
                    break;

                case 'heal':
                    $actualTarget->heal($effectDetails['amount']);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->display_name, 'Heals', ['target' => $actualTarget->display_name, 'amount' => $effectDetails['amount'], 'target_hp_after' => $actualTarget->current_hp]);
                    break;

                case 'buff':
                    BuffManager::applyEffect($actualTarget, $card, $effectDetails);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->display_name, 'Applies Buff', ['target' => $actualTarget->display_name, 'stat' => $effectDetails['stat'], 'amount' => $effectDetails['amount'], 'duration' => $effectDetails['duration']]);
                    break;

                case 'debuff':
                    BuffManager::applyEffect($actualTarget, $card, $effectDetails);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->display_name, 'Applies Debuff', ['target' => $actualTarget->display_name, 'stat' => $effectDetails['stat'], 'amount' => $effectDetails['amount'], 'duration' => $effectDetails['duration']]);
                    break;

                case 'status_effect':
                    BuffManager::applyEffect($actualTarget, $card, $effectDetails);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->display_name, 'Applies Status', ['target' => $actualTarget->display_name, 'effect' => $effectDetails['effect'], 'duration' => $effectDetails['duration']]);
                    break;

                case 'damage_dot':
                    $damageDealt = calculateDamage($effectDetails['damage'], $card->damage_type, $actualTarget->armor_type ?? NULL);
                    $actualTarget->takeDamage($damageDealt, $card->damage_type);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->display_name, 'Deals Damage', ['target' => $actualTarget->display_name, 'amount' => $damageDealt, 'target_hp_after' => $actualTarget->current_hp]);
                    $dotEffect = new StatusEffect($effectDetails['dot_type'], $effectDetails['dot_amount'], $effectDetails['dot_duration'], true, 'dot_damage');
                    $actualTarget->addStatusEffect($dotEffect);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->display_name, 'Applies DOT', ['target' => $actualTarget->display_name, 'type' => $effectDetails['dot_type'], 'amount' => $effectDetails['dot_amount'], 'duration' => $effectDetails['dot_duration']]);
                    break;

                case 'heal_over_time':
                    $hotEffect = new StatusEffect('HoT', $effectDetails['amount_per_turn'], $effectDetails['duration'], false, 'hp_over_time');
                    $actualTarget->addStatusEffect($hotEffect);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->display_name, 'Applies HoT', ['target' => $actualTarget->display_name, 'amount' => $effectDetails['amount_per_turn'], 'duration' => $effectDetails['duration']]);
                    break;

                case 'damage_bypass_defense':
                    $damageDealt = $effectDetails['damage'];
                    $actualTarget->current_hp -= $damageDealt;
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->display_name, 'Deals Bypass Damage', ['target' => $actualTarget->display_name, 'amount' => $damageDealt, 'target_hp_after' => $actualTarget->current_hp]);
                    break;

                case 'damage_random_element':
                case 'damage_random_debuff':
                    $elements = $effectDetails['elements'];
                    $chosenElement = $elements[array_rand($elements)];
                    $damageDealt = calculateDamage($effectDetails['damage'], $chosenElement, $actualTarget->armor_type ?? NULL);
                    $actualTarget->takeDamage($damageDealt, $chosenElement);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->display_name, 'Deals Random Elemental Damage', ['target' => $actualTarget->display_name, 'amount' => $damageDealt, 'element' => $chosenElement, 'target_hp_after' => $actualTarget->current_hp]);
                    if ($effectDetails['type'] === 'damage_random_debuff') {
                        $debuffs = $effectDetails['debuff_types'];
                        $chosenDebuff = $debuffs[array_rand($debuffs)];
                        $debuffEffect = new StatusEffect($chosenDebuff, null, $effectDetails['duration'], true);
                        $actualTarget->addStatusEffect($debuffEffect);
                        $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->display_name, 'Applies Random Debuff', ['target' => $actualTarget->display_name, 'debuff' => $chosenDebuff, 'duration' => $effectDetails['duration']]);
                    }
                    break;

                case 'damage_self_debuff':
                    $damageDealt = calculateDamage($effectDetails['damage'], $card->damage_type, $actualTarget->armor_type ?? NULL);
                    $actualTarget->takeDamage($damageDealt, $card->damage_type);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->display_name, 'Deals Damage', ['target' => $actualTarget->display_name, 'amount' => $damageDealt, 'target_hp_after' => $actualTarget->current_hp]);
                    BuffManager::applyEffect($caster, $card, $effectDetails);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->display_name, 'Applies Self Debuff', ['stat' => $effectDetails['debuff_stat'], 'amount' => $effectDetails['debuff_amount'], 'duration' => $effectDetails['debuff_duration']]);
                    break;

                case 'damage_conditional':
                    $damageDealt = calculateDamage($effectDetails['damage'], $card->damage_type, $actualTarget->armor_type ?? NULL);
                    $actualTarget->takeDamage($damageDealt, $card->damage_type);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->display_name, 'Deals Conditional Damage', ['target' => $actualTarget->display_name, 'amount' => $damageDealt, 'target_hp_after' => $actualTarget->current_hp]);
                    break;

                case 'energy_gain':
                    $actualTarget->current_energy = min($actualTarget->current_energy + $effectDetails['amount'], 4);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->display_name, 'Gains Energy', ['target' => $actualTarget->display_name, 'amount' => $effectDetails['amount'], 'energy_after' => $actualTarget->current_energy]);
                    break;

                case 'extra_action':
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->display_name, 'Gains Extra Action', ['target' => $actualTarget->display_name]);
                    break;

                case 'damage_draw':
                    $damageDealt = calculateDamage($effectDetails['damage'], $card->damage_type, $actualTarget->armor_type ?? NULL);
                    $actualTarget->takeDamage($damageDealt, $card->damage_type);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->display_name, 'Deals Damage', ['target' => $actualTarget->display_name, 'amount' => $damageDealt, 'target_hp_after' => $actualTarget->current_hp]);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->display_name, 'Draws Card', ['amount' => $effectDetails['draw_count']]);
                    break;

                case 'damage_energy_steal':
                    $damageDealt = calculateDamage($effectDetails['damage'], $card->damage_type, $actualTarget->armor_type ?? NULL);
                    $actualTarget->takeDamage($damageDealt, $card->damage_type);
                    $caster->current_energy = min($caster->current_energy + $effectDetails['energy_amount'], 4);
                    $actualTarget->current_energy = max(0, $actualTarget->current_energy - $effectDetails['energy_amount']);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->display_name, 'Steals Energy', ['target' => $actualTarget->display_name, 'amount' => $effectDetails['energy_amount'], 'caster_energy' => $caster->current_energy, 'target_energy' => $actualTarget->current_energy]);
                    break;

                case 'damage_debuff':
                    $damageDealt = calculateDamage($effectDetails['damage'], $card->damage_type, $actualTarget->armor_type ?? NULL);
                    $actualTarget->takeDamage($damageDealt, $card->damage_type);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->display_name, 'Deals Damage', ['target' => $actualTarget->display_name, 'amount' => $damageDealt, 'target_hp_after' => $actualTarget->current_hp]);
                    $debuffEffect = new StatusEffect($effectDetails['debuff_stat'], $effectDetails['debuff_amount'], $effectDetails['debuff_duration'], true, $effectDetails['debuff_stat']);
                    $actualTarget->addStatusEffect($debuffEffect);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->display_name, 'Applies Debuff', ['target' => $actualTarget->display_name, 'stat' => $effectDetails['debuff_stat'], 'amount' => $effectDetails['debuff_amount'], 'duration' => $effectDetails['debuff_duration']]);
                    break;

                case 'damage_reduction':
                    $reductionEffect = new StatusEffect('Defense Boost', $effectDetails['amount'], $effectDetails['duration'], false, 'defense_reduction');
                    $actualTarget->addStatusEffect($reductionEffect);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->display_name, 'Gains Defense', ['target' => $actualTarget->display_name, 'amount' => $effectDetails['amount'], 'duration' => $effectDetails['duration']]);
                    break;

                case 'magic_damage_reduction':
                    $reductionEffect = new StatusEffect('Magic Defense Boost', $effectDetails['amount'], $effectDetails['duration'], false, 'magic_defense_reduction');
                    $actualTarget->addStatusEffect($reductionEffect);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->display_name, 'Gains Magic Defense', ['target' => $actualTarget->display_name, 'amount' => $effectDetails['amount'], 'duration' => $effectDetails['duration']]);
                    break;

                case 'block':
                    $blockEffect = new StatusEffect('Block', $effectDetails['amount'], 1, false, 'block_incoming');
                    $actualTarget->addStatusEffect($blockEffect);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->display_name, 'Applies Block', ['target' => $actualTarget->display_name, 'amount' => $effectDetails['amount']]);
                    break;

                case 'block_magic':
                    $blockEffect = new StatusEffect('Block Magic', $effectDetails['amount'], 1, false, 'block_magic_incoming');
                    $actualTarget->addStatusEffect($blockEffect);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->display_name, 'Applies Magic Block', ['target' => $actualTarget->display_name, 'amount' => $effectDetails['amount']]);
                    break;

                case 'stun':
                    $stunEffect = new StatusEffect('Stun', null, $effectDetails['duration'] ?? 1, true);
                    $actualTarget->addStatusEffect($stunEffect);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->display_name, 'Applies Stun', ['target' => $actualTarget->display_name, 'duration' => $effectDetails['duration'] ?? 1]);
                    break;

                case 'root':
                    $rootEffect = new StatusEffect('Root', null, $effectDetails['duration'] ?? 1, true);
                    $actualTarget->addStatusEffect($rootEffect);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->display_name, 'Applies Root', ['target' => $actualTarget->display_name, 'duration' => $effectDetails['duration'] ?? 1]);
                    break;

                case 'slow':
                    $slowEffect = new StatusEffect('Slow', $effectDetails['amount'] ?? 1, $effectDetails['duration'] ?? 1, true, 'speed');
                    $actualTarget->addStatusEffect($slowEffect);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->display_name, 'Applies Status', ['target' => $actualTarget->display_name, 'effect' => 'Slow', 'duration' => $effectDetails['duration'] ?? 1]);
                    break;

                case 'confuse':
                    $confEffect = new StatusEffect('Confuse', null, $effectDetails['duration'] ?? 1, true);
                    $actualTarget->addStatusEffect($confEffect);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->display_name, 'Applies Status', ['target' => $actualTarget->display_name, 'effect' => 'Confuse', 'duration' => $effectDetails['duration'] ?? 1]);
                    break;

                case 'shock':
                    $shockEffect = new StatusEffect('Shock', null, $effectDetails['duration'] ?? 1, true);
                    $actualTarget->addStatusEffect($shockEffect);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->display_name, 'Applies Status', ['target' => $actualTarget->display_name, 'effect' => 'Shock', 'duration' => $effectDetails['duration'] ?? 1]);
                    break;

                case 'fear':
                    $fearEffect = new StatusEffect('Fear', $effectDetails['amount'] ?? 1, $effectDetails['duration'] ?? 1, true, 'attack');
                    $actualTarget->addStatusEffect($fearEffect);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->display_name, 'Applies Status', ['target' => $actualTarget->display_name, 'effect' => 'Fear', 'duration' => $effectDetails['duration'] ?? 1]);
                    break;

                case 'attack_down':
                    $atkDebuff = new StatusEffect('Attack Down', $effectDetails['amount'], $effectDetails['duration'], true, 'attack');
                    $actualTarget->addStatusEffect($atkDebuff);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->display_name, 'Applies Debuff', ['target' => $actualTarget->display_name, 'stat' => 'attack', 'amount' => $effectDetails['amount'], 'duration' => $effectDetails['duration']]);
                    break;

                case 'defense_down':
                    $defDebuff = new StatusEffect('Defense Down', $effectDetails['amount'], $effectDetails['duration'], true, 'defense');
                    $actualTarget->addStatusEffect($defDebuff);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->display_name, 'Applies Debuff', ['target' => $actualTarget->display_name, 'stat' => 'defense', 'amount' => $effectDetails['amount'], 'duration' => $effectDetails['duration']]);
                    break;

                case 'vulnerable':
                    $vuln = new StatusEffect('Vulnerable', $effectDetails['amount'], $effectDetails['duration'], true, 'vulnerable');
                    $actualTarget->addStatusEffect($vuln);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->display_name, 'Applies Vulnerable', ['target' => $actualTarget->display_name, 'amount' => $effectDetails['amount'], 'duration' => $effectDetails['duration']]);
                    break;

                case 'evasion_buff':
                    $evasionBuff = new StatusEffect('Evasion Buff', $effectDetails['amount'], $effectDetails['duration'], false, 'evasion');
                    $actualTarget->addStatusEffect($evasionBuff);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->display_name, 'Applies Evasion', ['target' => $actualTarget->display_name, 'amount' => $effectDetails['amount'], 'duration' => $effectDetails['duration']]);
                    break;

                case 'speed_buff':
                    $speedBuff = new StatusEffect('Speed Buff', $effectDetails['amount'], $effectDetails['duration'], false, 'speed');
                    $actualTarget->addStatusEffect($speedBuff);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->display_name, 'Applies Speed', ['target' => $actualTarget->display_name, 'amount' => $effectDetails['amount'], 'duration' => $effectDetails['duration']]);
                    break;

                case 'crit_chance_buff':
                    $critBuff = new StatusEffect('Crit Chance', $effectDetails['amount'], $effectDetails['duration'], false, 'crit_chance');
                    $actualTarget->addStatusEffect($critBuff);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->display_name, 'Applies Crit Chance', ['target' => $actualTarget->display_name, 'amount' => $effectDetails['amount'], 'duration' => $effectDetails['duration']]);
                    break;

                case 'total_immunity':
                    $immunity = new StatusEffect('Total Immunity', null, $effectDetails['duration'], false, 'total_immunity');
                    $actualTarget->addStatusEffect($immunity);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->display_name, 'Applies Immunity', ['target' => $actualTarget->display_name, 'duration' => $effectDetails['duration']]);
                    break;

                case 'aoe_damage_debuff':
                    $damageDealt = calculateDamage($effectDetails['damage'], $card->damage_type, $actualTarget->armor_type ?? NULL);
                    $actualTarget->takeDamage($damageDealt, $card->damage_type);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->display_name, 'Deals Damage', ['target' => $actualTarget->display_name, 'amount' => $damageDealt, 'target_hp_after' => $actualTarget->current_hp]);
                    $debuff = new StatusEffect($effectDetails['debuff_stat'], $effectDetails['debuff_amount'], $effectDetails['debuff_duration'], true, $effectDetails['debuff_stat']);
                    $actualTarget->addStatusEffect($debuff);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->display_name, 'Applies Debuff', ['target' => $actualTarget->display_name, 'stat' => $effectDetails['debuff_stat'], 'amount' => $effectDetails['debuff_amount'], 'duration' => $effectDetails['debuff_duration']]);
                    break;

                case 'aoe_damage_dot':
                    $damageDealt = calculateDamage($effectDetails['damage'], $card->damage_type, $actualTarget->armor_type ?? NULL);
                    $actualTarget->takeDamage($damageDealt, $card->damage_type);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->display_name, 'Deals Damage', ['target' => $actualTarget->display_name, 'amount' => $damageDealt, 'target_hp_after' => $actualTarget->current_hp]);
                    $dot = new StatusEffect($effectDetails['dot_type'], $effectDetails['dot_amount'], $effectDetails['dot_duration'], true, 'dot_damage');
                    $actualTarget->addStatusEffect($dot);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->display_name, 'Applies DOT', ['target' => $actualTarget->display_name, 'type' => $effectDetails['dot_type'], 'amount' => $effectDetails['dot_amount'], 'duration' => $effectDetails['dot_duration']]);
                    break;

                case 'extra_actions_next_turn':
                    $extra = new StatusEffect('Extra Actions', $effectDetails['amount'] ?? 1, 1, false, 'extra_actions_next_turn');
                    $actualTarget->addStatusEffect($extra);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->display_name, 'Gains Extra Actions Next Turn', ['target' => $actualTarget->display_name, 'amount' => $effectDetails['amount'] ?? 1]);
                    break;

                case 'buff_extra_action_immunity':
                    $buff = new StatusEffect('Extra Action Immunity', null, $effectDetails['duration'] ?? 1, false, 'extra_action_immunity');
                    $actualTarget->addStatusEffect($buff);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->display_name, 'Applies Buff', ['target' => $actualTarget->display_name, 'stat' => 'extra_action_immunity', 'duration' => $effectDetails['duration'] ?? 1]);
                    break;

                case 'taunt_buff':
                    $taunt = new StatusEffect('Taunt', null, $effectDetails['duration'] ?? 1, false, 'taunt');
                    $actualTarget->addStatusEffect($taunt);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->display_name, 'Applies Taunt', ['target' => $actualTarget->display_name, 'duration' => $effectDetails['duration'] ?? 1]);
                    break;

                case 'summon':
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->display_name, 'Summons Ally', ['target' => $actualTarget->display_name, 'summon' => $effectDetails['summon_name'] ?? 'unknown']);
                    break;

                case 'prevent_defeat':
                    $effect = new StatusEffect('Prevent Defeat', null, $effectDetails['duration'] ?? 1, false, 'prevent_defeat');
                    $actualTarget->addStatusEffect($effect);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->display_name, 'Prevents Defeat', ['target' => $actualTarget->display_name, 'duration' => $effectDetails['duration'] ?? 1]);
                    break;

                case 'full_heal':
                    $healAmount = $actualTarget->max_hp - $actualTarget->current_hp;
                    $actualTarget->heal($healAmount);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->display_name, 'Heals', ['target' => $actualTarget->display_name, 'amount' => $healAmount, 'target_hp_after' => $actualTarget->current_hp]);
                    break;

                case 'revive':
                    if ($actualTarget->current_hp <= 0) {
                        $reviveAmount = $effectDetails['amount'] ?? $actualTarget->max_hp;
                        $actualTarget->current_hp = min($reviveAmount, $actualTarget->max_hp);
                        $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->display_name, 'Revives', ['target' => $actualTarget->display_name, 'amount' => $actualTarget->current_hp]);
                    }
                    break;

                case 'aoe_heal_cleanse':
                    $actualTarget->heal($effectDetails['heal']);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->display_name, 'Heals', ['target' => $actualTarget->display_name, 'amount' => $effectDetails['heal'], 'target_hp_after' => $actualTarget->current_hp]);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->display_name, 'Cleanses Debuffs', ['target' => $actualTarget->display_name]);
                    break;

                case 'aoe_heal_buff':
                    $actualTarget->heal($effectDetails['heal']);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->display_name, 'Heals', ['target' => $actualTarget->display_name, 'amount' => $effectDetails['heal'], 'target_hp_after' => $actualTarget->current_hp]);
                    BuffManager::applyEffect($actualTarget, $card, $effectDetails);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->display_name, 'Applies Buff', ['target' => $actualTarget->display_name, 'stat' => $effectDetails['buff_stat'], 'amount' => $effectDetails['buff_amount'], 'duration' => $effectDetails['duration']]);
                    break;

                case 'initiative_manipulation':
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->display_name, 'Manipulates Initiative', ['target' => $actualTarget->display_name]);
                    break;

                case 'untargetable':
                case 'untargetable_buff':
                    $statusEffect = new StatusEffect('Untargetable', null, $effectDetails['duration'], false, 'untargetable');
                    $actualTarget->addStatusEffect($statusEffect);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->display_name, 'Becomes Untargetable', ['target' => $actualTarget->display_name, 'duration' => $effectDetails['duration']]);
                    break;

                case 'mind_control':
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->display_name, 'Mind Controls', ['target' => $actualTarget->display_name, 'duration' => $effectDetails['duration']]);
                    break;

                case 'conditional_damage_modifier':
                    $buffEffect = new StatusEffect('Damage Modifier', $effectDetails['modifier_type'], $effectDetails['duration'], false, 'damage_modifier');
                    $caster->addStatusEffect($buffEffect);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->display_name, 'Gains Conditional Damage Boost', ['target' => $caster->display_name, 'modifier' => $effectDetails['modifier_type'], 'duration' => $effectDetails['duration']]);
                    break;

                default:
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->display_name, 'Unhandled Effect', ['card_name' => $card->name, 'effect_type' => $effectDetails['type']]);
                    break;
            }
        }
    }
}
?>
