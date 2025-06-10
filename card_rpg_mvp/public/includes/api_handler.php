<?php
// includes/api_handler.php

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/utils.php';
require_once __DIR__ . '/BattleSimulator.php'; // New include

function handleApiRequest($endpoint, $action) {
    $database = new Database();
    $db = $database->getConnection();

    switch ($endpoint) {
        case 'champions':
            if ($action === '') {
                // GET /api/champions - Get all champions
                $stmt = $db->query("SELECT id, name, role, starting_hp, speed FROM champions");
                $champions = $stmt->fetchAll(PDO::FETCH_ASSOC);
                sendResponse($champions);
            } else {
                sendError("Invalid action for champions endpoint.", 404);
            }
            break;

        case 'cards':
            if ($action === 'common_by_type') {
                // GET /api/cards/common_by_type?type=ability&class=Warrior
                $cardType = $_GET['type'] ?? '';
                $classAffinity = $_GET['class'] ?? ''; // e.g., 'Warrior'

                if (empty($cardType)) {
                    sendError("Card type is required.", 400);
                }

                $query = "SELECT id, name, card_type, class_affinity, energy_cost, description, damage_type, armor_type, effect_details, flavor_text
                          FROM cards
                          WHERE rarity = 'Common' AND card_type = :card_type";

                if (!empty($classAffinity)) {
                    $query .= " AND (class_affinity LIKE :class_affinity_start OR class_affinity LIKE :class_affinity_middle OR class_affinity LIKE :class_affinity_end OR class_affinity LIKE :class_affinity_exact OR class_affinity IS NULL)";
                }

                $stmt = $db->prepare($query);
                $stmt->bindParam(':card_type', $cardType);
                if (!empty($classAffinity)) {
                     $stmt->bindValue(':class_affinity_start', $classAffinity . ',%');
                     $stmt->bindValue(':class_affinity_middle', '%,' . $classAffinity . ',%');
                     $stmt->bindValue(':class_affinity_end', '%,' . $classAffinity);
                     $stmt->bindValue(':class_affinity_exact', $classAffinity);
                }
                $stmt->execute();
                $cards = $stmt->fetchAll(PDO::FETCH_ASSOC);

                // Decode JSON effect_details
                foreach ($cards as &$card) {
                    if ($card['effect_details']) {
                        $card['effect_details'] = json_decode($card['effect_details'], true);
                    }
                }
                sendResponse($cards);

            } else {
                sendError("Invalid action for cards endpoint.", 404);
            }
            break;
        
        case 'player':
            if ($action === 'setup' && $_SERVER['REQUEST_METHOD'] === 'POST') {
                $input = json_decode(file_get_contents('php://input'), true);
                $championId = $input['champion_id'] ?? null;
                $cardIds = $input['card_ids'] ?? [];

                if (empty($championId) || count($cardIds) !== 3) {
                    sendError("Invalid setup data provided. Requires champion_id and 3 card_ids.", 400);
                }

                // Fetch champion data
                $stmt = $db->prepare("SELECT id, name, role, starting_hp, speed FROM champions WHERE id = :champion_id");
                $stmt->bindParam(':champion_id', $championId, PDO::PARAM_INT);
                $stmt->execute();
                $championRow = $stmt->fetch(PDO::FETCH_ASSOC);
                if (!$championRow) {
                    sendError("Champion ID not found.", 404);
                }

                // Check if all card_ids exist and are valid common cards
                $cardIdsPlaceholder = implode(',', array_fill(0, count($cardIds), '?'));
                $stmt = $db->prepare("SELECT id, name, card_type, class_affinity, rarity, energy_cost, description, damage_type, armor_type, effect_details, flavor_text FROM cards WHERE id IN ($cardIdsPlaceholder) AND rarity = 'Common'");
                $stmt->execute($cardIds);
                $fetchedCards = $stmt->fetchAll(PDO::FETCH_ASSOC);

                if (count($fetchedCards) !== 3) {
                    sendError("One or more card IDs are invalid or not common cards.", 400);
                }

                // Use champion name from earlier fetch to verify card affinity
                $championName = $championRow['name'];

                foreach ($fetchedCards as $card) {
                    if ($card['card_type'] === 'ability' || $card['card_type'] === 'armor' || $card['card_type'] === 'weapon') {
                        $affinities = explode(',', $card['class_affinity']);
                        if (!in_array($championName, $affinities) && $card['class_affinity'] !== NULL) { // Allow NULL for generic items in future
                             sendError("Card '{$card['name']}' is not usable by {$championName}.", 400);
                        }
                    }
                }

                // Clear any old player setup (simplistic MVP state management)
                // This requires a player_session_data table
                $db->exec("DELETE FROM player_session_data");
                
                // Store player's selected champion and deck for the current tournament run
                $stmt = $db->prepare("INSERT INTO player_session_data (champion_id, deck_card_ids, current_hp, current_energy, current_speed, current_xp, current_level, wins, losses) VALUES (:champion_id, :deck_card_ids, :current_hp, :current_energy, :current_speed, :current_xp, :current_level, :wins, :losses)");
                $deckJson = json_encode($cardIds);

                // Champion base stats from earlier query
                $champStats = ['starting_hp' => $championRow['starting_hp'], 'speed' => $championRow['speed']];

                $stmt->bindParam(':champion_id', $championId);
                $stmt->bindParam(':deck_card_ids', $deckJson);
                $stmt->bindParam(':current_hp', $champStats['starting_hp']);
                $stmt->bindValue(':current_energy', 1); // Start with 1 energy
                $stmt->bindParam(':current_speed', $champStats['speed']);
                $stmt->bindValue(':current_xp', 0);
                $stmt->bindValue(':current_level', 1);
                $stmt->bindValue(':wins', 0);
                $stmt->bindValue(':losses', 0);

                $stmt->execute();

                // Prepare full card details for response
                foreach ($fetchedCards as &$card) {
                    if ($card['effect_details']) {
                        $card['effect_details'] = json_decode($card['effect_details'], true);
                    }
                }

                sendResponse([
                    "message" => "Player setup complete.",
                    "champion" => [
                        "id" => $championRow['id'],
                        "name" => $championRow['name'],
                        "role" => $championRow['role'],
                        "starting_hp" => $championRow['starting_hp'],
                        "speed" => $championRow['speed']
                    ],
                    "deck" => $fetchedCards
                ]);

            } else if ($action === 'current_setup') {
                // GET /api/player/current_setup - Retrieve current player's setup
                $stmt = $db->query("SELECT psd.champion_id, c.name as champion_name, c.role, c.starting_hp, c.speed, psd.deck_card_ids, psd.current_hp, psd.current_energy, psd.current_speed, psd.wins, psd.losses, psd.current_xp, psd.current_level
                                   FROM player_session_data psd
                                   JOIN champions c ON psd.champion_id = c.id
                                   LIMIT 1"); // Assuming only one active player session for MVP
                $playerData = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($playerData) {
                    $playerData['deck_card_ids'] = json_decode($playerData['deck_card_ids'], true);

                    $cards = [];
                    if (!empty($playerData['deck_card_ids'])) {
                        $placeholder = implode(',', array_fill(0, count($playerData['deck_card_ids']), '?'));
                        $cardStmt = $db->prepare("SELECT id, name, card_type, class_affinity, rarity, energy_cost, description, damage_type, armor_type, effect_details, flavor_text FROM cards WHERE id IN ($placeholder)");
                        $cardStmt->execute($playerData['deck_card_ids']);
                        $cards = $cardStmt->fetchAll(PDO::FETCH_ASSOC);
                        foreach ($cards as &$card) {
                            if ($card['effect_details']) {
                                $card['effect_details'] = json_decode($card['effect_details'], true);
                            }
                        }
                    }

                    $playerData['deck'] = $cards;
                    sendResponse($playerData);
                } else {
                    sendError("No player setup found. Please go through setup first.", 404);
                }
            } else {
                sendError("Invalid action for player endpoint.", 404);
            }
            break;

        case 'battle':
            if ($action === 'simulate' && $_SERVER['REQUEST_METHOD'] === 'POST') {
                // Load player's current session data
                $stmt = $db->query("SELECT psd.champion_id, c.name as champion_name, c.role, c.starting_hp, c.speed, psd.deck_card_ids, psd.current_hp, psd.current_energy, psd.current_speed, psd.wins, psd.losses, psd.current_xp, psd.current_level
                                   FROM player_session_data psd
                                   JOIN champions c ON psd.champion_id = c.id
                                   LIMIT 1");
                $playerSessionData = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($playerSessionData && !empty($playerSessionData['deck_card_ids'])) {
                    $playerSessionData['deck_card_ids'] = json_decode($playerSessionData['deck_card_ids'], true);
                }
                
                if (!$playerSessionData) {
                    sendError("Player not set up for battle. Please complete character setup first.", 400);
                }

                // Pick a random AI Monster opponent (from GDD)
                $allMonstersStmt = $db->query("SELECT id, name, role, starting_hp, speed FROM monsters ORDER BY RAND() LIMIT 1");
                $aiMonsterData = $allMonstersStmt->fetch(PDO::FETCH_ASSOC);

                if (!$aiMonsterData) {
                    sendError("No monsters available for AI opponent.", 500);
                }
                
                $battleSimulator = new BattleSimulator();
                $simulationResult = $battleSimulator->simulateBattle($playerSessionData, $aiMonsterData['id']);

                // Update player's session data after battle (HP, XP, wins/losses)
                if ($simulationResult['result'] === 'win') {
                    $playerSessionData['wins']++;
                    $playerSessionData['current_xp'] += $simulationResult['xp_awarded'];
                } else {
                    $playerSessionData['losses']++;
                    $playerSessionData['current_xp'] += $simulationResult['xp_awarded'];
                }
                $playerSessionData['current_hp'] = $simulationResult['player_final_hp'];
                $playerSessionData['current_energy'] = 1; // Reset energy after battle
                $playerSessionData['current_speed'] = $playerSessionData['speed']; // Reset speed after battle

                // Check for level up (simplistic for MVP)
                $xpTable = [
                    1 => 60, 2 => 70, 3 => 80, 4 => 90, 5 => 100,
                    6 => 110, 7 => 120, 8 => 130, 9 => 140, 10 => 99999 // Max level
                ];
                $currentLevelXpRequired = $xpTable[$playerSessionData['current_level']] ?? 0;
                while ($playerSessionData['current_xp'] >= $currentLevelXpRequired && $playerSessionData['current_level'] < 10) {
                    $playerSessionData['current_level']++;
                    $playerSessionData['current_hp'] += 2; // +2 HP per level
                    $playerSessionData['starting_hp'] = $playerSessionData['current_hp']; // Max HP increases
                    $playerSessionData['current_energy'] = min($playerSessionData['current_energy'] + 1, 4); // Max energy increases
                    // Speed updates are conditional in GDD (Task 2.3 - 2.3. Level-Up Matrix (Level 1 to Level 10))
                    // For MVP, skip conditional speed for now or add simple +1 every 3 levels or so.
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

                sendResponse($simulationResult);

            } else {
                sendError("Invalid action for battle endpoint.", 404);
            }
            break;

        case 'tournament':
            if ($action === 'status') {
                // GET /api/tournament/status
                // For MVP, just return player's wins/losses and current opponent data for next match
                $stmt = $db->query("SELECT psd.wins, psd.losses, psd.current_level, psd.current_hp, psd.current_energy, psd.current_speed, c.name as champion_name, c.starting_hp, c.speed
                                   FROM player_session_data psd
                                   JOIN champions c ON psd.champion_id = c.id
                                   LIMIT 1");
                $playerTournamentStatus = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($playerTournamentStatus) {
                    // Determine if game over
                    $gameOver = ($playerTournamentStatus['losses'] >= 2); // GDD: 2 losses = elimination

                    $nextOpponentName = "TBD Opponent"; // Placeholder
                    if (!$gameOver) {
                         // In a full tournament, you'd calculate the next opponent based on bracket logic
                         // For MVP, let's just indicate there will be a next battle if not eliminated.
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

            } else if ($action === 'reset' && $_SERVER['REQUEST_METHOD'] === 'POST') {
                // POST /api/tournament/reset
                $db->exec("TRUNCATE TABLE player_session_data"); // Reset player progress
                sendResponse(["message" => "Tournament and player progress reset."]);
            } else {
                sendError("Invalid action for tournament endpoint.", 404);
            }
            break;

        default:
            sendError("Endpoint not found.", 404);
            break;
    }
}
?>
