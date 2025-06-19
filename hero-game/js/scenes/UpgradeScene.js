// hero-game/js/scenes/UpgradeScene.js

import { createDetailCard } from '../ui/CardRenderer.js';
import { createChampionDisplay } from '../ui/ChampionDisplay.js';
import { allPossibleWeapons, allPossibleArmors, allPossibleHeroes } from '../data.js';

export class UpgradeScene {
    constructor(element, onComplete, onDismantle, onReroll) {
        this.element = element;
        this.onComplete = onComplete;
        this.onDismantle = onDismantle;
        this.onReroll = onReroll;

        // Stage containers
        this.packStage = element.querySelector('#upgrade-stage-pack');
        this.revealStage = element.querySelector('#upgrade-stage-reveal');
        this.championsStage = element.querySelector('#upgrade-stage-champions');

        // Interactive elements
        this.packContainer = element.querySelector('#upgrade-pack-container');
        this.revealArea = element.querySelector('#upgrade-reveal-area');
        this.teamRoster = element.querySelector('#upgrade-team-roster');
        this.dismantleButton = element.querySelector('#dismantle-card-btn');
        this.takeCardButton = element.querySelector('#take-card-btn');
        this.rerollButton = element.querySelector('#reroll-cards-btn');

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
        if (this.dismantleButton) {
            this.dismantleButton.addEventListener('click', () => this.handleDismantleCard());
        }
        if (this.takeCardButton) {
            this.takeCardButton.addEventListener('click', () => this.handleTakeCard());
        }
        if (this.rerollButton) {
            this.rerollButton.addEventListener('click', () => {
                if (this.onReroll) this.onReroll();
            });
        }
    }

    render(packContents, playerTeam, inventory) {
        this.phase = 'PACK';
        this.packContents = packContents;
        this.playerTeam = playerTeam;
        this.currentCardIndex = 0;
        this.clearSelection();

        this.packStage.classList.remove('upgrade-stage-hidden');
        this.revealStage.classList.add('upgrade-stage-hidden');
        this.championsStage.classList.add('upgrade-stage-hidden');

        this._updateCardCounter();

        // === START: NEW CODE ===
        if (this.rerollButton) {
            this.rerollButton.disabled = inventory && inventory.rerollTokens < 1;
        }
        // === END: NEW CODE ===
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
        // === START: FIX FOR DUPLICATE CARD ===
        const revealArea = this.element.querySelector('#upgrade-reveal-area');
        if (revealArea) {
            revealArea.style.visibility = 'visible';
        }
        // === END: FIX FOR DUPLICATE CARD ===

        this.championsStage.classList.add('upgrade-stage-hidden');
        this.clearSelection();
        this._updateCardCounter();

        if (this.currentCardIndex >= this.packContents.length) {
            this.onComplete(null, null);
            return;
        }

        const cardData = this.packContents[this.currentCardIndex];
        const revealAreaContainer = this.element.querySelector('#upgrade-reveal-area');
        revealAreaContainer.innerHTML = '';
        const cardElement = createDetailCard(cardData);
        cardElement.addEventListener('click', () => this.handleCardSelect(cardData, cardElement));
        revealAreaContainer.appendChild(cardElement);
    }

    handleCardSelect(cardData, cardElement) {
        if (this.selectedCardElement) return;

        this.selectedCardData = cardData;
        this.selectedCardElement = cardElement;

        cardElement.classList.add('is-selecting');
        this.dismantleButton.disabled = true;

        const holdingSlot = this.element.querySelector('#upgrade-holding-slot');
        holdingSlot.innerHTML = '';
        const cardClone = cardElement.cloneNode(true);
        cardClone.classList.remove('is-selecting');
        holdingSlot.appendChild(cardClone);

        cardElement.addEventListener('animationend', () => {
            // === START: FIX FOR DUPLICATE CARD ===
            const revealArea = this.element.querySelector('#upgrade-reveal-area');
            if (revealArea) {
                revealArea.style.visibility = 'hidden';
            }
            // === END: FIX FOR DUPLICATE CARD ===

            this.phase = 'EQUIP';
            this.renderTeamForEquip();
            this.championsStage.classList.remove('upgrade-stage-hidden');
        }, { once: true });
    }

    handleDismantleCard() {
        if (this.phase !== 'REVEAL' && this.phase !== 'EQUIP') return;

        // === START: NEW LOGIC ===
        if (this.selectedCardData) {
            let shardsAwarded = 0;
            switch (this.selectedCardData.rarity) {
                case 'Uncommon': shardsAwarded = 3; break;
                case 'Rare': shardsAwarded = 5; break;
                case 'Epic': shardsAwarded = 10; break;
                default: shardsAwarded = 1; break; // Common
            }

            if (this.onDismantle) {
                this.onDismantle(shardsAwarded);
            }
            console.log(`Dismantled for ${shardsAwarded} shards.`);
        }
        // === END: NEW LOGIC ===

        this.currentCardIndex++;
        this.revealNextCard();
    }

    handleTakeCard() {
        if (!this.selectedCardData) return;

        this.phase = 'EQUIP';
        this.renderTeamForEquip();
        this.championsStage.classList.remove('upgrade-stage-hidden');
    }

    handleSocketSelect(slotKey) {
        if (this.phase !== 'EQUIP') return;

        this.phase = 'ANIMATING';
        this.championsStage.style.pointerEvents = 'none';

        const holdingSlot = this.element.querySelector('#upgrade-holding-slot');
        const cardToAnimate = holdingSlot.querySelector('.hero-card-container');
        const targetSocket = document.querySelector(`[data-slot="${slotKey}"]`);

        if (!cardToAnimate || !targetSocket) return;

        const startRect = cardToAnimate.getBoundingClientRect();
        const endRect = targetSocket.getBoundingClientRect();

        const deltaX = endRect.left - startRect.left;
        const deltaY = endRect.top - startRect.top;
        const scaleX = endRect.width / startRect.width;
        const scaleY = endRect.height / startRect.height;

        cardToAnimate.style.setProperty('--card-equip-transform', `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})`);
        cardToAnimate.style.animation = `card-equip-to-socket 0.6s ease-in-out forwards`;

        cardToAnimate.addEventListener('animationend', () => {
            this.onComplete(slotKey, this.selectedCardData.id);
            holdingSlot.innerHTML = '';
            this.championsStage.style.pointerEvents = 'auto';
        }, { once: true });
    }

    clearSelection() {
        if (this.selectedCardElement) {
            this.selectedCardElement.classList.remove('is-selecting');
        }
        this.selectedCardData = null;
        this.selectedCardElement = null;

        if (this.dismantleButton) {
            this.dismantleButton.disabled = false;
        }

        const holdingSlot = this.element.querySelector('#upgrade-holding-slot');
        if (holdingSlot) holdingSlot.innerHTML = '';

        // === START: FIX FOR DUPLICATE CARD ===
        const revealArea = this.element.querySelector('#upgrade-reveal-area');
        if (revealArea) {
            revealArea.style.visibility = 'visible';
        }
        this.championsStage.classList.add('upgrade-stage-hidden');
        // === END: FIX FOR DUPLICATE CARD ===
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

            const hero = allPossibleHeroes.find(h => h.id === championSlotData.hero);
            if (!hero) return;

            let isChampionValid = true;
            if (this.selectedCardData.type === 'ability') {
                if (hero.class !== this.selectedCardData.class) {
                    isChampionValid = false;
                }
            }

            const championContainer = createChampionDisplay(championSlotData, num, this.selectedCardData.type);

            if (!isChampionValid) {
                championContainer.classList.add('is-invalid');
            }

            if (isChampionValid) {
                championContainer.querySelectorAll('.equipment-socket.targetable').forEach(socket => {
                    socket.addEventListener('mouseover', (e) => this._showComparisonTooltip(e, socket.dataset.slot));
                    socket.addEventListener('mouseout', () => this._hideComparisonTooltip());
                    socket.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.handleSocketSelect(socket.dataset.slot);
                    });
                });
            }

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
