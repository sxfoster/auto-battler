<?php
// includes/utils.php

function sendResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit();
}

function sendError($message, $statusCode = 400) {
    sendResponse(["error" => $message], $statusCode);
}

// Function to calculate damage based on type and armor
// Reference GDD: Weapon Design Document (Weapon GDD) - 4. Damage Type vs. Armor Effectiveness Matrix
// This is still simplified; needs full GDD logic.
function calculateDamage($baseDamage, $damageType, $targetArmorType) {
    $calculatedDamage = $baseDamage;

    // Apply simplified armor effectiveness matrix
    if ($damageType === 'Slashing') {
        if ($targetArmorType === 'Medium') {
            $calculatedDamage -= 1;
        } elseif ($targetArmorType === 'Heavy') {
            $calculatedDamage -= 2;
        }
    } elseif ($damageType === 'Piercing') {
        if ($targetArmorType === 'Light') {
            $calculatedDamage += 1;
        } elseif ($targetArmorType === 'Heavy') {
            $calculatedDamage -= 1;
        }
    } elseif ($damageType === 'Bludgeoning') {
        if ($targetArmorType === 'Medium') {
            $calculatedDamage += 1;
        } elseif ($targetArmorType === 'Heavy') {
            $calculatedDamage += 2;
        }
    } elseif ($damageType === 'Magic') {
        // Magic vs magic armor handled in takeDamage
    }

    return max(0, $calculatedDamage);
}

// Helper for battle logging
function createBattleLogEntry($turn, $actorName, $actionType, $details = []) {
    return array_merge([
        "turn" => $turn,
        "actor" => $actorName,
        "action_type" => $actionType,
        "timestamp" => microtime(true) // For precise ordering
    ], $details);
}
?>
