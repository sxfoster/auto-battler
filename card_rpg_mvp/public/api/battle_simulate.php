<?php
// public/api/battle_simulate.php

// Adjust path based on your server's directory structure
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/utils.php';
require_once __DIR__ . '/../includes/BattleSimulator.php'; // Requires all its dependencies too

header('Content-Type: application/json');

$database = new Database();
$db = $database->getConnection();


try {
    // Load player's current session data
    $stmt = $db->query("SELECT psd.champion_id, c.name as champion_name, c.role, c.starting_hp, c.speed, psd.deck_card_ids, psd.current_hp, psd.current_energy, psd.current_speed, psd.wins, psd.losses, psd.current_xp, psd.current_level
                                   FROM player_session_data psd
                                   JOIN champions c ON psd.champion_id = c.id
                                   LIMIT 1");
    $playerSessionData = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($playerSessionData && !empty($playerSessionData['deck_card_ids'])) {
        $decoded = json_decode($playerSessionData['deck_card_ids'], true);
        if (json_last_error() === JSON_ERROR_NONE) {
            $playerSessionData['deck_card_ids'] = $decoded;
        } else {
            // If decoding fails, treat as empty to avoid SQL errors later
            $playerSessionData['deck_card_ids'] = [];
        }
    }
    
    if (!$playerSessionData) {
        sendError('Player not set up for battle. Please complete character setup first.', 400);
    }

    // Pick a random AI Monster opponent (from GDD)
    $allMonstersStmt = $db->query("SELECT id, name, role, starting_hp, speed FROM monsters ORDER BY RAND() LIMIT 1");
    $aiMonsterData = $allMonstersStmt->fetch(PDO::FETCH_ASSOC);

    if (!$aiMonsterData) {
        sendError('No monsters available for AI opponent.', 500);
    }
    
    $battleSimulator = new BattleSimulator();
    $simulationResult = $battleSimulator->simulateBattle($playerSessionData, $aiMonsterData['id']);

    // Update player's session data after battle (HP, XP, wins/losses, etc.)
    if ($simulationResult['result'] === 'win') {
        $playerSessionData['wins']++;
        $playerSessionData['current_xp'] += $simulationResult['xp_awarded'];
    } else { // loss or draw
        $playerSessionData['losses']++; // For MVP, draw also counts as a loss for elimination purposes
        $playerSessionData['current_xp'] += $simulationResult['xp_awarded'];
    }
    $playerSessionData['current_hp'] = $simulationResult['player_final_hp'];
    $playerSessionData['current_energy'] = 1; // Reset energy after battle
    $playerSessionData['current_speed'] = $playerSessionData['speed']; // Reset speed after battle (base speed)

    // Check for level up
    $xpTable = [
        1 => 60, 2 => 70, 3 => 80, 4 => 90, 5 => 100,
        6 => 110, 7 => 120, 8 => 130, 9 => 140, 10 => 99999 // Max level, very high XP
    ];
    
    // Check if player leveled up
    $levelUpOccurred = false;
    $currentLevelXpRequired = $xpTable[$playerSessionData['current_level']] ?? 0;
    while ($playerSessionData['current_xp'] >= $currentLevelXpRequired && $playerSessionData['current_level'] < 10) {
        $playerSessionData['current_level']++;
        $playerSessionData['current_hp'] += 2; // +2 HP per level
        $playerSessionData['starting_hp'] = $playerSessionData['current_hp']; // Update max HP for reference
        $playerSessionData['current_energy'] = min($playerSessionData['current_energy'] + 1, 4); // Max energy increases
        // GDD: Speed updates are conditional (+1 speed every 3 levels or so for agile types)
        // For MVP, we'll keep it simple for now and rely on base speed + potential card buffs.
        $levelUpOccurred = true;
        $currentLevelXpRequired = $xpTable[$playerSessionData['current_level']] ?? 0;
    }


    $updateStmt = $db->prepare("UPDATE player_session_data SET current_hp = :current_hp, current_energy = :current_energy, current_speed = :current_speed, wins = :wins, losses = :losses, current_xp = :current_xp, current_level = :current_level LIMIT 1");
    $updateStmt->bindParam(':current_hp', $playerSessionData['current_hp']);
    $updateStmt->bindParam(':current_energy', $playerSessionData['current_energy']);
    $updateStmt->bindParam(':current_speed', $playerSessionData['current_speed']);
    $updateStmt->bindParam(':wins', $playerSessionData['wins']);
    $updateStmt->bindParam(':losses', $playerSessionData['losses']);
    $updateStmt->bindParam(':current_xp', $playerSessionData['current_xp']);
    $updateStmt->bindParam(':current_level', $playerSessionData['current_level']);
    $updateStmt->execute();

    // Add opponent data to the response for frontend display
    $simulationResult['opponent_monster_name'] = $aiMonsterData['name'];
    $simulationResult['opponent_start_hp'] = $aiMonsterData['starting_hp'];
    $simulationResult['player_start_hp'] = $playerSessionData['starting_hp']; // Pass initial HP for UI bar calcs
    
    sendResponse($simulationResult);

} catch (PDOException $e) {
    sendError('Database error during battle simulation: ' . $e->getMessage(), 500);
} catch (Exception $e) {
    sendError('General error during battle simulation: ' . $e->getMessage(), 500);
}
?>
