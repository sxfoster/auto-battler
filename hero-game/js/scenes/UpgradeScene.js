// hero-game/js/scenes/UpgradeScene.js

import { createDetailCard } from '../ui/CardRenderer.js';
import { createChampionDisplay } from '../ui/ChampionDisplay.js';

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
        this.phase = 'PACK';
        this.packContents = [];
        this.currentCardIndex = 0;
        this.selectedCardData = null;
        this.selectedCardElement = null;
        this.playerTeam = null;

        if (this.packContainer) {
            this.packContainer.addEventListener('click', () => this.handlePackOpen());
        }
        if (this.dismissButton) {
            this.dismissButton.addEventListener('click', () => this.handleDismissCard());
        }
    }

    render(packContents, playerTeam) {
        this.phase = 'PACK';
        this.packContents = packContents;
        this.playerTeam = playerTeam;
        this.currentCardIndex = 0;
        this.clearSelection();

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
        this.championsStage.classList.add('upgrade-stage-hidden');
        this.clearSelection();
        if (this.currentCardIndex >= this.packContents.length) {
            this.onComplete(null, null);
            return;
        }

        const cardData = this.packContents[this.currentCardIndex];
        this.revealArea.innerHTML = '';
        const cardElement = createDetailCard(cardData);
        cardElement.addEventListener('click', () => this.handleCardSelect(cardData, cardElement));
        this.revealArea.appendChild(cardElement);
    }

    handleCardSelect(cardData, cardElement) {
        if (this.phase === 'EQUIP' && this.selectedCardElement === cardElement) {
            this.clearSelection();
            this.phase = 'REVEAL';
            this.championsStage.classList.add('upgrade-stage-hidden');
        } else {
            this.clearSelection();
            this.phase = 'EQUIP';
            this.selectedCardData = cardData;
            this.selectedCardElement = cardElement;
            this.selectedCardElement.querySelector('.hero-card-container').classList.add('selected');

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

    clearSelection() {
        if (this.selectedCardElement) {
            this.selectedCardElement.querySelector('.hero-card-container').classList.remove('selected');
        }
        this.selectedCardData = null;
        this.selectedCardElement = null;
    }

    renderTeamForEquip() {
        this.teamRoster.innerHTML = '';
        if (!this.playerTeam || !this.selectedCardData) return;

        [1, 2].forEach(num => {
            const championSlotData = {
                hero: this.playerTeam[`hero${num}`],
                ability: this.playerTeam[`ability${num}`],
                weapon: this.playerTeam[`weapon${num}`],
                armor: this.playerTeam[`armor${num}`],
            };

            if (!championSlotData.hero) return;

            const championContainer = createChampionDisplay(championSlotData, num, this.selectedCardData.type);

            championContainer.querySelectorAll('.equipment-socket.targetable').forEach(socket => {
                socket.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.handleSocketSelect(socket.dataset.slot);
                });
            });

            this.teamRoster.appendChild(championContainer);
        });
    }
}
