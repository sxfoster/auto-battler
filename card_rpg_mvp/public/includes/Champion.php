<?php
// includes/Champion.php

require_once __DIR__ . '/GameEntity.php';

class Champion extends GameEntity {
    public $champion_id; // FK to champions table
    public $level;
    public $xp;

    public function __construct($data) {
        parent::__construct(
            $data['champion_id'], // Use champion_id as entity ID
            $data['champion_name'],
            $data['starting_hp'],
            $data['speed'],
            $data['role'] // Assuming role is passed from champions table
        );
        $this->champion_id = $data['champion_id'];
        $this->level = $data['current_level'] ?? 1;
        $this->xp = $data['current_xp'] ?? 0;
        // Load actual cards for the deck
        // This is handled in the BattleSimulator for MVP
    }
    
    // Champion specific methods (e.g., levelUp, equipCard)
}
?>
