<?php
// public/api/player_current_setup.php

// Adjust path based on your server's directory structure
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/utils.php';

header('Content-Type: application/json');

$database = new Database();
$db = $database->getConnection();

try {
    $stmt = $db->query("SELECT
        psd.champion_id, c1.name as champion_name_1, c1.role as champion_role_1, c1.starting_hp as champion_max_hp_1, c1.speed as champion_base_speed_1, psd.deck_card_ids, psd.champion_hp_1, psd.champion_energy_1, psd.champion_speed_1,
        psd.champion_id_2, c2.name as champion_name_2, c2.role as champion_role_2, c2.starting_hp as champion_max_hp_2, c2.speed as champion_base_speed_2, psd.deck_card_ids_2, psd.champion_hp_2, psd.champion_energy_2, psd.champion_speed_2,
        psd.wins, psd.losses, psd.current_xp, psd.current_level
    FROM player_session_data psd
    JOIN champions c1 ON psd.champion_id = c1.id
    JOIN champions c2 ON psd.champion_id_2 = c2.id
    LIMIT 1");
    $playerData = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($playerData) {
        $playerData['deck_card_ids'] = json_decode($playerData['deck_card_ids'], true);
        $playerData['deck_card_ids_2'] = json_decode($playerData['deck_card_ids_2'], true);
        $playerData['champion_name_1_display'] = $playerData['champion_name_1'] . ' Alpha';
        $playerData['champion_name_2_display'] = $playerData['champion_name_2'] . ' Beta';
        sendResponse($playerData);
    } else {
        sendError("No player setup found. Please go through setup first.", 404);
    }
} catch (PDOException $e) {
    sendError("Database error fetching current player setup: " . $e->getMessage(), 500);
}
?>
