<?php
// includes/AIPlayer.php

require_once __DIR__ . '/Card.php';
require_once __DIR__ . '/GameEntity.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/Team.php';

class AIPlayer {
    private $persona;
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
            // fallback aggressive persona
            $this->persona = json_decode('{"card_priority":["damage","heal","defense","utility"],"target_priority":"lowest_hp_enemy","damage_card_score_multiplier":1,"aoe_damage_bonus_score":5,"lethal_damage_bonus_score":10,"heal_use_threshold":0.5,"defense_use_threshold":0.5}', true);
            error_log("AI Persona ID {$personaId} not found. Defaulting to Aggressive.");
        }
    }

    public function decideAction(GameEntity $activeEntity, Team $actingTeam, Team $opposingTeam, array $availableCards) {
        $affordableCards = array_filter($availableCards, function($c) use ($activeEntity) {
            return $activeEntity->current_energy >= $c->energy_cost;
        });
        if (empty($affordableCards)) {
            return null;
        }

        $priorities = $this->persona['card_priority'] ?? ['damage','heal','defense','utility'];
        $targetPref = $this->persona['target_priority'] ?? 'lowest_hp_enemy';

        foreach ($priorities as $priorityType) {
            usort($affordableCards, function($a, $b) use ($priorityType, $activeEntity, $opposingTeam) {
                $sa = $this->scoreCard($a, $priorityType, $activeEntity, $opposingTeam);
                $sb = $this->scoreCard($b, $priorityType, $activeEntity, $opposingTeam);
                return $sb <=> $sa;
            });

            foreach ($affordableCards as $card) {
                $targets = $this->getPotentialTargets($activeEntity, $card, $actingTeam, $opposingTeam);
                $targets = array_filter($targets, fn($t) => $t instanceof GameEntity && $t->current_hp > 0);
                if (empty($targets)) {
                    continue;
                }
                $chosen = $this->selectBestTarget($activeEntity, $targets, $targetPref);
                if ($chosen) {
                    return ['card' => $card, 'target_entity' => $chosen];
                }
            }
        }
        return null;
    }

    private function scoreCard(Card $card, string $priorityType, GameEntity $caster, Team $opposingTeam): float {
        $type = $card->effect_details['type'] ?? '';
        $score = 0;

        switch ($priorityType) {
            case 'damage':
                if (strpos($type, 'damage') !== false) {
                    $dmg = $card->effect_details['damage'] ?? 0;
                    $score += $dmg * ($this->persona['damage_card_score_multiplier'] ?? 1);
                    if (strpos($type, 'aoe') !== false) {
                        $score += $this->persona['aoe_damage_bonus_score'] ?? 0;
                    }
                    $lowest = $opposingTeam->getLowestHpActiveEntity();
                    if ($lowest && $dmg >= $lowest->current_hp) {
                        $score += $this->persona['lethal_damage_bonus_score'] ?? 0;
                    }
                }
                break;

            case 'heal':
                if (strpos($type, 'heal') !== false) {
                    $amount = $card->effect_details['amount'] ?? ($card->effect_details['heal'] ?? 0);
                    $ratio = $caster->current_hp / $caster->max_hp;
                    if ($ratio < ($this->persona['heal_use_threshold'] ?? 0.5)) {
                        $score += $amount * 5;
                    }
                }
                break;

            case 'defense':
                if (strpos($type, 'reduction') !== false || strpos($type, 'block') !== false || strpos($type, 'immunity') !== false) {
                    $score += 10;
                }
                break;

            case 'utility':
                $score += 1;
                break;
        }
        return $score;
    }

    private function selectBestTarget(GameEntity $activeEntity, array $targets, string $priorityType): ?GameEntity {
        if (empty($targets)) return null;
        if ($priorityType === 'lowest_hp_enemy') {
            $enemies = array_filter($targets, fn($t) => $t->team !== $activeEntity->team);
            if ($enemies) {
                usort($enemies, fn($a, $b) => $a->current_hp <=> $b->current_hp);
                return $enemies[0];
            }
        } elseif ($priorityType === 'lowest_hp_ally') {
            $allies = array_filter($targets, fn($t) => $t->team === $activeEntity->team);
            if ($allies) {
                usort($allies, fn($a, $b) => $a->current_hp <=> $b->current_hp);
                return $allies[0];
            }
        }
        return $targets[array_rand($targets)];
    }

    private function getPotentialTargets(GameEntity $caster, Card $card, Team $actingTeam, Team $opposingTeam): array {
        $effectDetails = $card->effect_details;
        $tType = $effectDetails['target'] ?? null;
        switch ($tType) {
            case 'self':
                return [$caster];
            case 'single_ally':
            case 'all_allies':
                return $actingTeam->getActiveEntities();
            case 'single_enemy':
            case 'random_enemy':
            case 'all_enemies':
                return $opposingTeam->getActiveEntities();
            default:
                if ($card->card_type === 'armor' || (strpos($effectDetails['type'] ?? '', 'buff') !== false && strpos($effectDetails['type'] ?? '', 'damage') === false)) {
                    return [$caster];
                }
                if ($card->card_type === 'weapon' || strpos($effectDetails['type'] ?? '', 'damage') !== false) {
                    return $opposingTeam->getActiveEntities();
                }
                return [$caster];
        }
    }
}
?>
