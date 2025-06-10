<?php
// includes/Monster.php

require_once __DIR__ . '/GameEntity.php';

class Monster extends GameEntity {
    public $monster_id; // FK to monsters table
    public $is_player_monster = false; // Flag if this is a player-controlled monster (for future)

    public function __construct($data) {
        parent::__construct(
            $data['id'], // Use monster id as entity ID
            $data['name'],
            $data['starting_hp'],
            $data['speed'],
            $data['role'] ?? 'unknown' // Role might not be in base monsters table
        );
        $this->monster_id = $data['id'];
        // Monsters might have special properties like taking 2 team slots (from GDD)
        // This would be handled by BattleSimulator or team management logic
    }
    
    // Monster specific methods
}
?>
