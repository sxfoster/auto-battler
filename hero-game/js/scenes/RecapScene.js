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
        this.heroSlot.innerHTML = ''; // Clear previous content

        // Find the full data objects for all equipped items
        const heroData = { ...allPossibleHeroes.find(h => h.id === championData.hero) }; // Create a mutable copy
        const ability = allPossibleAbilities.find(a => a.id === championData.ability);
        const weapon = allPossibleWeapons.find(w => w.id === championData.weapon);
        const armor = allPossibleArmors.find(a => a.id === championData.armor);

        // --- Dynamically add the selected ability to the hero's data ---
        if (ability) {
            heroData.abilities = [ability]; 
        }

        // Create the main hero card using the updated heroData
        const heroCardContainer = createDetailCard(heroData);
        if (!heroCardContainer) return;

        // --- Create and append sockets with new modal popups ---
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

    // Helper function to create a socket with its card and modal popup
    createGearSocket(itemData, socketClass) {
        const socket = document.createElement('div');
        socket.className = `gear-socket ${socketClass}`;
        // Set the artwork directly on the socket's background
        socket.style.backgroundImage = `url('${itemData.art}')`;

        // Create the modal container that will hold the full card
        const modalPopup = document.createElement('div');
        modalPopup.className = 'socket-modal-popup';

        // Create the full, detailed card for the item
        const detailCard = createDetailCard(itemData);
        if (detailCard) {
            modalPopup.appendChild(detailCard);
        }

        socket.appendChild(modalPopup);

        return socket;
    }
}
