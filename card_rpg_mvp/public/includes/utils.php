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
    $finalDamage = $baseDamage;

    // MVP simplified damage calculation based on GDD matrix:
    // This assumes targetArmorType is 'Light', 'Medium', 'Heavy', 'Magic'
    // You'll need to fetch the target's equipped armor's armor_type to pass here.

    if ($damageType === 'Slashing') {
        if ($targetArmorType === 'Medium') {
            $finalDamage -= 1;
        } elseif ($targetArmorType === 'Heavy') {
            $finalDamage -= 2;
        }
    } elseif ($damageType === 'Piercing') {
        if ($targetArmorType === 'Light') {
            $finalDamage += 1;
        } elseif ($targetArmorType === 'Heavy') {
            $finalDamage -= 1;
        }
    } elseif ($damageType === 'Bludgeoning') {
        if ($targetArmorType === 'Medium') {
            $finalDamage += 1;
        } elseif ($targetArmorType === 'Heavy') {
            $finalDamage += 2;
        }
    } elseif ($damageType === 'Magic') {
        if ($targetArmorType === 'Magic') {
            $finalDamage -= 2; // Assuming '-2 damage (if warded)' means reduction
        }
    }
    
    // Ensure damage is not negative after reductions unless specifically allowed by a card effect
    return max(0, $finalDamage);
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
