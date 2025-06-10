<?php
// includes/AIPlayer.php

require_once INCLUDES_PATH . '/Card.php';
require_once INCLUDES_PATH . '/GameEntity.php';
require_once INCLUDES_PATH . '/db.php'; // To fetch persona data

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
     * @param GameEntity $playerEntity The human player's entity.
     * @param Card[] $availableCards The cards currently in the AI entity's hand/deck.
     * @return array|null Returns ['card' => Card object, 'target' => GameEntity object] or null if no action.
     */
    public function decideAction(GameEntity $aiEntity, GameEntity $playerEntity, array $availableCards) {
        $chosenCard = null;
        $chosenTarget = null;
        $bestScore = -1;

        $targetPriorities = $this->persona['target_priority'];
        $cardPriorities = $this->persona['card_priority'];

        // Filter for affordable cards
        $affordableCards = array_filter($availableCards, function($card) use ($aiEntity) {
            return $aiEntity->current_energy >= $card->energy_cost;
        });

        if (empty($affordableCards)) {
            return null; // Cannot afford any cards
        }

        foreach ($cardPriorities as $priorityType) {
            foreach ($affordableCards as $card) {
                $score = 0;

                // Score cards based on persona's card priorities
                if ($priorityType === 'damage' && ($card->card_type === 'ability' || $card->card_type === 'weapon')) {
                    // Placeholder: Check effect_details for damage type
                    if (isset($card->effect_details['type']) && (strpos($card->effect_details['type'], 'damage') !== false)) {
                         $score += 10; // High score for damage cards
                         if (isset($card->effect_details['aoe_damage'])) $score += 5; // Bonus for AOE
                    }
                } elseif ($priorityType === 'defense' && $card->card_type === 'armor') {
                    if (isset($card->effect_details['type']) && (strpos($card->effect_details['type'], 'reduction') !== false || strpos($card->effect_details['type'], 'block') !== false || strpos($card->effect_details['type'], 'immunity') !== false)) {
                        $score += 8; // High score for defense cards
                    }
                } elseif ($priorityType === 'heal' && $card->card_type === 'item') {
                     if (isset($card->effect_details['type']) && (strpos($card->effect_details['type'], 'heal') !== false)) {
                        $score += 7;
                        if ($aiEntity->current_hp / $aiEntity->max_hp < ($this->persona['buff_use_threshold'] ?? 0.5)) { // Use threshold for buffs/healing
                            $score += 5; // Bonus if low HP
                        }
                     }
                }
                // ... more complex scoring based on GDD details for other card types/effects

                // Target selection (simplistic for MVP)
                $targetCandidate = null;
                if ($card->card_type === 'ability' || $card->card_type === 'weapon' || $card->card_type === 'item') {
                    if (strpos($card->effect_details['type'] ?? '', 'damage') !== false) {
                         // Damaging cards target based on target_priority (lowest_hp for aggressive)
                         if ($targetPriorities === 'lowest_hp') {
                            $targetCandidate = ($playerEntity->current_hp <= $aiEntity->current_hp) ? $playerEntity : $aiEntity; // Simple low HP check
                         } else {
                            $targetCandidate = $playerEntity; // Default to player
                         }
                    } elseif (strpos($card->effect_details['type'] ?? '', 'heal') !== false || strpos($card->effect_details['type'] ?? '', 'buff') !== false) {
                        // Healing/buffing cards target based on persona (self_lowest_hp for defensive)
                        if ($targetPriorities === 'self_lowest_hp') {
                            $targetCandidate = ($aiEntity->current_hp < $aiEntity->max_hp) ? $aiEntity : null; // Only heal if not full HP
                        } else {
                            $targetCandidate = $aiEntity; // Default to self
                        }
                    }
                }
                
                // Ensure chosen target is valid and alive
                if ($targetCandidate && $targetCandidate->current_hp > 0) {
                    if ($score > $bestScore) {
                        $bestScore = $score;
                        $chosenCard = $card;
                        $chosenTarget = $targetCandidate;
                    }
                }
            }
        }
        
        if ($chosenCard) {
            return ['card' => $chosenCard, 'target' => $chosenTarget];
        }

        return null; // No suitable action found
    }
}
?>
