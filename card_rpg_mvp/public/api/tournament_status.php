<?php
// public/api/tournament_status.php

// Adjust path based on your server's directory structure
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/utils.php';

header('Content-Type: application/json');

$database = new Database();
$db = $database->getConnection();

try {
    $stmt = $db->query("SELECT psd.wins, psd.losses, psd.current_level, psd.current_xp, c.name as champion_name
                                   FROM player_session_data psd
                                   JOIN champions c ON psd.champion_id = c.id
                                   LIMIT 1");
    $playerTournamentStatus = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($playerTournamentStatus) {
        $gameOver = ($playerTournamentStatus['losses'] >= 2); // GDD: 2 losses = elimination

        $nextOpponentName = "N/A"; 
        if (!$gameOver) {
             // In a real tournament, this would be determined by bracket logic.
             // For MVP, just randomly select a monster for the next potential fight display.
             $randomMonsterStmt = $db->query("SELECT name FROM monsters ORDER BY RAND() LIMIT 1");
             $nextOpponentName = $randomMonsterStmt->fetchColumn() . " (AI)";
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
