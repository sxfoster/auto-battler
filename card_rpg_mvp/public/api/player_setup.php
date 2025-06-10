<?php
// public/api/player_setup.php

// Adjust path based on your server's directory structure
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/utils.php';

header('Content-Type: application/json');

$database = new Database();
$db = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError("Invalid request method. Only POST is allowed.", 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$championId = $input['champion_id'] ?? null;
$cardIds = $input['card_ids'] ?? [];

if (empty($championId) || count($cardIds) !== 3) {
    sendError("Invalid setup data provided. Requires champion_id and 3 card_ids.", 400);
}

try {
    // Check if champion_id exists
    $stmt = $db->prepare("SELECT name, starting_hp, speed FROM champions WHERE id = :champion_id");
    $stmt->bindParam(':champion_id', $championId, PDO::PARAM_INT);
    $stmt->execute();
    $championData = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$championData) {
        sendError("Champion ID not found.", 404);
    }
    $championName = $championData['name'];

    // Check if all card_ids exist and are valid common cards usable by the champion
    $cardIdsPlaceholder = implode(',', array_fill(0, count($cardIds), '?'));
    $stmt = $db->prepare("SELECT id, name, card_type, class_affinity FROM cards WHERE id IN ($cardIdsPlaceholder) AND rarity = 'Common'");
    $stmt->execute($cardIds);
    $fetchedCards = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (count($fetchedCards) !== 3) {
        sendError("One or more card IDs are invalid or not common cards.", 400);
    }

    foreach ($fetchedCards as $card) {
        if ($card['card_type'] === 'ability' || $card['card_type'] === 'armor' || $card['card_type'] === 'weapon') {
            if ($card['class_affinity'] !== NULL) { // Allow NULL for generic items
                $affinities = explode(',', $card['class_affinity']);
                if (!in_array($championName, $affinities)) {
                     sendError("Card '{$card['name']}' is not usable by {$championName}.", 400);
                }
            }
        }
    }

    // Clear any old player session data before inserting new (for MVP simplicity)
    $db->exec("DELETE FROM player_session_data");
    
    // Store player's selected champion and deck for the current tournament run
    $stmt = $db->prepare("INSERT INTO player_session_data (champion_id, deck_card_ids, current_hp, current_energy, current_speed, current_xp, current_level, wins, losses) VALUES (:champion_id, :deck_card_ids, :current_hp, :current_energy, :current_speed, :current_xp, :current_level, :wins, :losses)");
    $deckJson = json_encode($cardIds);

    $stmt->bindParam(':champion_id', $championId);
    $stmt->bindParam(':deck_card_ids', $deckJson);
    $stmt->bindParam(':current_hp', $championData['starting_hp']);
    $stmt->bindValue(':current_energy', 1); // Start with 1 energy
    $stmt->bindParam(':current_speed', $championData['speed']);
    $stmt->bindValue(':current_xp', 0);
    $stmt->bindValue(':current_level', 1);
    $stmt->bindValue(':wins', 0);
    $stmt->bindValue(':losses', 0);

    $stmt->execute();

    sendResponse(["message" => "Player setup complete.", "champion_id" => $championId, "card_ids" => $cardIds]);

} catch (PDOException $e) {
    sendError("Database error during player setup: " . $e->getMessage(), 500);
} catch (Exception $e) {
    sendError("Error during player setup: " . $e->getMessage(), 500);
}
?>
