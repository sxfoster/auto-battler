import { createDetailCard } from '../ui/CardRenderer.js';
import { allPossibleHeroes, allPossibleAbilities, allPossibleWeapons, allPossibleArmors } from '../data.js';

export class RecapScene {
    constructor(element, onContinue) {
        this.element = element;
        this.onContinue = onContinue;

        this.displayArea = this.element.querySelector('#recap-display-area');
        this.cardViewer = this.element.querySelector('#recap-card-viewer');
        this.socketContainer = this.element.querySelector('#recap-socket-container');

        this.continueButton = this.element.querySelector('#recap-continue-button');
        this.continueButton.addEventListener('click', () => this.onContinue());
    }

    setContinueButtonLabel(text) {
        if (this.continueButton) {
            this.continueButton.textContent = text;
        }
    }

    render(championData) {
        // Clear previous content
        this.cardViewer.innerHTML = '';
        this.socketContainer.innerHTML = '';

        // --- 1. Find all data objects ---
        const heroData = { ...allPossibleHeroes.find(h => h.id === championData.hero) };
        const ability = allPossibleAbilities.find(a => a.id === championData.ability);
        const weapon = allPossibleWeapons.find(w => w.id === championData.weapon);
        const armor = allPossibleArmors.find(a => a.id === championData.armor);

        if (ability) {
            heroData.abilities = [ability];
        }

        // --- 2. Create all three detail cards ---
        const heroCard = createDetailCard(heroData);
        heroCard.classList.add('recap-card');

        const weaponCard = weapon ? createDetailCard(weapon) : null;
        if (weaponCard) {
            weaponCard.classList.add('recap-card', 'hidden');
        }

        const armorCard = armor ? createDetailCard(armor) : null;
        if (armorCard) {
            armorCard.classList.add('recap-card', 'hidden');
        }

        // --- 3. Append cards to the viewer ---
        this.cardViewer.appendChild(heroCard);
        if (weaponCard) this.cardViewer.appendChild(weaponCard);
        if (armorCard) this.cardViewer.appendChild(armorCard);

        // --- 4. Create sockets and attach event listeners ---
        if (weapon) {
            const weaponSocket = this.createGearSocket(weapon, 'recap-weapon-socket');
            weaponSocket.addEventListener('mouseover', () => this.showCard(weaponCard));
            weaponSocket.addEventListener('mouseout', () => this.showCard(heroCard));
            this.socketContainer.appendChild(weaponSocket);
        }

        if (armor) {
            const armorSocket = this.createGearSocket(armor, 'recap-armor-socket');
            armorSocket.addEventListener('mouseover', () => this.showCard(armorCard));
            armorSocket.addEventListener('mouseout', () => this.showCard(heroCard));
            this.socketContainer.appendChild(armorSocket);
        }
    }

    // Helper to create the socket icon
    createGearSocket(itemData, socketClass) {
        const socket = document.createElement('div');
        socket.className = `gear-socket ${socketClass}`;
        socket.style.backgroundImage = `url('${itemData.art}')`;
        return socket;
    }

    // Helper to manage which card is visible
    showCard(cardToShow) {
        this.cardViewer.querySelectorAll('.recap-card').forEach(card => {
            card.classList.add('hidden');
        });
        if (cardToShow) {
            cardToShow.classList.remove('hidden');
        }
    }
}
