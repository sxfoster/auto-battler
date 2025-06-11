<?php
// public/api/test_ai_decision.php

require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/utils.php';
require_once __DIR__ . '/../includes/GameEntity.php';
require_once __DIR__ . '/../includes/Champion.php';
require_once __DIR__ . '/../includes/Team.php';
require_once __DIR__ . '/../includes/Card.php';
require_once __DIR__ . '/../includes/AIPlayer.php';

header('Content-Type: application/json');

$database = new Database();
$db = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError("Invalid request method. Only POST is allowed.", 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$personaId = $input['persona_id'] ?? null;
$playerChampName = $input['player_champ_name'] ?? 'Warrior';
$playerHp = $input['player_hp'] ?? 20;
$playerEnergy = $input['player_energy'] ?? 1;
$playerSpeed = $input['player_speed'] ?? 3;
$playerHandCardIds = $input['player_hand_card_ids'] ?? [];

$opponentChampName = $input['opponent_champ_name'] ?? 'Cleric';
$opponentHp = $input['opponent_hp'] ?? 16;
$opponentEnergy = $input['opponent_energy'] ?? 1;
$opponentSpeed = $input['opponent_speed'] ?? 4;
$opponentHandCardIds = $input['opponent_hand_card_ids'] ?? [];

if (empty($personaId)) {
    sendError("Persona ID is required.", 400);
}

try {
    $stmtPlayerChamp = $db->prepare("SELECT id, name, role, starting_hp, speed FROM champions WHERE name = :name");
    $stmtPlayerChamp->bindParam(':name', $playerChampName);
    $stmtPlayerChamp->execute();
    $playerChampData = $stmtPlayerChamp->fetch(PDO::FETCH_ASSOC);
    if (!$playerChampData) sendError("Player champion not found.", 404);

    $playerEntity = new Champion([
        'champion_id' => $playerChampData['id'],
        'champion_name' => $playerChampData['name'],
        'role' => $playerChampData['role'],
        'starting_hp' => $playerChampData['starting_hp'],
        'speed' => $playerChampData['speed'],
        'current_hp' => $playerHp,
        'current_energy' => $playerEnergy,
        'current_speed' => $playerSpeed,
        'display_name' => $playerChampData['name'] . ' (Player)'
    ]);
    $playerEntity->team = new Team(true);
    $playerEntity->team->addEntity($playerEntity);
    $playerEntity->hand = loadCardsFromIds($db, $playerHandCardIds);

    $stmtOpponentChamp = $db->prepare("SELECT id, name, role, starting_hp, speed FROM champions WHERE name = :name");
    $stmtOpponentChamp->bindParam(':name', $opponentChampName);
    $stmtOpponentChamp->execute();
    $opponentChampData = $stmtOpponentChamp->fetch(PDO::FETCH_ASSOC);
    if (!$opponentChampData) sendError("Opponent champion not found.", 404);

    $opponentEntity = new Champion([
        'champion_id' => $opponentChampData['id'],
        'champion_name' => $opponentChampData['name'],
        'role' => $opponentChampData['role'],
        'starting_hp' => $opponentChampData['starting_hp'],
        'speed' => $opponentChampData['speed'],
        'current_hp' => $opponentHp,
        'current_energy' => $opponentEnergy,
        'current_speed' => $opponentSpeed,
        'display_name' => $opponentChampData['name'] . ' (Opponent)'
    ]);
    $opponentEntity->team = new Team(false);
    $opponentEntity->team->addEntity($opponentEntity);
    $opponentEntity->hand = loadCardsFromIds($db, $opponentHandCardIds);

    $mockOpposingTeam = new Team(false);
    $mockOpposingTeam->addEntity($opponentEntity);

    $mockActingTeam = new Team(true);
    $mockActingTeam->addEntity($playerEntity);

    $aiPlayer = new AIPlayer($personaId);

    $decision = $aiPlayer->decideAction($playerEntity, $mockActingTeam, $mockOpposingTeam, $playerEntity->hand);

    if ($decision) {
        sendResponse([
            "persona_id" => $personaId,
            "persona_name" => $aiPlayer->getPersonaName(),
            "chosen_card" => [
                "id" => $decision['card']->id,
                "name" => $decision['card']->name,
                "energy_cost" => $decision['card']->energy_cost
            ],
            "chosen_target" => [
                "id" => $decision['target_entity']->id,
                "name" => $decision['target_entity']->display_name,
                "hp" => $decision['target_entity']->current_hp
            ],
            "player_energy_after_action" => $playerEntity->current_energy - $decision['card']->energy_cost,
            "message" => "AI made a decision."
        ]);
    } else {
        sendResponse([
            "persona_id" => $personaId,
            "persona_name" => $aiPlayer->getPersonaName(),
            "chosen_card" => null,
            "chosen_target" => null,
            "message" => "AI decided not to play a card this turn (saved energy or no valid action)."
        ]);
    }

} catch (PDOException $e) {
    sendError("Database error: " . $e->getMessage(), 500);
} catch (Exception $e) {
    sendError("General error: " . $e->getMessage(), 500);
}

function loadCardsFromIds($db_conn, $cardIds) {
    $fullCards = [];
    if (!empty($cardIds)) {
        $placeholder = implode(',', array_fill(0, count($cardIds), '?'));
        $stmt = $db_conn->prepare("SELECT id, name, card_type, rarity, energy_cost, description, damage_type, armor_type, class_affinity, effect_details, flavor_text FROM cards WHERE id IN ($placeholder)");
        $stmt->execute($cardIds);
        $cardsData = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($cardsData as $cardData) {
            $fullCards[] = new Card(array_merge($cardData, ['effect_details' => json_decode($cardData['effect_details'], true)]));
        }
    }
    return $fullCards;
}
?>
