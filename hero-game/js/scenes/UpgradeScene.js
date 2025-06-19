import { createDetailCard } from '../ui/CardRenderer.js';
import { allPossibleHeroes, allPossibleWeapons, allPossibleArmors, allPossibleAbilities } from '../data.js';

export class UpgradeScene {
    constructor(element, onComplete) {
        this.element = element;
        this.onComplete = onComplete;

        // Get references to the new stage containers
        this.packStage = element.querySelector('#upgrade-stage-pack');
        this.revealStage = element.querySelector('#upgrade-stage-reveal');
        this.championsStage = element.querySelector('#upgrade-stage-champions');

        // References to interactive elements
        this.packContainer = element.querySelector('#upgrade-pack-container');
        this.revealArea = element.querySelector('#upgrade-reveal-area');
        this.teamRoster = element.querySelector('#upgrade-team-roster');
        this.takeButton = element.querySelector('#take-card-btn');
        this.dismissButton = element.querySelector('#dismiss-card-btn');

        // State management for the new flow
        this.phase = 'PACK'; // PACK, REVEAL, EQUIP
        this.packContents = [];
        this.currentCardIndex = 0;
        this.lockedCard = null;

        // Bind event listeners
        if (this.packContainer) {
            this.packContainer.addEventListener('click', () => this.handlePackOpen());
        }
        if (this.takeButton) {
            this.takeButton.addEventListener('click', () => this.handleTakeCard());
        }
        if (this.dismissButton) {
            this.dismissButton.addEventListener('click', () => this.handleDismissCard());
        }
    }

    // --- Core Flow Methods ---

    render(packContents, playerTeam) {
        this.packContents = packContents;
        this.playerTeam = playerTeam;
        this.currentCardIndex = 0;
        this.lockedCard = null;
        this.phase = 'PACK';
        
        // Reset to the initial state: only the pack is visible
        this.packStage.classList.remove('upgrade-stage-hidden');
        this.revealStage.classList.add('upgrade-stage-hidden');
        this.championsStage.classList.add('upgrade-stage-hidden');
    }

    handlePackOpen() {
        if (this.phase !== 'PACK') return;
        this.phase = 'REVEAL';

        // Animate pack out, reveal stage in
        this.packStage.classList.add('upgrade-stage-hidden');
        setTimeout(() => {
            this.revealStage.classList.remove('upgrade-stage-hidden');
            this.revealNextCard();
        }, 500); // Wait for fade out animation
    }

    revealNextCard() {
        if (this.currentCardIndex >= this.packContents.length) {
            // No more cards, end the scene
            this.onComplete(null, null); // Pass null to indicate no upgrade was chosen
            return;
        }

        const cardData = this.packContents[this.currentCardIndex];
        this.revealArea.innerHTML = '';
        const cardElement = createDetailCard(cardData);
        this.revealArea.appendChild(cardElement);
    }

    handleTakeCard() {
        if (this.phase !== 'REVEAL') return;
        this.phase = 'EQUIP';
        this.lockedCard = this.packContents[this.currentCardIndex];

        // Animate reveal stage out
        this.revealStage.classList.add('upgrade-stage-hidden');
        
        // Render and animate champions stage in
        setTimeout(() => {
            this.renderTeamForEquip();
            this.championsStage.classList.remove('upgrade-stage-hidden');
        }, 500);
    }
    
    handleDismissCard() {
        if (this.phase !== 'REVEAL') return;
        this.currentCardIndex++;
        this.revealNextCard();
    }

    // This is the final step, triggered by clicking a socket
    handleSocketSelect(slotKey) {
        if (this.phase !== 'EQUIP' || !this.lockedCard) return;

        // Check if the clicked slot type matches the locked card type
        const expectedType = this.lockedCard.type;
        if (!slotKey.startsWith(expectedType)) {
            console.warn(`Invalid slot selected. Expected ${expectedType}, got ${slotKey}`);
            return;
        }

        // Immediately call onComplete with the final choice
        this.onComplete(slotKey, this.lockedCard.id);
    }

    // --- Helper & Rendering Methods ---

    renderTeamForEquip() {
        this.teamRoster.innerHTML = '';
        if (!this.playerTeam || !this.lockedCard) return;

        [1, 2].forEach(num => {
            const heroId = this.playerTeam[`hero${num}`];
            if (!heroId) return;

            const heroData = { ...allPossibleHeroes.find(h => h.id === heroId) };
            const championContainer = this.createChampionDisplay(heroData, num);
            
            // Highlight the correct sockets
            championContainer.querySelectorAll('.equipment-socket').forEach(socket => {
                if (socket.dataset.type === this.lockedCard.type) {
                    socket.classList.add('targetable');
                }
            });
            
            this.teamRoster.appendChild(championContainer);
        });
    }

    createChampionDisplay(heroData, num) {
        const ability = allPossibleAbilities.find(a => a.id === this.playerTeam[`ability${num}`]);
        const weapon = allPossibleWeapons.find(w => w.id === this.playerTeam[`weapon${num}`]);
        const armor = allPossibleArmors.find(a => a.id === this.playerTeam[`armor${num}`]);
        if (ability) heroData.abilities = [ability];

        const container = document.createElement('div');
        container.className = 'champion-display';
        container.dataset.slot = `hero${num}`;
        container.dataset.type = 'hero';

        const cardElem = createDetailCard(heroData);
        container.appendChild(cardElem);

        const abilitySocket = this.createSocket(ability, `ability${num}`, 'ability-socket');
        const weaponSocket = this.createSocket(weapon, `weapon${num}`, 'weapon-socket');
        const armorSocket = this.createSocket(armor, `armor${num}`, 'armor-socket');
        
        container.appendChild(abilitySocket);
        container.appendChild(weaponSocket);
        container.appendChild(armorSocket);
        
        return container;
    }

    createSocket(itemData, slotKey, cssClass) {
        const socket = document.createElement('div');
        socket.className = `equipment-socket ${cssClass}`;
        if (itemData) {
            socket.style.backgroundImage = `url('${itemData.art}')`;
        } else {
            socket.classList.add('empty-socket');
            socket.textContent = '+';
        }
        socket.dataset.slot = slotKey;
        socket.dataset.type = slotKey.replace(/\d+$/, '');
        socket.addEventListener('click', e => {
            e.stopPropagation();
            this.handleSocketSelect(slotKey);
        });
        return socket;
    }
}
