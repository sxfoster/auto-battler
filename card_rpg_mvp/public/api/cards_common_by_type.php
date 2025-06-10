<?php
// public/api/cards_common_by_type.php

// Adjust path based on your server's directory structure
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/utils.php';

header('Content-Type: application/json');

$database = new Database();
$db = $database->getConnection();

$cardType = $_GET['type'] ?? '';
$classAffinity = $_GET['class'] ?? '';

if (empty($cardType)) {
    sendError("Card type is required.", 400);
}

try {
    $query = "SELECT id, name, energy_cost, description, damage_type, armor_type, effect_details, flavor_text
              FROM cards
              WHERE rarity = 'Common' AND card_type = :card_type";

    if (!empty($classAffinity)) {
        // This handles affinities like 'Warrior', 'Warrior,Paladin', 'Paladin,Warrior,Ranger'
        $query .= " AND (class_affinity = :class_affinity_exact OR class_affinity LIKE :class_affinity_start OR class_affinity LIKE :class_affinity_middle OR class_affinity LIKE :class_affinity_end OR class_affinity IS NULL)";
    }

    $stmt = $db->prepare($query);
    $stmt->bindParam(':card_type', $cardType);
    if (!empty($classAffinity)) {
         $stmt->bindValue(':class_affinity_exact', $classAffinity);
         $stmt->bindValue(':class_affinity_start', $classAffinity . ',%');
         $stmt->bindValue(':class_affinity_middle', '%,' . $classAffinity . ',%');
         $stmt->bindValue(':class_affinity_end', '%,' . $classAffinity);
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
