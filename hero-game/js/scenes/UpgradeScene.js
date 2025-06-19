// hero-game/js/scenes/UpgradeScene.js

import { createDetailCard } from '../ui/CardRenderer.js';
import { createChampionDisplay } from '../ui/ChampionDisplay.js';
import { allPossibleWeapons, allPossibleArmors } from '../data.js';

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
        this.takeCardButton = element.querySelector('#take-card-btn');

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
        if (this.takeCardButton) {
            this.takeCardButton.addEventListener('click', () => this.handleTakeCard());
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

        this._updateCardCounter();
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
        this._updateCardCounter();
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
        if (this.selectedCardElement === cardElement) return;

        this.clearSelection();

        this.selectedCardData = cardData;
        this.selectedCardElement = cardElement;
        this.selectedCardElement.classList.add('selected');

        if (this.takeCardButton) {
            this.takeCardButton.disabled = false;
        }
    }

    handleDismissCard() {
        if (this.phase === 'REVEAL' || this.phase === 'EQUIP') {
            this.currentCardIndex++;
            this.revealNextCard();
        }
    }

    handleTakeCard() {
        if (!this.selectedCardData) return;

        this.phase = 'EQUIP';
        this.renderTeamForEquip();
        this.championsStage.classList.remove('upgrade-stage-hidden');
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
            this.selectedCardElement.classList.remove('selected');
        }
        this.selectedCardData = null;
        this.selectedCardElement = null;

        if (this.takeCardButton) {
            this.takeCardButton.disabled = true;
        }
    }

    _showComparisonTooltip(event, slotKey) {
        const tooltipElement = document.getElementById('item-tooltip');
        if (!tooltipElement || !this.selectedCardData) return;

        const newStats = this.selectedCardData.statBonuses || {};

        const equippedItemId = this.playerTeam[slotKey];
        const itemPool = slotKey.startsWith('weapon') ? allPossibleWeapons : allPossibleArmors;
        const equippedItem = equippedItemId ? itemPool.find(i => i.id === equippedItemId) : null;
        const oldStats = equippedItem ? equippedItem.statBonuses || {} : {};

        let comparisonHtml = `<h4 class="font-bold text-lg font-cinzel text-amber-300 mb-2">${this.selectedCardData.name}</h4>`;

        const allStatKeys = [...new Set([...Object.keys(newStats), ...Object.keys(oldStats)])];
        allStatKeys.forEach(stat => {
            const oldValue = oldStats[stat] || 0;
            const newValue = newStats[stat] || 0;
            const diff = newValue - oldValue;

            const diffText = `(${diff > 0 ? '+' : ''}${diff})`;
            const diffColor = diff === 0 ? 'text-gray-400' : diff > 0 ? 'text-green-400' : 'text-red-400';

            comparisonHtml += `<div class="flex justify-between items-center">
                <span>${stat}: ${newValue}</span>
                <span class="text-xs ${diffColor}">${diffText} vs. ${oldValue}</span>
            </div>`;
        });

        tooltipElement.innerHTML = comparisonHtml;
        tooltipElement.classList.remove('hidden');
        tooltipElement.style.left = `${event.clientX + 15}px`;
        tooltipElement.style.top = `${event.clientY + 15}px`;
    }

    _hideComparisonTooltip() {
        const tooltipElement = document.getElementById('item-tooltip');
        if (tooltipElement) {
            tooltipElement.classList.add('hidden');
        }
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
                socket.addEventListener('mouseover', (e) => {
                    this._showComparisonTooltip(e, socket.dataset.slot);
                });
                socket.addEventListener('mouseout', () => {
                    this._hideComparisonTooltip();
                });
                socket.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.handleSocketSelect(socket.dataset.slot);
                });
            });

            this.teamRoster.appendChild(championContainer);
        });
    }

    _updateCardCounter() {
        const counterElement = this.element.querySelector('#upgrade-card-counter');
        if (!counterElement) return;

        counterElement.innerHTML = '';
        const totalCards = this.packContents.length;

        for (let i = 0; i < totalCards; i++) {
            const pip = document.createElement('div');
            pip.className = 'card-pip';
            if (i >= this.currentCardIndex) {
                pip.classList.add('active');
            }
            counterElement.appendChild(pip);
        }
    }
}
