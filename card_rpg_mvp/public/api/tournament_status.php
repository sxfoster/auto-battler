<?php
// public/api/tournament_status.php

// Adjust path based on your server's directory structure
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/utils.php';

header('Content-Type: application/json');

$database = new Database();
$db = $database->getConnection();

try {
    $stmt = $db->query("SELECT
                                   psd.wins, psd.losses, psd.current_level, psd.current_xp,
                                   c1.name as champion_name_1, c2.name as champion_name_2
                                   FROM player_session_data psd
                                   JOIN champions c1 ON psd.champion_id = c1.id
                                   JOIN champions c2 ON psd.champion_id_2 = c2.id
                                   LIMIT 1");
    $playerTournamentStatus = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($playerTournamentStatus) {
        $gameOver = ($playerTournamentStatus['losses'] >= 2); // GDD: 2 losses = elimination

        $nextOpponentName = "N/A";
        if (!$gameOver) {
            // For MVP, pick two random champions for the AI team name display
            $randomStmt = $db->query("SELECT name FROM champions ORDER BY RAND() LIMIT 2");
            $names = $randomStmt->fetchAll(PDO::FETCH_COLUMN);
            if (count($names) === 2) {
                $nextOpponentName = $names[0] . ' & ' . $names[1];
            }
        }
        
        sendResponse([
            "player_status" => $playerTournamentStatus,
            "game_over" => $gameOver,
            "next_opponent" => $nextOpponentName,
            "message" => $gameOver ? "You have been eliminated from the tournament." : "Ready for the next round!"
        ]);
    } else {
        sendError("Tournament status not found. Please setup player first.", 404);
    }
} catch (PDOException $e) {
    sendError("Database error fetching tournament status: " . $e->getMessage(), 500);
}
?>
