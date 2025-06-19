// hero-game/js/ui/ChampionDisplay.js

import { createDetailCard } from './CardRenderer.js';
import { allPossibleHeroes, allPossibleAbilities, allPossibleWeapons, allPossibleArmors } from '../data.js';

/**
 * Creates a small socket element for a piece of equipment.
 * This is a private helper function for our module.
 */
function _createSocketElement(itemData, socketClass, slotKey) {
    const socket = document.createElement('div');
    socket.className = `equipment-socket ${socketClass}`;

    if (itemData) {
        socket.style.backgroundImage = `url('${itemData.art}')`;
        socket.title = `${itemData.name} - ${itemData.rarity}`;
    } else {
        socket.classList.add('empty-socket');
        socket.innerHTML = '<i class="fas fa-plus"></i>';
    }

    if (slotKey) {
        socket.dataset.slot = slotKey;
        socket.dataset.type = slotKey.replace(/\d+$/, '');
    }
    return socket;
}

/**
 * Creates a complete champion display component, including the hero card and all equipment sockets.
 * @param {object} championSlotData - An object with the IDs of the champion's items.
 * @param {number|string} championNum - The number of the champion (1 or 2).
 * @param {string|null} targetableItemType - Optional: The type of item to highlight as a target for upgrades.
 * @returns {HTMLElement} A div with class 'champion-display' containing the full component.
 */
export function createChampionDisplay(championSlotData, championNum, targetableItemType = null) {
    const container = document.createElement('div');
    container.className = 'champion-display';

    const hero = allPossibleHeroes.find(h => h.id === championSlotData.hero);
    if (!hero) return container;

    const heroData = { ...hero };
    const ability = allPossibleAbilities.find(a => a.id === championSlotData.ability);
    const weapon = allPossibleWeapons.find(w => w.id === championSlotData.weapon);
    const armor = allPossibleArmors.find(a => a.id === championSlotData.armor);

    if (ability) {
        heroData.abilities = [ability];
    }

    const heroCardElem = createDetailCard(heroData);
    const abilitySocket = _createSocketElement(ability, 'ability-socket', `ability${championNum}`);
    const weaponSocket = _createSocketElement(weapon, 'weapon-socket', `weapon${championNum}`);
    const armorSocket = _createSocketElement(armor, 'armor-socket', `armor${championNum}`);

    if (targetableItemType) {
        if (abilitySocket.dataset.type === targetableItemType) abilitySocket.classList.add('targetable');
        if (weaponSocket.dataset.type === targetableItemType) weaponSocket.classList.add('targetable');
        if (armorSocket.dataset.type === targetableItemType) armorSocket.classList.add('targetable');
    }

    container.appendChild(heroCardElem);
    container.appendChild(abilitySocket);
    container.appendChild(weaponSocket);
    container.appendChild(armorSocket);

    return container;
}
