<?php
// includes/BattleSimulator.php

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/GameEntity.php';
require_once __DIR__ . '/Champion.php';
require_once __DIR__ . '/Monster.php';
require_once __DIR__ . '/Card.php';
require_once __DIR__ . '/StatusEffect.php';
require_once __DIR__ . '/BuffManager.php';
require_once __DIR__ . '/AIPlayer.php';
require_once __DIR__ . '/utils.php'; // For logging functions

class BattleSimulator {
    private $db_conn;
    private $battleLog = [];
    private $player; // Champion object
    private $opponent; // Monster object
    private $aiPlayer; // AIPlayer object for opponent

    public function __construct() {
        $database = new Database();
        $this->db_conn = $database->getConnection();
    }

    private function logAction($turn, $actorName, $actionType, $details = []) {
        $this->battleLog[] = createBattleLogEntry($turn, $actorName, $actionType, $details);
    }

    public function simulateBattle($playerChampionData, $opponentMonsterId) {
        // 1. Initialize Player Champion
        $this->player = new Champion($playerChampionData);
        // Load full card data for player's deck
        $playerFullDeckCards = [];
        if (!empty($playerChampionData['deck_card_ids'])) {
            $cardIdsPlaceholder = implode(',', array_fill(0, count($playerChampionData['deck_card_ids']), '?'));
            $stmt = $this->db_conn->prepare("SELECT id, name, card_type, rarity, energy_cost, description, damage_type, armor_type, class_affinity, effect_details, flavor_text FROM cards WHERE id IN ($cardIdsPlaceholder)");
            $stmt->execute($playerChampionData['deck_card_ids']);
            $playerDeckData = $stmt->fetchAll(PDO::FETCH_ASSOC);
            foreach ($playerDeckData as $cardData) {
                $playerFullDeckCards[] = new Card(array_merge($cardData, ['effect_details' => json_decode($cardData['effect_details'], true)]));
            }
        }
        $this->player->deck = $playerFullDeckCards;
        $this->player->hand = $playerFullDeckCards; // For MVP, entire deck is hand

        // 2. Initialize Opponent Monster & AI
        $stmt = $this->db_conn->prepare("SELECT id, name, role, starting_hp, speed FROM monsters WHERE id = :id");
        $stmt->bindParam(':id', $opponentMonsterId, PDO::PARAM_INT);
        $stmt->execute();
        $aiMonsterData = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$aiMonsterData) {
            sendError("Opponent monster not found.", 500); // Should not happen if data is good
        }
        $this->opponent = new Monster($aiMonsterData);
        // Assign a random AI persona (for MVP, let's pick aggressive by default or random from DB)
        $randomPersonaStmt = $this->db_conn->query("SELECT id FROM ai_personas ORDER BY RAND() LIMIT 1");
        $personaId = $randomPersonaStmt->fetchColumn();
        $this->aiPlayer = new AIPlayer($personaId);

        // Load AI Monster's cards (random 3 common ability cards for MVP)
        $aiCardsStmt = $this->db_conn->prepare("SELECT id, name, card_type, rarity, energy_cost, description, damage_type, armor_type, effect_details, flavor_text FROM cards WHERE card_type = 'ability' AND rarity = 'Common' ORDER BY RAND() LIMIT 3");
        $aiCardsStmt->execute();
        $aiDeckData = $aiCardsStmt->fetchAll(PDO::FETCH_ASSOC);
        $aiFullDeckCards = [];
        foreach ($aiDeckData as $cardData) {
            $aiFullDeckCards[] = new Card(array_merge($cardData, ['effect_details' => json_decode($cardData['effect_details'], true)]));
        }
        $this->opponent->deck = $aiFullDeckCards;
        $this->opponent->hand = $aiFullDeckCards; // For MVP, entire deck is hand


        $turn = 0;
        $maxTurns = 50; // Max turns to prevent infinite loops

        $this->logAction(0, "System", "Battle Start", [
            "player" => ["name" => $this->player->name, "hp" => $this->player->current_hp, "speed" => $this->player->current_speed],
            "opponent" => ["name" => $this->opponent->name, "hp" => $this->opponent->current_hp, "speed" => $this->opponent->current_speed]
        ]);

        while ($this->player->current_hp > 0 && $this->opponent->current_hp > 0 && $turn < $maxTurns) {
            $turn++;
            $this->logAction($turn, "System", "Turn Start");

            // 1. Reset temporary stats and apply active buffs/debuffs
            $this->player->resetTemporaryStats();
            $this->opponent->resetTemporaryStats();
            BuffManager::updateEntityStats($this->player);
            BuffManager::updateEntityStats($this->opponent);

            // 2. Initiative Phase: Determine turn order
            $turnOrder = $this->determineInitiative($this->player, $this->opponent);
            
            foreach ($turnOrder as $activeEntity) {
                if ($activeEntity->current_hp <= 0) { // Check if entity is still alive
                    $this->logAction($turn, $activeEntity->name, "Skipped Turn", ["reason" => "Defeated"]);
                    continue;
                }
                // Check for Stun effect (GDD: Stun - Effect: Target skips their next action.)
                $isStunned = false;
                foreach($activeEntity->debuffs as $effect) {
                    if ($effect->type === 'Stun') {
                        $this->logAction($turn, $activeEntity->name, "Skipped Turn", ["reason" => "Stunned"]);
                        $isStunned = true;
                        break;
                    }
                }
                if ($isStunned) continue;

                $this->logAction($turn, $activeEntity->name, "Turn Action", ["energy_before" => $activeEntity->current_energy]);

                // 3. Energy Gain Phase
                $activeEntity->current_energy = min($activeEntity->current_energy + 1, 4); // Capped at 4 as per GDD progression
                $this->logAction($turn, $activeEntity->name, "Energy Gain", ["energy_gained" => 1, "energy_after" => $activeEntity->current_energy]);

                // 4. Action Phase (Play Cards)
                $chosenAction = null;
                if ($activeEntity->id === $this->player->id) {
                    // Player's turn (since auto-battle, player AI is simple)
                    $chosenAction = $this->aiPlayer->decideAction($this->player, $this->opponent, $this->player->hand);
                } else {
                    // Opponent's turn
                    $chosenAction = $this->aiPlayer->decideAction($this->opponent, $this->player, $this->opponent->hand);
                }

                if ($chosenAction && $activeEntity->current_energy >= $chosenAction['card']->energy_cost) {
                    $card = $chosenAction['card'];
                    $target = $chosenAction['target'];
                    $energyBefore = $activeEntity->current_energy;
                    $activeEntity->current_energy -= $card->energy_cost;

                    $this->logAction($turn, $activeEntity->name, "Plays Card", [
                        "card_name" => $card->name,
                        "energy_spent" => $card->energy_cost,
                        "energy_before" => $energyBefore,
                        "energy_after" => $activeEntity->current_energy,
                        "target" => $target->name
                    ]);

                    // Apply card effect (this is where BuffManager will shine)
                    // This is a placeholder for complex card effect application based on effect_details JSON
                    // The BuffManager::applyEffect needs to be greatly expanded to handle all GDD card types
                    if ($card->effect_details) {
                        $this->applyCardEffect($activeEntity, $target, $card); // New helper method
                    }

                } else {
                    $this->logAction($turn, $activeEntity->name, "Passes Turn", ["reason" => "No affordable cards or valid action"]);
                }

                // Check for immediate defeat after action
                if ($this->player->current_hp <= 0 || $this->opponent->current_hp <= 0) {
                    break;
                }
            }
            
            // 5. Resolution Phase (End of Turn Effects, DOTs, Decrement Durations)
            BuffManager::decrementDurations($this->player); // This will also apply DOTs
            BuffManager::decrementDurations($this->opponent);
            
            // Re-check defeat after DOTs
            if ($this->player->current_hp <= 0 || $this->opponent->current_hp <= 0) {
                break;
            }
            
            $this->logAction($turn, "System", "Turn End", [
                "player_hp_after_turn" => $this->player->current_hp,
                "opponent_hp_after_turn" => $this->opponent->current_hp
            ]);
        }

        // 6. Determine Winner
        $winner = null;
        $result = 'draw';
        if ($this->player->current_hp <= 0 && $this->opponent->current_hp > 0) {
            $winner = $this->opponent->name;
            $result = 'loss';
        } elseif ($this->opponent->current_hp <= 0 && $this->player->current_hp > 0) {
            $winner = $this->player->name;
            $result = 'win';
        } elseif ($this->player->current_hp <= 0 && $this->opponent->current_hp <= 0) {
            $winner = 'None (Double KO)'; // Or specific tie-breaker
            $result = 'loss'; // For MVP, double KO means player loss
        } else {
             $winner = 'None (Max Turns)'; // Max turns reached, still a draw
             $result = 'draw'; // Could be 'loss' for player in a competitive context
        }

        $xp_awarded = ($result === 'win' ? 60 : 30); // From GDD: Game Modes - 1.2. XP Rewards Per Match

        $this->logAction($turn, "System", "Battle End", ["winner" => $winner, "result" => $result]);

        return [
            "message" => "Battle simulated.",
            "player_name" => $this->player->name,
            "opponent_name" => $this->opponent->name,
            "player_final_hp" => $this->player->current_hp,
            "opponent_final_hp" => $this->opponent->current_hp,
            "winner" => $winner,
            "result" => $result,
            "xp_awarded" => $xp_awarded,
            "log" => $this->battleLog
        ];
    }

    // Helper to determine initiative based on speed
    private function determineInitiative(GameEntity $entity1, GameEntity $entity2) {
        // GDD: Battle System - 5. Initiative System: Determines turn order based on agility or dice rolls.
        // For MVP, simple speed comparison. No dice yet.
        if ($entity1->current_speed > $entity2->current_speed) {
            return [$entity1, $entity2];
        } elseif ($entity2->current_speed > $entity1->current_speed) {
            return [$entity2, $entity1];
        } else {
            // Tie-breaker (e.g., random, or player advantage)
            return [$entity1, $entity2]; // Player first in case of tie for MVP
        }
    }

    // This method needs significant expansion to correctly parse and apply all card effects
    private function applyCardEffect(GameEntity $caster, GameEntity $target, Card $card) {
        $effectDetails = $card->effect_details;
        if (!$effectDetails) {
            return;
        }

        $actualTarget = $target;
        if (isset($effectDetails['target'])) {
            if (in_array($effectDetails['target'], ['self', 'single_ally', 'all_allies'])) {
                $actualTarget = $caster;
            } elseif (in_array($effectDetails['target'], ['single_enemy', 'all_enemies'])) {
                $actualTarget = $target;
            }
        }

        $turn = $this->battleLog[count($this->battleLog)-1]['turn'];
        $this->logAction($turn, $caster->name, 'Applying Effect', [
            'card_name' => $card->name,
            'effect_type' => $effectDetails['type'],
            'target' => $actualTarget->name
        ]);

        switch ($effectDetails['type']) {
            case 'damage':
                $damageDealt = calculateDamage($effectDetails['damage'], $card->damage_type, $actualTarget->armor_type ?? NULL);
                $actualTarget->takeDamage($damageDealt);
                $this->logAction($turn, $caster->name, 'Deals Damage', [
                    'target' => $actualTarget->name,
                    'amount' => $damageDealt,
                    'target_hp_after' => $actualTarget->current_hp
                ]);
                break;

            case 'heal':
                $actualTarget->heal($effectDetails['amount']);
                $this->logAction($turn, $caster->name, 'Heals', [
                    'target' => $actualTarget->name,
                    'amount' => $effectDetails['amount'],
                    'target_hp_after' => $actualTarget->current_hp
                ]);
                break;

            case 'damage_heal':
                $damageDealt = calculateDamage($effectDetails['damage'], $card->damage_type, $actualTarget->armor_type ?? NULL);
                $actualTarget->takeDamage($damageDealt);
                $this->logAction($turn, $caster->name, 'Deals Damage', [
                    'target' => $actualTarget->name,
                    'amount' => $damageDealt,
                    'target_hp_after' => $actualTarget->current_hp
                ]);
                $caster->heal($effectDetails['heal']);
                $this->logAction($turn, $caster->name, 'Heals Self', [
                    'amount' => $effectDetails['heal'],
                    'target_hp_after' => $caster->current_hp
                ]);
                break;

            case 'damage_dot':
                $damageDealt = calculateDamage($effectDetails['damage'], $card->damage_type, $actualTarget->armor_type ?? NULL);
                $actualTarget->takeDamage($damageDealt);
                $this->logAction($turn, $caster->name, 'Deals Damage', [
                    'target' => $actualTarget->name,
                    'amount' => $damageDealt,
                    'target_hp_after' => $actualTarget->current_hp
                ]);
                $dotEffect = new StatusEffect($effectDetails['dot_type'], $effectDetails['dot_amount'], $effectDetails['dot_duration'], true);
                $actualTarget->addStatusEffect($dotEffect);
                $this->logAction($turn, $caster->name, 'Applies DOT', [
                    'target' => $actualTarget->name,
                    'type' => $effectDetails['dot_type'],
                    'amount' => $effectDetails['dot_amount'],
                    'duration' => $effectDetails['dot_duration']
                ]);
                break;

            case 'aoe_damage':
                $damageDealt = calculateDamage($effectDetails['damage'], $card->damage_type, $actualTarget->armor_type ?? NULL);
                $actualTarget->takeDamage($damageDealt);
                $this->logAction($turn, $caster->name, 'Deals AOE Damage', [
                    'target' => $actualTarget->name,
                    'amount' => $damageDealt,
                    'target_hp_after' => $actualTarget->current_hp
                ]);
                break;

            case 'damage_bypass_defense':
                $damageDealt = $effectDetails['damage'];
                $actualTarget->current_hp -= $damageDealt;
                $this->logAction($turn, $caster->name, 'Deals Bypass Damage', [
                    'target' => $actualTarget->name,
                    'amount' => $damageDealt,
                    'target_hp_after' => $actualTarget->current_hp
                ]);
                break;

            case 'damage_random_element':
                $elements = $effectDetails['elements'];
                $chosenElement = $elements[array_rand($elements)];
                $damageDealt = calculateDamage($effectDetails['damage'], $chosenElement, $actualTarget->armor_type ?? NULL);
                $actualTarget->takeDamage($damageDealt);
                $this->logAction($turn, $caster->name, 'Deals Random Elemental Damage', [
                    'target' => $actualTarget->name,
                    'amount' => $damageDealt,
                    'element' => $chosenElement,
                    'target_hp_after' => $actualTarget->current_hp
                ]);
                break;

            case 'damage_self_debuff':
                $damageDealt = calculateDamage($effectDetails['damage'], $card->damage_type, $actualTarget->armor_type ?? NULL);
                $actualTarget->takeDamage($damageDealt);
                $this->logAction($turn, $caster->name, 'Deals Damage', [
                    'target' => $actualTarget->name,
                    'amount' => $damageDealt,
                    'target_hp_after' => $actualTarget->current_hp
                ]);
                $debuffEffect = new StatusEffect($effectDetails['debuff_stat'], $effectDetails['debuff_amount'], $effectDetails['debuff_duration'], true, $effectDetails['debuff_stat']);
                $caster->addStatusEffect($debuffEffect);
                $this->logAction($turn, $caster->name, 'Applies Self Debuff', [
                    'stat' => $debuffEffect->stat_affected,
                    'amount' => $debuffEffect->amount,
                    'duration' => $debuffEffect->duration
                ]);
                break;

            case 'heal_over_time':
                $hotEffect = new StatusEffect('HoT', $effectDetails['amount_per_turn'], $effectDetails['duration'], false, 'hp');
                $actualTarget->addStatusEffect($hotEffect);
                $this->logAction($turn, $caster->name, 'Applies HoT', [
                    'target' => $actualTarget->name,
                    'amount' => $effectDetails['amount_per_turn'],
                    'duration' => $effectDetails['duration']
                ]);
                break;

            case 'buff':
                BuffManager::applyEffect($actualTarget, $card, $effectDetails);
                $this->logAction($turn, $caster->name, 'Applies Buff', [
                    'target' => $actualTarget->name,
                    'stat' => $effectDetails['stat'],
                    'amount' => $effectDetails['amount'],
                    'duration' => $effectDetails['duration']
                ]);
                break;

            case 'status_effect':
                $statusEffect = new StatusEffect($effectDetails['effect'], null, $effectDetails['duration'], true);
                $actualTarget->addStatusEffect($statusEffect);
                $this->logAction($turn, $caster->name, 'Applies Status', [
                    'target' => $actualTarget->name,
                    'effect' => $effectDetails['effect'],
                    'duration' => $effectDetails['duration']
                ]);
                break;

            case 'block':
                $blockEffect = new StatusEffect('Block', $effectDetails['amount'], 1, false, 'block_incoming');
                $caster->addStatusEffect($blockEffect);
                $this->logAction($turn, $caster->name, 'Applies Block', [
                    'amount' => $effectDetails['amount']
                ]);
                break;

            default:
                $this->logAction($turn, $caster->name, 'Unhandled Effect', [
                    'card_name' => $card->name,
                    'effect_type' => $effectDetails['type']
                ]);
                break;
        }
    }
}
?>
