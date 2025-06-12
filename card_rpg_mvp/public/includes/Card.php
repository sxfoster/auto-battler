<?php
// includes/Card.php

class Card {
    public $id;
    public $name;
    public $card_type; // ability, armor, weapon, item
    public $rarity;
    public $energy_cost;
    public $description;
    public $damage_type;
    public $armor_type; // For armor cards
    public $class_affinity; // Comma-separated string
    public $flavor_text;
    public $effect_details; // Decoded JSON object

    public function __construct($data) {
        $this->id = $data['id'];
        $this->name = $data['name'];
        $this->card_type = $data['card_type'];
        $this->rarity = $data['rarity'];
        $this->energy_cost = $data['energy_cost'];
        $this->description = $data['description'];
        $this->damage_type = $data['damage_type'] ?? NULL;
        $this->armor_type = $data['armor_type'] ?? NULL;
        $this->class_affinity = $data['class_affinity'] ?? NULL;
        $this->flavor_text = $data['flavor_text'] ?? NULL;
        $this->effect_details = $data['effect_details']; // Already decoded JSON
    }

    // Method to check if card is usable by a specific class
    public function isUsableByClass($championName) {
        if ($this->class_affinity === NULL) { // Items have NULL affinity
            return true;
        }
        $affinities = explode(',', $this->class_affinity);
        return in_array($championName, $affinities);
    }

    // Return array representation for safe JSON serialization
    public function toArray() {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'card_type' => $this->card_type,
            'rarity' => $this->rarity,
            'energy_cost' => $this->energy_cost,
            'description' => $this->description,
            'damage_type' => $this->damage_type,
            'armor_type' => $this->armor_type,
            'class_affinity' => $this->class_affinity,
            'flavor_text' => $this->flavor_text,
            'effect_details' => $this->effect_details
        ];
    }
}
?>
