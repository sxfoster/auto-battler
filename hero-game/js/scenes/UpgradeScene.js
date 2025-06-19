import { createDetailCard } from '../ui/CardRenderer.js';
import { allPossibleHeroes, allPossibleWeapons, allPossibleArmors, allPossibleAbilities } from '../data.js';

export class UpgradeScene {
    constructor(element, onComplete) {
        this.element = element;
        this.onComplete = onComplete;

        // Stage containers
        this.packStage = element.querySelector('#upgrade-stage-pack');
        this.revealStage = element.querySelector('#upgrade-stage-reveal');
        this.championsStage = element.querySelector('#upgrade-stage-champions');

        // Interactive elements
        this.packContainer = element.querySelector('#upgrade-pack-container');
        this.revealArea = element.querySelector('#upgrade-reveal-area');
        this.teamRoster = element.querySelector('#upgrade-team-roster');
        this.dismissButton = element.querySelector('#dismiss-card-btn');

        // State management
        this.phase = 'PACK'; // PACK, REVEAL, EQUIP
        this.packContents = [];
        this.currentCardIndex = 0;
        this.selectedCardData = null; // Changed from lockedCard
        this.selectedCardElement = null;

        // Bind event listeners
        if (this.packContainer) {
            this.packContainer.addEventListener('click', () => this.handlePackOpen());
        }
        if (this.dismissButton) {
            this.dismissButton.addEventListener('click', () => this.handleDismissCard());
        }
    }

    // --- Core Flow Methods ---

    render(packContents, playerTeam) {
        this.phase = 'PACK';
        this.packContents = packContents;
        this.playerTeam = playerTeam;
        this.currentCardIndex = 0;
        this.clearSelection(); // Use new helper to reset state
        
        this.packStage.classList.remove('upgrade-stage-hidden');
        this.revealStage.classList.add('upgrade-stage-hidden');
        this.championsStage.classList.add('upgrade-stage-hidden');
    }

    handlePackOpen() {
        if (this.phase !== 'PACK') return;
        this.phase = 'REVEAL';
        this.packStage.classList.add('upgrade-stage-hidden');
        setTimeout(() => {
            this.revealStage.classList.remove('upgrade-stage-hidden');
            this.revealNextCard();
        }, 500);
    }

    revealNextCard() {
        this.championsStage.classList.add('upgrade-stage-hidden'); // Always hide champions when a new card is shown
        this.clearSelection();
        if (this.currentCardIndex >= this.packContents.length) {
            this.onComplete(null, null);
            return;
        }

        const cardData = this.packContents[this.currentCardIndex];
        this.revealArea.innerHTML = '';
        const cardElement = createDetailCard(cardData);
        // Attach the new selection handler directly to the card
        cardElement.addEventListener('click', () => this.handleCardSelect(cardData, cardElement));
        this.revealArea.appendChild(cardElement);
    }

    handleCardSelect(cardData, cardElement) {
        if (this.phase === 'EQUIP' && this.selectedCardElement === cardElement) {
            // --- DESELECTION LOGIC ---
            this.clearSelection();
            this.phase = 'REVEAL';
            this.championsStage.classList.add('upgrade-stage-hidden');
        } else {
            // --- SELECTION LOGIC ---
            this.clearSelection(); // Clear previous selection if any
            this.phase = 'EQUIP';
            this.selectedCardData = cardData;
            this.selectedCardElement = cardElement;
            this.selectedCardElement.classList.add('selected');

            // Render and show champions
            this.renderTeamForEquip();
            this.championsStage.classList.remove('upgrade-stage-hidden');
        }
    }

    handleDismissCard() {
        if (this.phase === 'REVEAL' || this.phase === 'EQUIP') {
            this.currentCardIndex++;
            this.revealNextCard();
        }
    }

    handleSocketSelect(slotKey) {
        if (this.phase !== 'EQUIP' || !this.selectedCardData) return;

        const expectedType = this.selectedCardData.type;
        if (!slotKey.startsWith(expectedType)) {
            console.warn(`Invalid slot selected. Expected ${expectedType}, got ${slotKey}`);
            return;
        }

        this.onComplete(slotKey, this.selectedCardData.id);
    }

    // --- Helper & Rendering Methods ---

    clearSelection() {
        if (this.selectedCardElement) {
            this.selectedCardElement.classList.remove('selected');
        }
        this.selectedCardData = null;
        this.selectedCardElement = null;
    }

    renderTeamForEquip() {
        this.teamRoster.innerHTML = '';
        if (!this.playerTeam || !this.selectedCardData) return;

        [1, 2].forEach(num => {
            const heroId = this.playerTeam[`hero${num}`];
            if (!heroId) return;

            const heroData = { ...allPossibleHeroes.find(h => h.id === heroId) };
            const championContainer = this.createChampionDisplay(heroData, num);
            
            championContainer.querySelectorAll('.equipment-socket').forEach(socket => {
                if (socket.dataset.type === this.selectedCardData.type) {
                    socket.classList.add('targetable');
                }
            });
            
            this.teamRoster.appendChild(championContainer);
        });
    }

    createChampionDisplay(heroData, num) {
        // This function remains the same as Phase 1
        const ability = allPossibleAbilities.find(a => a.id === this.playerTeam[`ability${num}`]);
        const weapon = allPossibleWeapons.find(w => w.id === this.playerTeam[`weapon${num}`]);
        const armor = allPossibleArmors.find(a => a.id === this.playerTeam[`armor${num}`]);
        if (ability) heroData.abilities = [ability];

        const container = document.createElement('div');
        container.className = 'champion-display';
        // ... (rest of the function is identical)
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
        // This function remains the same as Phase 1
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

