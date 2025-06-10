<?php
// public/includes/Team.php

require_once __DIR__ . '/GameEntity.php';

class Team {
    public $entities = []; // Array of GameEntity objects (Champion or Monster)
    public $isPlayerTeam; // Boolean: true if this is the player's team, false for AI
    public $currentTeamHp;
    public $maxTeamHp;

    public function __construct(bool $isPlayerTeam = false) {
        $this->isPlayerTeam = $isPlayerTeam;
        $this->currentTeamHp = 0;
        $this->maxTeamHp = 0;
    }

    public function addEntity(GameEntity $entity) {
        $this->entities[] = $entity;
        $entity->team = $this;
        $entity->isPlayerTeam = $this->isPlayerTeam;
        $this->updateTeamHp();
    }

    public function updateTeamHp() {
        $this->currentTeamHp = 0;
        $this->maxTeamHp = 0;
        foreach ($this->entities as $entity) {
            $this->currentTeamHp += $entity->current_hp;
            $this->maxTeamHp += $entity->max_hp;
        }
    }

    public function isDefeated(): bool {
        foreach ($this->entities as $entity) {
            if ($entity->current_hp > 0) {
                return false;
            }
        }
        return true;
    }

    public function getRandomActiveEntity(): ?GameEntity {
        $active = array_filter($this->entities, function($e) {
            return $e->current_hp > 0;
        });
        if (empty($active)) return null;
        return $active[array_rand($active)];
    }

    public function getLowestHpActiveEntity(): ?GameEntity {
        $lowest = null;
        $lowestHp = PHP_INT_MAX;
        foreach ($this->entities as $entity) {
            if ($entity->current_hp > 0 && $entity->current_hp < $lowestHp) {
                $lowestHp = $entity->current_hp;
                $lowest = $entity;
            }
        }
        return $lowest;
    }

    public function getActiveEntities(): array {
        return array_values(array_filter($this->entities, function($e) {
            return $e->current_hp > 0;
        }));
    }
}
?>
