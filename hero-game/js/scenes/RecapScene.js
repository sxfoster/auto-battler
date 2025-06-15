import { createDetailCard } from '../ui/CardRenderer.js';
import { allPossibleHeroes, allPossibleWeapons, allPossibleArmors } from '../data.js';

export class RecapScene {
    constructor(element, onContinue) {
        this.element = element;
        this.onContinue = onContinue;

        this.heroSlot = this.element.querySelector('#recap-hero-slot');

        this.element.querySelector('#recap-continue-button').addEventListener('click', () => this.onContinue());
    }

    render(championData) {
        // Clear any previous content
        this.heroSlot.innerHTML = '';

        // Find the full data objects for the hero, weapon, and armor
        const hero = allPossibleHeroes.find(h => h.id === championData.hero);
        const weapon = allPossibleWeapons.find(w => w.id === championData.weapon);
        const armor = allPossibleArmors.find(a => a.id === championData.armor);

        // Create the main hero card container
        const heroCardContainer = createDetailCard(hero);
        if (!heroCardContainer) return;

        // Create the weapon socket if a weapon is equipped
        if (weapon) {
            const weaponSocket = document.createElement('div');
            weaponSocket.className = 'gear-socket recap-weapon-socket';
            const weaponCard = createDetailCard(weapon);
            weaponSocket.appendChild(weaponCard);
            heroCardContainer.appendChild(weaponSocket);
        }

        // Create the armor socket if armor is equipped
        if (armor) {
            const armorSocket = document.createElement('div');
            armorSocket.className = 'gear-socket recap-armor-socket';
            const armorCard = createDetailCard(armor);
            armorSocket.appendChild(armorCard);
            heroCardContainer.appendChild(armorSocket);
        }

        // Append the fully assembled hero card with its gear to the scene
        this.heroSlot.appendChild(heroCardContainer);
    }
}
