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
// This is a simplified version; you'll build out the full logic later.
function calculateDamage($baseDamage, $damageType, $armorType) {
    // For MVP, just return base damage
    // Later, you'll consult the Damage Type vs. Armor Effectiveness Matrix from GDD (Weapon GDD - 4.)
    // Example:
    // if ($damageType == 'Piercing' && $armorType == 'Light') { return $baseDamage + 1; }
    // else if ($damageType == 'Slashing' && $armorType == 'Heavy') { return $baseDamage - 2; }
    return $baseDamage;
}
?>
