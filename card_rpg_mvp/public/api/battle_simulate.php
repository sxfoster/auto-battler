<?php
// public/api/battle_simulate.php

ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/utils.php';
require_once __DIR__ . '/../includes/GameEntity.php';
require_once __DIR__ . '/../includes/Champion.php';
require_once __DIR__ . '/../includes/Monster.php';
require_once __DIR__ . '/../includes/Card.php';
require_once __DIR__ . '/../includes/Team.php';
require_once __DIR__ . '/../includes/AIPlayer.php';
require_once __DIR__ . '/../includes/BattleSimulator.php';

header('Content-Type: application/json');

$database = new Database();
$db = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError("Invalid request method. Only POST is allowed.", 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$playerPersonaId = $input['player_persona_id'] ?? null;

try {
    $stmt = $db->query("SELECT
        psd.champion_id, c1.name as champion_name_1, c1.role as champion_role_1, c1.starting_hp as champion_max_hp_1, c1.speed as champion_base_speed_1, psd.deck_card_ids, psd.champion_hp_1, psd.champion_energy_1, psd.champion_speed_1,
        psd.champion_id_2, c2.name as champion_name_2, c2.role as champion_role_2, c2.starting_hp as champion_max_hp_2, c2.speed as champion_base_speed_2, psd.deck_card_ids_2, psd.champion_hp_2, psd.champion_energy_2, psd.champion_speed_2,
        psd.wins, psd.losses, psd.current_xp, psd.current_level
    FROM player_session_data psd
    JOIN champions c1 ON psd.champion_id = c1.id
    JOIN champions c2 ON psd.champion_id_2 = c2.id
    LIMIT 1");
    $playerSessionData = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$playerSessionData) {
        sendError("Player not set up for battle. Please complete character setup first.", 400);
    }

    // --- Create Player Team ---
    $playerTeam = new Team(true);

   $champ1 = new Champion([
        'champion_id' => $playerSessionData['champion_id'],
        'champion_name' => $playerSessionData['champion_name_1'],
        'role' => $playerSessionData['champion_role_1'],
        'starting_hp' => $playerSessionData['champion_max_hp_1'],
        'speed' => $playerSessionData['champion_base_speed_1'],
        'current_hp' => $playerSessionData['champion_hp_1'],
        'current_energy' => $playerSessionData['champion_energy_1'],
        'current_speed' => $playerSessionData['champion_speed_1'],
        'display_name' => $playerSessionData['champion_name_1'] . ' Alpha',
        'base_crit_chance' => 0
    ]);
    $champ1->deck = loadCardsFromIds($db, json_decode($playerSessionData['deck_card_ids'], true));
    $champ1->hand = $champ1->deck;
    $playerTeam->addEntity($champ1);

   $champ2 = new Champion([
        'champion_id' => $playerSessionData['champion_id_2'],
        'champion_name' => $playerSessionData['champion_name_2'],
        'role' => $playerSessionData['champion_role_2'],
        'starting_hp' => $playerSessionData['champion_max_hp_2'],
        'speed' => $playerSessionData['champion_base_speed_2'],
        'current_hp' => $playerSessionData['champion_hp_2'],
        'current_energy' => $playerSessionData['champion_energy_2'],
        'current_speed' => $playerSessionData['champion_speed_2'],
        'display_name' => $playerSessionData['champion_name_2'] . ' Beta',
        'base_crit_chance' => 0
    ]);
    $champ2->deck = loadCardsFromIds($db, json_decode($playerSessionData['deck_card_ids_2'], true));
    $champ2->hand = $champ2->deck;
    $playerTeam->addEntity($champ2);

    // --- Create Opponent Team ---
    $opponentTeam = new Team(false);
    $aiChampsStmt = $db->query("SELECT id, name, role, starting_hp, speed FROM champions ORDER BY RAND() LIMIT 2");
    $aiChampsData = $aiChampsStmt->fetchAll(PDO::FETCH_ASSOC);
    if (count($aiChampsData) < 2) {
        sendError("Not enough champions available for AI opponent team. Need at least 2.", 500);
    }

    // Determine AI personas
    if ($playerPersonaId) {
        $playerAiId = (int)$playerPersonaId;
    } else {
        // Fallback to first persona if none provided
        $playerAiId = (int)$db->query("SELECT id FROM ai_personas ORDER BY id LIMIT 1")->fetchColumn();
    }
    $opponentAiId = (int)$db->query("SELECT id FROM ai_personas ORDER BY RAND() LIMIT 1")->fetchColumn();

    $playerAi = new AIPlayer($playerAiId);
    $opponentAi = new AIPlayer($opponentAiId);

    $aiIndex = 0;
    foreach ($aiChampsData as $cData) {
        $aiIndex++;
        $displaySuffix = $aiIndex === 1 ? 'One' : 'Two';
        $aiChamp = new Champion([
            'champion_id' => $cData['id'],
            'champion_name' => $cData['name'],
            'role' => $cData['role'],
            'starting_hp' => $cData['starting_hp'],
            'speed' => $cData['speed'],
            'current_hp' => $cData['starting_hp'],
            'current_energy' => 1,
            'current_speed' => $cData['speed'],
            'display_name' => $cData['name'] . ' ' . $displaySuffix,
            'base_crit_chance' => 0
        ]);
        $aiChamp->deck = loadRandomCommonCards($db, $cData['name']);
        $aiChamp->hand = $aiChamp->deck;
        $opponentTeam->addEntity($aiChamp);
    }

    // --- Simulate Battle ---
    $battleSimulator = new BattleSimulator();
    $simulationResult = $battleSimulator->simulateBattle($playerTeam, $opponentTeam, $playerAi, $opponentAi);

    // Update player's session data after battle
    $playerTeam->updateTeamHp();
    $playerSessionData['champion_hp_1'] = $playerTeam->entities[0]->current_hp;
    $playerSessionData['champion_hp_2'] = $playerTeam->entities[1]->current_hp;
    $playerSessionData['champion_energy_1'] = $playerTeam->entities[0]->current_energy;
    $playerSessionData['champion_energy_2'] = $playerTeam->entities[1]->current_energy;
    $playerSessionData['champion_speed_1'] = $playerTeam->entities[0]->current_speed;
    $playerSessionData['champion_speed_2'] = $playerTeam->entities[1]->current_speed;

    if ($simulationResult['result'] === 'win') {
        $playerSessionData['wins']++;
        $playerSessionData['current_xp'] += $simulationResult['xp_awarded'];
    } else {
        $playerSessionData['losses']++;
        $playerSessionData['current_xp'] += $simulationResult['xp_awarded'];
    }

    $xpTable = [
        1 => 60, 2 => 70, 3 => 80, 4 => 90, 5 => 100,
        6 => 110, 7 => 120, 8 => 130, 9 => 140, 10 => 99999
    ];
    $currentLevelXpRequired = $xpTable[$playerSessionData['current_level']] ?? 0;
    while ($playerSessionData['current_xp'] >= $currentLevelXpRequired && $playerSessionData['current_level'] < 10) {
        $playerSessionData['current_level']++;
        $playerSessionData['champion_hp_1'] += 2;
        $playerSessionData['champion_hp_2'] += 2;
        $playerSessionData['champion_max_hp_1'] += 2;
        $playerSessionData['champion_max_hp_2'] += 2;
        $playerSessionData['champion_energy_1'] = min($playerSessionData['champion_energy_1'] + 1, 4);
        $playerSessionData['champion_energy_2'] = min($playerSessionData['champion_energy_2'] + 1, 4);
        $currentLevelXpRequired = $xpTable[$playerSessionData['current_level']] ?? 0;
    }

    $updateStmt = $db->prepare("UPDATE player_session_data SET
        champion_hp_1 = :champion_hp_1, champion_energy_1 = :champion_energy_1, champion_speed_1 = :champion_speed_1,
        champion_hp_2 = :champion_hp_2, champion_energy_2 = :champion_energy_2, champion_speed_2 = :champion_speed_2,
        wins = :wins, losses = :losses, current_xp = :current_xp, current_level = :current_level
        LIMIT 1");
    $updateStmt->bindParam(':champion_hp_1', $playerSessionData['champion_hp_1']);
    $updateStmt->bindParam(':champion_energy_1', $playerSessionData['champion_energy_1']);
    $updateStmt->bindParam(':champion_speed_1', $playerSessionData['champion_speed_1']);
    $updateStmt->bindParam(':champion_hp_2', $playerSessionData['champion_hp_2']);
    $updateStmt->bindParam(':champion_energy_2', $playerSessionData['champion_energy_2']);
    $updateStmt->bindParam(':champion_speed_2', $playerSessionData['champion_speed_2']);
    $updateStmt->bindParam(':wins', $playerSessionData['wins']);
    $updateStmt->bindParam(':losses', $playerSessionData['losses']);
    $updateStmt->bindParam(':current_xp', $playerSessionData['current_xp']);
    $updateStmt->bindParam(':current_level', $playerSessionData['current_level']);
    $updateStmt->execute();

    $simulationResult['opponent_team_names'] = [$opponentTeam->entities[0]->display_name, $opponentTeam->entities[1]->display_name];
    $simulationResult['opponent_start_hp_1'] = $opponentTeam->entities[0]->max_hp;
    $simulationResult['opponent_start_hp_2'] = $opponentTeam->entities[1]->max_hp;
    $simulationResult['player_start_hp_1'] = $playerTeam->entities[0]->max_hp;
    $simulationResult['player_start_hp_2'] = $playerTeam->entities[1]->max_hp;

    // Include final energy and active effects for UI update
    $simulationResult['player_energy_1'] = $playerTeam->entities[0]->current_energy;
    $simulationResult['player_energy_2'] = $playerTeam->entities[1]->current_energy;
    $simulationResult['opponent_energy_1'] = $opponentTeam->entities[0]->current_energy;
    $simulationResult['opponent_energy_2'] = $opponentTeam->entities[1]->current_energy;

    $simulationResult['player_1_active_effects'] = array_map(fn($e) => [
        'type' => $e->type,
        'duration' => $e->duration,
        'is_debuff' => $e->is_debuff
    ], array_merge($playerTeam->entities[0]->buffs, $playerTeam->entities[0]->debuffs));
    $simulationResult['player_2_active_effects'] = array_map(fn($e) => [
        'type' => $e->type,
        'duration' => $e->duration,
        'is_debuff' => $e->is_debuff
    ], array_merge($playerTeam->entities[1]->buffs, $playerTeam->entities[1]->debuffs));
    $simulationResult['opponent_1_active_effects'] = array_map(fn($e) => [
        'type' => $e->type,
        'duration' => $e->duration,
        'is_debuff' => $e->is_debuff
    ], array_merge($opponentTeam->entities[0]->buffs, $opponentTeam->entities[0]->debuffs));
    $simulationResult['opponent_2_active_effects'] = array_map(fn($e) => [
        'type' => $e->type,
        'duration' => $e->duration,
        'is_debuff' => $e->is_debuff
    ], array_merge($opponentTeam->entities[1]->buffs, $opponentTeam->entities[1]->debuffs));

    // Add class names and short display names for opponent icons
    $simulationResult['opponent_class_name_1'] = $opponentTeam->entities[0]->name;
    $simulationResult['opponent_display_name_1_short'] = explode(' ', $opponentTeam->entities[0]->display_name)[1] ?? $opponentTeam->entities[0]->display_name;
    $simulationResult['opponent_class_name_2'] = $opponentTeam->entities[1]->name;
    $simulationResult['opponent_display_name_2_short'] = explode(' ', $opponentTeam->entities[1]->display_name)[1] ?? $opponentTeam->entities[1]->display_name;

    sendResponse($simulationResult);

} catch (PDOException $e) {
    sendError("Database error during battle simulation: " . $e->getMessage(), 500);
} catch (Exception $e) {
    sendError("General error during battle simulation: " . $e->getMessage(), 500);
}

function loadCardsFromIds($db_conn, $cardIds) {
    $fullCards = [];
    if (!empty($cardIds)) {
        $placeholder = implode(',', array_fill(0, count($cardIds), '?'));
        $stmt = $db_conn->prepare("SELECT id, name, card_type, rarity, energy_cost, description, damage_type, armor_type, class_affinity, effect_details, flavor_text, log_template FROM cards WHERE id IN ($placeholder)");
        $stmt->execute($cardIds);
        $cardsData = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($cardsData as $c) {
            $fullCards[] = new Card(array_merge($c, ['effect_details' => json_decode($c['effect_details'], true)]));
        }
    }
    return $fullCards;
}

function loadRandomCommonCards($db_conn, $championName) {
    $cards = [];
    $stmtA = $db_conn->prepare("SELECT id, name, card_type, rarity, energy_cost, description, damage_type, armor_type, class_affinity, effect_details, flavor_text, log_template FROM cards WHERE card_type = 'ability' AND rarity = 'Common' AND (FIND_IN_SET(:name_ab, class_affinity) > 0 OR class_affinity IS NULL) ORDER BY RAND() LIMIT 1");
    $stmtA->bindParam(':name_ab', $championName);
    $stmtA->execute();
    if ($card = $stmtA->fetch(PDO::FETCH_ASSOC)) {
        $cards[] = new Card(array_merge($card, ['effect_details' => json_decode($card['effect_details'], true)]));
    }
    $stmtAr = $db_conn->prepare("SELECT id, name, card_type, rarity, energy_cost, description, damage_type, armor_type, class_affinity, effect_details, flavor_text, log_template FROM cards WHERE card_type = 'armor' AND rarity = 'Common' AND (FIND_IN_SET(:name_ar, class_affinity) > 0 OR class_affinity IS NULL) ORDER BY RAND() LIMIT 1");
    $stmtAr->bindParam(':name_ar', $championName);
    $stmtAr->execute();
    if ($card = $stmtAr->fetch(PDO::FETCH_ASSOC)) {
        $cards[] = new Card(array_merge($card, ['effect_details' => json_decode($card['effect_details'], true)]));
    }
    $stmtW = $db_conn->prepare("SELECT id, name, card_type, rarity, energy_cost, description, damage_type, armor_type, class_affinity, effect_details, flavor_text, log_template FROM cards WHERE card_type = 'weapon' AND rarity = 'Common' AND (FIND_IN_SET(:name_we, class_affinity) > 0 OR class_affinity IS NULL) ORDER BY RAND() LIMIT 1");
    $stmtW->bindParam(':name_we', $championName);
    $stmtW->execute();
    if ($card = $stmtW->fetch(PDO::FETCH_ASSOC)) {
        $cards[] = new Card(array_merge($card, ['effect_details' => json_decode($card['effect_details'], true)]));
    }
    return $cards;
}
?>
