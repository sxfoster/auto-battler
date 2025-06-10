<?php
// public/api/player_current_setup.php

// Adjust path based on your server's directory structure
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/utils.php';

header('Content-Type: application/json');

$database = new Database();
$db = $database->getConnection();

try {
    $stmt = $db->query("SELECT psd.champion_id, c.name as champion_name, c.role, c.starting_hp, c.speed, psd.deck_card_ids, psd.current_hp, psd.current_energy, psd.current_speed, psd.wins, psd.losses, psd.current_xp, psd.current_level
                                   FROM player_session_data psd
                                   JOIN champions c ON psd.champion_id = c.id
                                   LIMIT 1");
    $playerData = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($playerData) {
        $playerData['deck_card_ids'] = json_decode($playerData['deck_card_ids'], true);
        sendResponse($playerData);
    } else {
        sendError("No player setup found. Please go through setup first.", 404);
    }
} catch (PDOException $e) {
    sendError("Database error fetching current player setup: " . $e->getMessage(), 500);
}
?>
