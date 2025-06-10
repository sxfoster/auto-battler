<?php
// public/api/player_setup.php

// Adjust path based on your server's directory structure
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/utils.php';

header('Content-Type: application/json');

$database = new Database();
$db = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError("Invalid request method. Only POST is allowed.", 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$championId1 = $input['champion_id_1'] ?? null;
$cardIds1 = $input['card_ids_1'] ?? [];
$championId2 = $input['champion_id_2'] ?? null;
$cardIds2 = $input['card_ids_2'] ?? [];

if (empty($championId1) || count($cardIds1) !== 3 || empty($championId2) || count($cardIds2) !== 3) {
    sendError("Invalid setup data provided. Requires two champion_ids and two arrays of 3 card_ids each.", 400);
}

try {
    // --- Validate Champion 1 ---
    $stmt1 = $db->prepare("SELECT id, name, starting_hp, speed, role FROM champions WHERE id = :champion_id");
    $stmt1->bindParam(':champion_id', $championId1, PDO::PARAM_INT);
    $stmt1->execute();
    $champion1Data = $stmt1->fetch(PDO::FETCH_ASSOC);
    if (!$champion1Data) {
        sendError("Champion ID 1 not found.", 404);
    }

    // --- Validate Champion 2 ---
    $stmt2 = $db->prepare("SELECT id, name, starting_hp, speed, role FROM champions WHERE id = :champion_id");
    $stmt2->bindParam(':champion_id', $championId2, PDO::PARAM_INT);
    $stmt2->execute();
    $champion2Data = $stmt2->fetch(PDO::FETCH_ASSOC);
    if (!$champion2Data) {
        sendError("Champion ID 2 not found.", 404);
    }

    // --- Validate Cards for Champion 1 ---
    $cardIdsPlaceholder1 = implode(',', array_fill(0, count($cardIds1), '?'));
    $stmtCards1 = $db->prepare("SELECT id, name, card_type, class_affinity FROM cards WHERE id IN ($cardIdsPlaceholder1) AND rarity = 'Common'");
    $stmtCards1->execute($cardIds1);
    $fetchedCards1 = $stmtCards1->fetchAll(PDO::FETCH_ASSOC);
    if (count($fetchedCards1) !== 3) {
        sendError("One or more card IDs for Champion 1 are invalid or not common cards.", 400);
    }
    foreach ($fetchedCards1 as $card) {
        if ($card['card_type'] !== 'item' && $card['class_affinity'] !== NULL) {
            if (!(strpos($card['class_affinity'], $champion1Data['name']) !== false || $card['class_affinity'] === $champion1Data['name'])) {
                sendError("Card '{$card['name']}' is not usable by {$champion1Data['name']}.", 400);
            }
        }
    }

    // --- Validate Cards for Champion 2 ---
    $cardIdsPlaceholder2 = implode(',', array_fill(0, count($cardIds2), '?'));
    $stmtCards2 = $db->prepare("SELECT id, name, card_type, class_affinity FROM cards WHERE id IN ($cardIdsPlaceholder2) AND rarity = 'Common'");
    $stmtCards2->execute($cardIds2);
    $fetchedCards2 = $stmtCards2->fetchAll(PDO::FETCH_ASSOC);
    if (count($fetchedCards2) !== 3) {
        sendError("One or more card IDs for Champion 2 are invalid or not common cards.", 400);
    }
    foreach ($fetchedCards2 as $card) {
        if ($card['card_type'] !== 'item' && $card['class_affinity'] !== NULL) {
            if (!(strpos($card['class_affinity'], $champion2Data['name']) !== false || $card['class_affinity'] === $champion2Data['name'])) {
                sendError("Card '{$card['name']}' is not usable by {$champion2Data['name']}.", 400);
            }
        }
    }

    // Clear any old player session data (for MVP simplicity)
    $db->exec("DELETE FROM player_session_data");

    // Store player's selected champions and decks
    $stmt = $db->prepare("INSERT INTO player_session_data (
        champion_id, deck_card_ids, current_hp, current_energy, current_speed,
        champion_id_2, deck_card_ids_2, champion_hp_1, champion_hp_2, champion_energy_1, champion_energy_2, champion_speed_1, champion_speed_2,
        wins, losses, current_xp, current_level
    ) VALUES (
        :champion_id_1, :deck_card_ids_1, :current_hp_1, :current_energy_1, :current_speed_1,
        :champion_id_2, :deck_card_ids_2, :champion_hp_1, :champion_hp_2, :champion_energy_1, :champion_energy_2, :champion_speed_1, :champion_speed_2,
        :wins, :losses, :current_xp, :current_level
    )");

    $deckJson1 = json_encode($cardIds1);
    $deckJson2 = json_encode($cardIds2);

    $stmt->bindParam(':champion_id_1', $champion1Data['id']);
    $stmt->bindParam(':deck_card_ids_1', $deckJson1);
    $stmt->bindParam(':current_hp_1', $champion1Data['starting_hp']);
    $stmt->bindValue(':current_energy_1', 1);
    $stmt->bindParam(':current_speed_1', $champion1Data['speed']);

    $stmt->bindParam(':champion_id_2', $champion2Data['id']);
    $stmt->bindParam(':deck_card_ids_2', $deckJson2);
    $stmt->bindParam(':champion_hp_1', $champion1Data['starting_hp']);
    $stmt->bindParam(':champion_hp_2', $champion2Data['starting_hp']);
    $stmt->bindValue(':champion_energy_1', 1);
    $stmt->bindValue(':champion_energy_2', 1);
    $stmt->bindParam(':champion_speed_1', $champion1Data['speed']);
    $stmt->bindParam(':champion_speed_2', $champion2Data['speed']);

    $stmt->bindValue(':wins', 0);
    $stmt->bindValue(':losses', 0);
    $stmt->bindValue(':current_xp', 0);
    $stmt->bindValue(':current_level', 1);

    $stmt->execute();

    sendResponse([
        "message" => "Player team setup complete.",
        "champion_1" => ["id" => $champion1Data['id'], "name" => $champion1Data['name'], "deck_ids" => $cardIds1],
        "champion_2" => ["id" => $champion2Data['id'], "name" => $champion2Data['name'], "deck_ids" => $cardIds2]
    ]);

} catch (PDOException $e) {
    sendError("Database error during player setup: " . $e->getMessage(), 500);
} catch (Exception $e) {
    sendError("Error during player setup: " . $e->getMessage(), 500);
}
?>
