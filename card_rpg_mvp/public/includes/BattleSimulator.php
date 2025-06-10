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
            "player_team_names" => array_map(fn($e) => $e->name, $playerTeam->entities),
            "player_initial_hp_1" => $playerTeam->entities[0]->current_hp,
            "player_initial_hp_2" => $playerTeam->entities[1]->current_hp,
            "opponent_team_names" => array_map(fn($e) => $e->name, $opponentTeam->entities),
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
                    $this->logAction($turn, $actor->name, "Skipped Turn", ["reason" => "Defeated"]);
                    continue;
                }
                $isStunned = false;
                foreach ($actor->debuffs as $effect) {
                    if ($effect->type === 'Stun') { $isStunned = true; break; }
                }
                if ($isStunned) {
                    $this->logAction($turn, $actor->name, "Skipped Turn", ["reason"=>"Stunned"]);
                    continue;
                }

                $this->logAction($turn, $actor->name, "Turn Action", ["energy_before" => $actor->current_energy]);
                $actor->current_energy = min($actor->current_energy + 1, 4);
                $this->logAction($turn, $actor->name, "Energy Gain", ["energy_gained"=>1, "energy_after"=>$actor->current_energy]);

                $actingTeam = $actor->team;
                $opposingTeam = ($actingTeam === $this->playerTeam) ? $this->opponentTeam : $this->playerTeam;
                $chosen = $this->aiPlayer->decideAction($actor, $actingTeam, $opposingTeam, $actor->hand);
                if ($chosen && $actor->current_energy >= $chosen['card']->energy_cost) {
                    $card = $chosen['card'];
                    $actor->current_energy -= $card->energy_cost;
                    $this->logAction($turn, $actor->name, "Plays Card", ["card_name"=>$card->name, "energy_spent"=>$card->energy_cost]);
                    $this->applyCardEffect($actor, $card, $opposingTeam, $actingTeam, $chosen['target_entity'] ?? null);
                } else {
                    $this->logAction($turn, $actor->name, "Passes Turn", ["reason"=>"No affordable cards or valid action"]);
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
            $winner = $this->opponentTeam->entities[0]->name . " & " . $this->opponentTeam->entities[1]->name . " (Team)";
            $result = 'loss';
        } elseif (!$this->playerTeam->isDefeated() && $this->opponentTeam->isDefeated()) {
            $winner = $this->playerTeam->entities[0]->name . " & " . $this->playerTeam->entities[1]->name . " (Team)";
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

    private function applyCardEffect(GameEntity $caster, Card $card, Team $opposingTeam, Team $actingTeam, ?GameEntity $chosenTargetEntity) {
        $effectDetails = $card->effect_details;
        if (!$effectDetails) return;

        $targets = [];
        if (isset($effectDetails['target'])) {
            switch ($effectDetails['target']) {
                case 'self':
                    $targets = [$caster];
                    break;
                case 'single_ally':
                    $targets = [$chosenTargetEntity ?? ($actingTeam->getLowestHpActiveEntity() ?: $caster)];
                    break;
                case 'all_allies':
                    $targets = $actingTeam->getActiveEntities();
                    break;
                case 'single_enemy':
                case 'random_enemy':
                    $targets = [$chosenTargetEntity ?? $opposingTeam->getRandomActiveEntity()];
                    break;
                case 'all_enemies':
                    $targets = $opposingTeam->getActiveEntities();
                    break;
                default:
                    $targets = [$chosenTargetEntity ?? $opposingTeam->getRandomActiveEntity()];
                    break;
            }
        } elseif ($chosenTargetEntity) {
            $targets = [$chosenTargetEntity];
        } else {
            $targets = [$opposingTeam->getRandomActiveEntity()];
        }
        $targets = array_filter($targets);
        if (empty($targets)) {
            $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->name, "Action Failed", ["card_name"=>$card->name, "reason"=>"No valid targets"]);
            return;
        }

        foreach ($targets as $target) {
            $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->name, "Applying Effect", ["card_name"=>$card->name, "effect_type"=>$effectDetails['type'], "target"=>$target->name]);
            switch ($effectDetails['type']) {
                case 'damage':
                    $d = calculateDamage($effectDetails['damage'], $card->damage_type, $target->armor_type ?? null);
                    $target->takeDamage($d);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->name, 'Deals Damage', ['target'=>$target->name,'amount'=>$d,'target_hp_after'=>$target->current_hp]);
                    break;
                case 'heal':
                    $target->heal($effectDetails['amount']);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->name, 'Heals', ['target'=>$target->name,'amount'=>$effectDetails['amount'],'target_hp_after'=>$target->current_hp]);
                    break;
                case 'damage_heal':
                    $d = calculateDamage($effectDetails['damage'], $card->damage_type, $target->armor_type ?? null);
                    $target->takeDamage($d);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->name,'Deals Damage',['target'=>$target->name,'amount'=>$d,'target_hp_after'=>$target->current_hp]);
                    $caster->heal($effectDetails['heal']);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'], $caster->name,'Heals Self',['amount'=>$effectDetails['heal'],'target_hp_after'=>$caster->current_hp]);
                    break;
                case 'damage_dot':
                    $d = calculateDamage($effectDetails['damage'], $card->damage_type, $target->armor_type ?? null);
                    $target->takeDamage($d);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'],$caster->name,'Deals Damage',['target'=>$target->name,'amount'=>$d,'target_hp_after'=>$target->current_hp]);
                    $dot = new StatusEffect($effectDetails['dot_type'],$effectDetails['dot_amount'],$effectDetails['dot_duration'],true);
                    $target->addStatusEffect($dot);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'],$caster->name,'Applies DOT',['target'=>$target->name,'type'=>$effectDetails['dot_type'],'amount'=>$effectDetails['dot_amount'],'duration'=>$effectDetails['dot_duration']]);
                    break;
                case 'aoe_damage':
                    $d = calculateDamage($effectDetails['damage'], $card->damage_type, $target->armor_type ?? null);
                    $target->takeDamage($d);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'],$caster->name,'Deals AOE Damage',['target'=>$target->name,'amount'=>$d,'target_hp_after'=>$target->current_hp]);
                    break;
                case 'damage_bypass_defense':
                    $d = $effectDetails['damage'];
                    $target->current_hp -= $d;
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'],$caster->name,'Deals Bypass Damage',['target'=>$target->name,'amount'=>$d,'target_hp_after'=>$target->current_hp]);
                    break;
                case 'damage_random_element':
                    $elements = $effectDetails['elements'];
                    $chosen = $elements[array_rand($elements)];
                    $d = calculateDamage($effectDetails['damage'], $chosen, $target->armor_type ?? null);
                    $target->takeDamage($d);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'],$caster->name,'Deals Random Elemental Damage',['target'=>$target->name,'amount'=>$d,'element'=>$chosen,'target_hp_after'=>$target->current_hp]);
                    break;
                case 'damage_self_debuff':
                    $d = calculateDamage($effectDetails['damage'], $card->damage_type, $target->armor_type ?? null);
                    $target->takeDamage($d);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'],$caster->name,'Deals Damage',['target'=>$target->name,'amount'=>$d,'target_hp_after'=>$target->current_hp]);
                    $debuff = new StatusEffect($effectDetails['debuff_stat'],$effectDetails['debuff_amount'],$effectDetails['debuff_duration'],true,$effectDetails['debuff_stat']);
                    $caster->addStatusEffect($debuff);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'],$caster->name,'Applies Self Debuff',['stat'=>$debuff->stat_affected,'amount'=>$debuff->amount,'duration'=>$debuff->duration]);
                    break;
                case 'heal_over_time':
                    $hot = new StatusEffect('HoT',$effectDetails['amount_per_turn'],$effectDetails['duration'],false,'hp');
                    $target->addStatusEffect($hot);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'],$caster->name,'Applies HoT',['target'=>$target->name,'amount'=>$effectDetails['amount_per_turn'],'duration'=>$effectDetails['duration']]);
                    break;
                case 'buff':
                    BuffManager::applyEffect($target,$card,$effectDetails);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'],$caster->name,'Applies Buff',['target'=>$target->name,'stat'=>$effectDetails['stat'],'amount'=>$effectDetails['amount'],'duration'=>$effectDetails['duration']]);
                    break;
                case 'status_effect':
                    $statusEffect = new StatusEffect($effectDetails['effect'], null, $effectDetails['duration'], true);
                    $target->addStatusEffect($statusEffect);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'],$caster->name,'Applies Status',['target'=>$target->name,'effect'=>$effectDetails['effect'],'duration'=>$effectDetails['duration']]);
                    break;
                case 'block':
                    $blockEffect = new StatusEffect('Block', $effectDetails['amount'], 1, false, 'block_incoming');
                    $caster->addStatusEffect($blockEffect);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'],$caster->name,'Applies Block',['amount'=>$effectDetails['amount']]);
                    break;
                case 'damage_reduction':
                    $reduction = new StatusEffect('Defense Boost',$effectDetails['amount'],$effectDetails['duration'],false,'defense_reduction');
                    $target->addStatusEffect($reduction);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'],$caster->name,'Gains Defense',['target'=>$target->name,'amount'=>$effectDetails['amount'],'duration'=>$effectDetails['duration']]);
                    break;
                case 'magic_damage_reduction':
                    $reduction = new StatusEffect('Magic Defense Boost',$effectDetails['amount'],$effectDetails['duration'],false,'magic_defense_reduction');
                    $target->addStatusEffect($reduction);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'],$caster->name,'Gains Magic Defense',['target'=>$target->name,'amount'=>$effectDetails['amount'],'duration'=>$effectDetails['duration']]);
                    break;
                case 'block_magic':
                    $blockEffect = new StatusEffect('Block Magic',$effectDetails['amount'],1,false,'block_magic_incoming');
                    $target->addStatusEffect($blockEffect);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'],$caster->name,'Applies Magic Block',['target'=>$target->name,'amount'=>$effectDetails['amount']]);
                    break;
                case 'damage_draw':
                    $d = calculateDamage($effectDetails['damage'], $card->damage_type, $target->armor_type ?? null);
                    $target->takeDamage($d);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'],$caster->name,'Deals Damage',['target'=>$target->name,'amount'=>$d,'target_hp_after'=>$target->current_hp]);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'],$caster->name,'Draws Card',['amount'=>$effectDetails['draw_count']]);
                    break;
                case 'damage_energy_steal':
                    $d = calculateDamage($effectDetails['damage'], $card->damage_type, $target->armor_type ?? null);
                    $target->takeDamage($d);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'],$caster->name,'Deals Damage',['target'=>$target->name,'amount'=>$d,'target_hp_after'=>$target->current_hp]);
                    $caster->current_energy = min($caster->current_energy + $effectDetails['energy_amount'],4);
                    $target->current_energy = max(0,$target->current_energy - $effectDetails['energy_amount']);
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'],$caster->name,'Steals Energy',['target'=>$target->name,'amount'=>$effectDetails['energy_amount'],'caster_energy'=>$caster->current_energy,'target_energy'=>$target->current_energy]);
                    break;
                default:
                    $this->logAction($this->battleLog[count($this->battleLog)-1]['turn'],$caster->name,'Unhandled Effect',['card_name'=>$card->name,'effect_type'=>$effectDetails['type']]);
                    break;
            }
        }
    }
}
?>
