import { initializeGame, handlePackClick, startBattle, handlePlayAgain, handleSpeedCycle } from './game.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the game state and UI elements
    initializeGame();

    // Get DOM elements for event listeners
    // Note: game.js also gets these elements in initializeGame. This is slightly redundant
    // but ensures main.js has direct references for attaching listeners.
    // Alternatively, game.js could return these elements or methods to attach listeners.
    const boosterPackElement = document.getElementById('booster-pack');
    const weaponPackElement = document.getElementById('weapon-pack');
    const confirmDraftButtonElement = document.getElementById('confirm-draft');
    const playAgainButtonElement = document.getElementById('play-again-button');
    const speedCycleButtonElement = document.getElementById('speed-cycle-button');

    // Attach event listeners
    if (boosterPackElement) {
        boosterPackElement.addEventListener('click', () => handlePackClick('hero'));
    }

    if (weaponPackElement) {
        weaponPackElement.addEventListener('click', () => handlePackClick('weapon'));
    }

    if (confirmDraftButtonElement) {
        confirmDraftButtonElement.addEventListener('click', startBattle);
    }

    if (playAgainButtonElement) {
        playAgainButtonElement.addEventListener('click', handlePlayAgain);
    }

    if (speedCycleButtonElement) {
        speedCycleButtonElement.addEventListener('click', handleSpeedCycle);
    }
});
