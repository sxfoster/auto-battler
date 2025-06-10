<?php
// public/api/cards_common_by_type.php

// Adjust path based on your server's directory structure
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/utils.php';

header('Content-Type: application/json');

$database = new Database();
$db = $database->getConnection();

$cardType = $_GET['type'] ?? '';
$classAffinity = $_GET['class'] ?? '';

if (empty($cardType)) {
    sendError("Card type is required.", 400);
}

try {
    $query = "SELECT id, name, card_type, rarity, energy_cost, description, damage_type, armor_type, effect_details, flavor_text
              FROM cards
              WHERE rarity = 'Common' AND card_type = :card_type";

    if (!empty($classAffinity)) {
        // Include cards with matching affinity or generic (NULL) affinity
        $query .= " AND (FIND_IN_SET(:class_affinity_name, class_affinity) > 0 OR class_affinity IS NULL)";
    }

    $stmt = $db->prepare($query);
    $stmt->bindParam(':card_type', $cardType);
    if (!empty($classAffinity)) {
        $stmt->bindParam(':class_affinity_name', $classAffinity);
    }
    $stmt->execute();
    $cards = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($cards as &$card) {
        if ($card['effect_details']) {
            $card['effect_details'] = json_decode($card['effect_details'], true);
        }
    }
    sendResponse($cards);

} catch (PDOException $e) {
    sendError("Database error fetching cards: " . $e->getMessage(), 500);
}
?>
