import { createDetailCard } from '../ui/CardRenderer.js';
import { allPossibleHeroes, allPossibleAbilities, allPossibleWeapons, allPossibleArmors } from '../data.js';

export class RecapScene {
    constructor(element, onContinue) {
        this.element = element;
        this.onContinue = onContinue;

        this.heroSlot = this.element.querySelector('#recap-hero-slot');

        this.element.querySelector('#recap-continue-button').addEventListener('click', () => this.onContinue());
    }

    render(championData) {
        this.heroSlot.innerHTML = '';

        // Find the full data objects for all equipped items
        const heroData = { ...allPossibleHeroes.find(h => h.id === championData.hero) };
        const ability = allPossibleAbilities.find(a => a.id === championData.ability);
        const weapon = allPossibleWeapons.find(w => w.id === championData.weapon);
        const armor = allPossibleArmors.find(a => a.id === championData.armor);

        // --- NEW LOGIC: Dynamically add the selected ability to the hero's data ---
        if (ability) {
            heroData.abilities = [ability];
        }

        const heroCardContainer = createDetailCard(heroData);
        if (!heroCardContainer) return;

        // --- NEW LOGIC: Create and append sockets ---
        if (weapon) {
            const weaponSocket = this.createGearSocket(weapon, 'recap-weapon-socket');
            heroCardContainer.appendChild(weaponSocket);
        }

        if (armor) {
            const armorSocket = this.createGearSocket(armor, 'recap-armor-socket');
            heroCardContainer.appendChild(armorSocket);
        }

        this.heroSlot.appendChild(heroCardContainer);
    }

    // Helper function to create a socket with its card and tooltip
    createGearSocket(itemData, socketClass) {
        const socket = document.createElement('div');
        socket.className = `gear-socket ${socketClass}`;

        const miniCardContainer = document.createElement('div');
        miniCardContainer.className = 'hero-card-container';
        const miniCard = document.createElement('div');
        miniCard.className = `hero-card ${(itemData.rarity || 'common').toLowerCase().replace(' ', '-')}`;
        miniCard.innerHTML = `
            <div class="hero-art" style="background-image: url('${itemData.art}')"></div>
            <h3 class="hero-name font-cinzel">${itemData.name}</h3>
        `;
        miniCardContainer.appendChild(miniCard);
        socket.appendChild(miniCardContainer);

        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.innerHTML = `<strong>${itemData.name}</strong><br>${itemData.ability ? itemData.ability.description : 'Passive Bonuses'}`;
        socket.appendChild(tooltip);

        return socket;
    }
}
