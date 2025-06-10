<?php
// includes/api_handler.php

require_once INCLUDES_PATH . '/db.php';
require_once INCLUDES_PATH . '/utils.php';

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

                $query = "SELECT id, name, energy_cost, description, damage_type, armor_type, effect_details, flavor_text
                          FROM cards
                          WHERE rarity = 'Common' AND card_type = :card_type";

                if (!empty($classAffinity)) {
                    // This is a simple LIKE for comma-separated affinity. A join table is better long-term.
                    $query .= " AND (class_affinity LIKE :class_affinity OR class_affinity IS NULL)";
                }

                $stmt = $db->prepare($query);
                $stmt->bindParam(':card_type', $cardType);
                if (!empty($classAffinity)) {
                     $searchClass = "%" . $classAffinity . "%";
                     $stmt->bindParam(':class_affinity', $searchClass);
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
                // POST /api/player/setup
                $input = json_decode(file_get_contents('php://input'), true);
                $championId = $input['champion_id'] ?? null;
                $cardIds = $input['card_ids'] ?? []; // Array of 3 card IDs

                if (empty($championId) || count($cardIds) !== 3) {
                    sendError("Invalid setup data provided.", 400);
                }

                // In a real game, you'd store this against a user ID.
                // For MVP, we'll store it as a temporary "current player session".
                // Simplistic: Overwrite previous setup or use a unique session ID.
                // For now, let's just assume one "active" player setup for the tournament.
                
                // Clear any old player setup (simplistic MVP state management)
                $db->exec("DELETE FROM player_session_data"); // Requires 'player_session_data' table
                
                // Store player's selected champion and deck for the current tournament run
                $stmt = $db->prepare("INSERT INTO player_session_data (champion_id, deck_card_ids) VALUES (:champion_id, :deck_card_ids)");
                $deckJson = json_encode($cardIds);
                $stmt->bindParam(':champion_id', $championId);
                $stmt->bindParam(':deck_card_ids', $deckJson);
                $stmt->execute();

                sendResponse(["message" => "Player setup complete.", "champion_id" => $championId, "deck_card_ids" => $cardIds]);

            } else if ($action === 'current_setup') {
                // GET /api/player/current_setup - Retrieve current player's setup
                $stmt = $db->query("SELECT psd.champion_id, c.name as champion_name, c.starting_hp, c.speed, psd.deck_card_ids
                                   FROM player_session_data psd
                                   JOIN champions c ON psd.champion_id = c.id
                                   LIMIT 1"); // Assuming only one active player session for MVP
                $playerData = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($playerData) {
                    $playerData['deck_card_ids'] = json_decode($playerData['deck_card_ids'], true);
                    sendResponse($playerData);
                } else {
                    sendError("No player setup found.", 404);
                }
            } else {
                sendError("Invalid action for player endpoint.", 404);
            }
            break;

        case 'battle':
            if ($action === 'simulate' && $_SERVER['REQUEST_METHOD'] === 'POST') {
                // POST /api/battle/simulate
                // This is where the core battle simulation logic will go.
                // For now, let's return a placeholder.
                
                // Get player's current setup
                $stmt = $db->query("SELECT psd.champion_id, c.name as champion_name, c.starting_hp, c.speed, psd.deck_card_ids
                                   FROM player_session_data psd
                                   JOIN champions c ON psd.champion_id = c.id
                                   LIMIT 1");
                $playerData = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if (!$playerData) {
                    sendError("Player not set up for battle.", 400);
                }
                
                // 1. Generate AI Opponent (simplistic for MVP)
                $allMonstersStmt = $db->query("SELECT id, name, starting_hp, speed FROM monsters ORDER BY RAND() LIMIT 1");
                $aiMonster = $allMonstersStmt->fetch(PDO::FETCH_ASSOC);

                if (!$aiMonster) {
                    sendError("No monsters available for AI opponent.", 500);
                }
                
                // Fetch random common cards for AI Monster (need to adjust for monster abilities)
                // For MVP, let's just give AI a random 3 common ability cards.
                $aiCardsStmt = $db->prepare("SELECT id, name, energy_cost, description, damage_type, effect_details FROM cards WHERE card_type = 'ability' AND rarity = 'Common' ORDER BY RAND() LIMIT 3");
                $aiCardsStmt->execute();
                $aiDeck = $aiCardsStmt->fetchAll(PDO::FETCH_ASSOC);
                 foreach ($aiDeck as &$card) { // Decode effect details for AI cards too
                    if ($card['effect_details']) {
                        $card['effect_details'] = json_decode($card['effect_details'], true);
                    }
                }

                // 2. Initialize Battle State (PHP objects for entities/cards)
                // This would be your PHP classes for Champion, Monster, Card, BattleSimulator
                $playerChampion = [
                    'id' => $playerData['champion_id'],
                    'name' => $playerData['champion_name'],
                    'current_hp' => $playerData['starting_hp'],
                    'max_hp' => $playerData['starting_hp'],
                    'current_energy' => 1, // Start with 1 energy
                    'speed' => $playerData['speed'],
                    'deck' => $playerData['deck_card_ids'] // Just IDs for now, need to fetch full card data
                ];
                
                // Fetch full card data for player's deck
                $playerDeckCards = [];
                if (!empty($playerData['deck_card_ids'])) {
                    $cardIdsPlaceholder = implode(',', array_fill(0, count($playerData['deck_card_ids']), '?'));
                    $playerCardsStmt = $db->prepare("SELECT id, name, card_type, rarity, energy_cost, description, damage_type, armor_type, effect_details FROM cards WHERE id IN ($cardIdsPlaceholder)");
                    $playerCardsStmt->execute($playerData['deck_card_ids']);
                    $playerDeckCards = $playerCardsStmt->fetchAll(PDO::FETCH_ASSOC);
                     foreach ($playerDeckCards as &$card) { // Decode effect details
                        if ($card['effect_details']) {
                            $card['effect_details'] = json_decode($card['effect_details'], true);
                        }
                    }
                }
                $playerChampion['full_deck'] = $playerDeckCards; // Store full card data

                $opponentMonster = [
                    'id' => $aiMonster['id'],
                    'name' => $aiMonster['name'],
                    'current_hp' => $aiMonster['starting_hp'],
                    'max_hp' => $aiMonster['starting_hp'],
                    'current_energy' => 1, // Start with 1 energy
                    'speed' => $aiMonster['speed'],
                    'deck' => $aiDeck // AI's full card data
                ];

                $battleLog = [];
                $winner = null;
                $turn = 0;
                $maxTurns = 10; // Prevent infinite loops for MVP

                // Simple Battle Simulation Loop (PLACEHOLDER LOGIC)
                while ($playerChampion['current_hp'] > 0 && $opponentMonster['current_hp'] > 0 && $turn < $maxTurns) {
                    $turn++;
                    $logEntry = ["turn" => $turn, "actions" => []];

                    // Determine initiative (simple: player always first for MVP)
                    $activeActors = [$playerChampion, $opponentMonster];
                    // You'd sort by speed here if implementing full initiative from GDD (Battle System - 5. Initiative System)
                    
                    foreach ($activeActors as $actorIndex => &$actor) { // Using & to modify original arrays
                        if ($actor['current_hp'] <= 0) continue; // Skip if defeated

                        $isPlayer = ($actor['name'] === $playerChampion['name'] && $actor['id'] === $playerChampion['id']);
                        $actorName = $isPlayer ? $playerChampion['name'] : $opponentMonster['name'];
                        $target = $isPlayer ? $opponentMonster : $playerChampion; // Simple single target for MVP

                        $logEntry['actions'][] = ["actor" => $actorName, "action_type" => "start_turn", "energy" => $actor['current_energy']];
                        
                        // Draw card (simple: always have all 3 cards in hand for MVP for now)
                        // Add energy (GDD: Level 1 base energy is 1)
                        $actor['current_energy'] = min($actor['current_energy'] + 1, 4); // Capped at 4 for level 9+
                        
                        // Play a card (simplistic AI/player: pick first affordable card)
                        $playedCard = null;
                        $actorCards = $isPlayer ? $playerChampion['full_deck'] : $opponentMonster['deck']; // Get full card data
                        
                        foreach ($actorCards as $card) {
                            if ($actor['current_energy'] >= $card['energy_cost']) {
                                $playedCard = $card;
                                break; // Play the first affordable card
                            }
                        }

                        if ($playedCard) {
                            $actor['current_energy'] -= $playedCard['energy_cost'];
                            $logEntry['actions'][] = ["actor" => $actorName, "action_type" => "play_card", "card_name" => $playedCard['name'], "energy_spent" => $playedCard['energy_cost']];

                            // Apply card effect (very simplified for MVP)
                            if (isset($playedCard['effect_details']) && $playedCard['effect_details']) {
                                $effect = $playedCard['effect_details'];
                                if ($effect['type'] == 'damage') {
                                    $damageDealt = calculateDamage($effect['damage'], $playedCard['damage_type'], $target['armor_type'] ?? null); // Add armor_type to entity later
                                    $target['current_hp'] -= $damageDealt;
                                    $logEntry['actions'][] = ["actor" => $actorName, "action_type" => "deal_damage", "target" => $target['name'], "amount" => $damageDealt, "target_hp_after" => $target['current_hp']];
                                } elseif ($effect['type'] == 'heal') {
                                    $healedTarget = $isPlayer ? $playerChampion : $opponentMonster; // Self-heal for MVP simplicity
                                    $healedTarget['current_hp'] = min($healedTarget['current_hp'] + $effect['amount'], $healedTarget['max_hp']);
                                    $logEntry['actions'][] = ["actor" => $actorName, "action_type" => "heal", "target" => $healedTarget['name'], "amount" => $effect['amount'], "target_hp_after" => $healedTarget['current_hp']];
                                }
                                // ... extend with other effect types later
                            }
                        } else {
                            $logEntry['actions'][] = ["actor" => $actorName, "action_type" => "pass_turn", "reason" => "No affordable cards"];
                        }
                    }

                    // Re-assign actors back to their original variables after loop (important for `&` usage)
                    $playerChampion = $activeActors[0];
                    $opponentMonster = $activeActors[1];
                    
                    // Check for battle end conditions
                    if ($playerChampion['current_hp'] <= 0) {
                        $winner = $opponentMonster['name'];
                        break;
                    }
                    if ($opponentMonster['current_hp'] <= 0) {
                        $winner = $playerChampion['name'];
                        break;
                    }
                }
                
                $result = $winner === $playerChampion['name'] ? 'win' : 'loss';
                $xp_awarded = ($result === 'win' ? 60 : 30); // From GDD: Game Modes - 1.2. XP Rewards Per Match
                
                // Update player's XP and tournament status (requires tournament_status table)
                // For MVP, just return XP for now.
                
                sendResponse([
                    "message" => "Battle simulated.",
                    "player_final_hp" => $playerChampion['current_hp'],
                    "opponent_final_hp" => $opponentMonster['current_hp'],
                    "winner" => $winner,
                    "result" => $result,
                    "xp_awarded" => $xp_awarded,
                    "log" => $battleLog
                ]);

            } else {
                sendError("Invalid action for battle endpoint.", 404);
            }
            break;

        case 'tournament':
            // Placeholder for tournament endpoints (status, progress, reset)
            sendError("Tournament endpoint not yet implemented for MVP.", 501);
            break;

        default:
            sendError("Endpoint not found.", 404);
            break;
    }
}
?>
