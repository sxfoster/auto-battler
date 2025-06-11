<?php
// includes/AIPlayer.php

require_once __DIR__ . '/Card.php';
require_once __DIR__ . '/GameEntity.php';
require_once __DIR__ . '/db.php'; // To fetch persona data

class AIPlayer {
    private $persona; // AI Persona object (from db)
    private $db_conn;

    public function __construct($personaId) {
        $database = new Database();
        $this->db_conn = $database->getConnection();
        $this->loadPersona($personaId);
    }

    private function loadPersona($personaId) {
        $stmt = $this->db_conn->prepare("SELECT priorities FROM ai_personas WHERE id = :id");
        $stmt->bindParam(':id', $personaId, PDO::PARAM_INT);
        $stmt->execute();
        $personaData = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($personaData) {
            $this->persona = json_decode($personaData['priorities'], true);
        } else {
            // Default to Aggressive if persona not found
            $this->persona = json_decode('{"card_priority": ["damage", "direct_damage", "aoe_damage"], "target_priority": "lowest_hp", "buff_use_threshold": 0.2, "item_use_priority": ["offense"] }', true);
            error_log("AI Persona ID {$personaId} not found. Defaulting to Aggressive.");
        }
    }

    /**
     * Decides which card an AI entity should play and on whom.
     * @param GameEntity $aiEntity The AI-controlled entity.
     * @param Team $actingTeam The team the entity belongs to.
     * @param Team $opposingTeam The enemy team.
     * @param Card[] $availableCards The cards currently in the AI entity's hand/deck.
     * @return array|null Returns ['card' => Card object, 'target' => GameEntity object] or null if no action.
     */
    public function decideAction(GameEntity $activeEntity, Team $actingTeam, Team $opposingTeam, array $availableCards) {
        $bestAction = null;
        $bestScore = -1;

        $targetPriorities = $this->persona['target_priority'] ?? 'random';
        $cardPriorities = $this->persona['card_priority'] ?? ['damage', 'heal', 'defense', 'utility'];

        $affordableCards = array_filter($availableCards, function($card) use ($activeEntity) {
            return $activeEntity->current_energy >= $card->energy_cost;
        });

        if (empty($affordableCards)) {
            return null; // Cannot afford any cards
        }

        foreach ($cardPriorities as $priorityType) {
            usort($affordableCards, function($a, $b) use ($priorityType, $activeEntity, $opposingTeam) {
                $scoreA = 0; $scoreB = 0;

                if ($priorityType === 'damage') {
                    if (strpos($a->effect_details['type'] ?? '', 'damage') !== false) {
                        $damage = $a->effect_details['damage'] ?? 0;
                        $scoreA += $damage * 100;
                        if (isset($a->effect_details['aoe_damage'])) $scoreA += 50;
                        $lowest = $opposingTeam->getLowestHpActiveEntity();
                        if ($lowest) {
                            $ratio = $lowest->current_hp / $lowest->max_hp;
                            $scoreA += (1 - $ratio) * 50;
                        }
                    }
                }
                if ($priorityType === 'defense') {
                    if (strpos($a->effect_details['type'] ?? '', 'reduction') !== false || strpos($a->effect_details['type'] ?? '', 'block') !== false || strpos($a->effect_details['type'] ?? '', 'immunity') !== false) {
                        $scoreA += 10;
                        if ($activeEntity->current_hp / $activeEntity->max_hp < ($this->persona['buff_use_threshold'] ?? 0.5)) $scoreA += 20;
                        $ally = $activeEntity->team->getLowestHpActiveEntity();
                        if ($ally && $ally->current_hp / $ally->max_hp < ($this->persona['buff_use_threshold'] ?? 0.5)) $scoreA += 15;
                    }
                }
                if ($priorityType === 'heal') {
                    if (strpos($a->effect_details['type'] ?? '', 'heal') !== false) {
                        $heal = $a->effect_details['amount'] ?? 0;
                        $scoreA += $heal * 10;
                        if ($activeEntity->current_hp / $activeEntity->max_hp < ($this->persona['buff_use_threshold'] ?? 0.5)) $scoreA += 30;
                        $ally = $activeEntity->team->getLowestHpActiveEntity();
                        if ($ally && $ally->current_hp / $ally->max_hp < ($this->persona['buff_use_threshold'] ?? 0.5)) $scoreA += 25;
                    }
                }

                if ($priorityType === 'damage') {
                    if (strpos($b->effect_details['type'] ?? '', 'damage') !== false) {
                        $damage = $b->effect_details['damage'] ?? 0;
                        $scoreB += $damage * 100;
                        if (isset($b->effect_details['aoe_damage'])) $scoreB += 50;
                        $lowest = $opposingTeam->getLowestHpActiveEntity();
                        if ($lowest) {
                            $ratio = $lowest->current_hp / $lowest->max_hp;
                            $scoreB += (1 - $ratio) * 50;
                        }
                    }
                }
                if ($priorityType === 'defense') {
                    if (strpos($b->effect_details['type'] ?? '', 'reduction') !== false || strpos($b->effect_details['type'] ?? '', 'block') !== false || strpos($b->effect_details['type'] ?? '', 'immunity') !== false) {
                        $scoreB += 10;
                        if ($activeEntity->current_hp / $activeEntity->max_hp < ($this->persona['buff_use_threshold'] ?? 0.5)) $scoreB += 20;
                        $ally = $activeEntity->team->getLowestHpActiveEntity();
                        if ($ally && $ally->current_hp / $ally->max_hp < ($this->persona['buff_use_threshold'] ?? 0.5)) $scoreB += 15;
                    }
                }
                if ($priorityType === 'heal') {
                    if (strpos($b->effect_details['type'] ?? '', 'heal') !== false) {
                        $heal = $b->effect_details['amount'] ?? 0;
                        $scoreB += $heal * 10;
                        if ($activeEntity->current_hp / $activeEntity->max_hp < ($this->persona['buff_use_threshold'] ?? 0.5)) $scoreB += 30;
                        $ally = $activeEntity->team->getLowestHpActiveEntity();
                        if ($ally && $ally->current_hp / $ally->max_hp < ($this->persona['buff_use_threshold'] ?? 0.5)) $scoreB += 25;
                    }
                }

                return $scoreB - $scoreA;
            });

            foreach ($affordableCards as $card) {
                $potentialTargets = [];
                $cardTargetType = $card->effect_details['target'] ?? null; // Get target type from card data

                switch ($cardTargetType) {
                    case 'self':
                        $potentialTargets = [$activeEntity];
                        break;
                    case 'single_ally':
                    case 'all_allies':
                        $potentialTargets = $actingTeam->getActiveEntities(); // Get all active allies
                        break;
                    case 'single_enemy':
                    case 'random_enemy':
                    case 'all_enemies':
                        $potentialTargets = $opposingTeam->getActiveEntities(); // Get all active enemies
                        break;
                    default:
                        if ($card->card_type === 'armor' || (strpos($card->effect_details['type'] ?? '', 'buff') !== false && !strpos($card->effect_details['type'] ?? '', 'damage') !== false)) {
                            $potentialTargets = [$activeEntity];
                        } elseif ($card->card_type === 'weapon' || strpos($card->effect_details['type'] ?? '', 'damage') !== false) {
                            $potentialTargets = $opposingTeam->getActiveEntities();
                        } else {
                            $potentialTargets = [$activeEntity];
                        }
                        break;
                }
                
                $potentialTargets = array_filter($potentialTargets, fn($t) => $t instanceof GameEntity && $t->current_hp > 0);

                if (empty($potentialTargets)) {
                    continue; // Cannot play card if no valid targets
                }

                $chosenTargetEntity = null;
                if (!empty($potentialTargets)) { // Only apply priority if there are targets left
                    if ($targetPriorities === 'lowest_hp') {
                        usort($potentialTargets, fn($a, $b) => $a->current_hp <=> $b->current_hp);
                        $chosenTargetEntity = $potentialTargets[0];
                    } elseif ($targetPriorities === 'highest_hp') {
                        usort($potentialTargets, fn($a, $b) => $b->current_hp <=> $a->current_hp);
                        $chosenTargetEntity = $potentialTargets[0];
                    } else { // Default to random
                        $chosenTargetEntity = $potentialTargets[array_rand($potentialTargets)];
                    }
                }

                if ($chosenTargetEntity) {
                    // We found an affordable card and a valid target for it based on priorities.
                    return ['card' => $card, 'target_entity' => $chosenTargetEntity];
                }
            }
        }
        
        return null; // No suitable action found
    }
}
?>
