import { createDetailCard } from '../ui/CardRenderer.js';
import { allPossibleHeroes, allPossibleWeapons, allPossibleArmors, allPossibleAbilities } from '../data.js';

const tooltipEl = document.getElementById('item-tooltip');
const tooltipNameEl = document.getElementById('tooltip-name');
const tooltipStatsEl = document.getElementById('tooltip-stats');
const tooltipEffectEl = document.getElementById('tooltip-effect');

export class UpgradeScene {
    constructor(element, onComplete) {
        this.element = element;
        this.onComplete = onComplete;

        this.packEl = element.querySelector('#upgrade-package');
        this.topCrimp = element.querySelector('#upgrade-top-crimp');
        this.imageArea = element.querySelector('#upgrade-image-area');
        this.revealArea = element.querySelector('#upgrade-reveal-area');
        this.actionContainer = element.querySelector('#upgrade-actions');
        this.takeButton = element.querySelector('#upgrade-take-button');
        this.dismissButton = element.querySelector('#upgrade-dismiss-button');
        this.teamRoster = element.querySelector('#upgrade-team-roster');
        this.confirmModal = element.querySelector('#upgrade-confirm-modal');

        if (this.packEl) {
            this.packEl.addEventListener('click', () => this.handlePackOpen());
            this.packEl.addEventListener('mousemove', e => this.handleMouseMove(e));
            this.packEl.addEventListener('mouseleave', () => this.handleMouseLeave());
        }
        if (this.takeButton) this.takeButton.addEventListener('click', () => this.handleTakeCard());
        if (this.dismissButton) this.dismissButton.addEventListener('click', () => this.handleDismissCard());

        if (this.confirmModal) {
            this.confirmYes = this.confirmModal.querySelector('#upgrade-confirm-yes');
            this.confirmNo = this.confirmModal.querySelector('#upgrade-confirm-no');
            this.confirmYes.addEventListener('click', () => {
                this.confirmModal.classList.add('hidden');
                this.executeSwap();
            });
            this.confirmNo.addEventListener('click', () => {
                this.confirmModal.classList.add('hidden');
                this.pendingSlot = null;
                this.updateTargetableSockets();
            });
        }
    }

    render(packContents, playerTeam) {
        this.packContents = packContents;
        this.revealedCards = [];
        this.currentCardIndex = 0;
        this.phase = 'PACK';
        this.selectedCard = null;
        this.pendingSlot = null;

        if (this.topCrimp) {
            this.topCrimp.classList.remove('torn-off');
            this.topCrimp.style.pointerEvents = 'auto';
        }
        if (this.packEl) {
            this.packEl.classList.remove('is-open', 'hidden');
        }
        if (this.revealArea) {
            this.revealArea.classList.add('hidden');
            this.revealArea.innerHTML = '';
        }
        if (this.actionContainer) this.actionContainer.classList.add('hidden');
        if (this.confirmModal) this.confirmModal.classList.add('hidden');

        this.renderTeam(playerTeam);
    }

    handlePackOpen() {
        if (this.phase !== 'PACK' || this.isOpening) return;
        this.isOpening = true;
        this.topCrimp.classList.add('torn-off');
        this.topCrimp.style.pointerEvents = 'none';
        this.topCrimp.addEventListener('animationend', () => {
            this.packEl.classList.add('is-open');
            setTimeout(() => {
                this.packEl.classList.add('hidden');
                this.revealArea.classList.remove('hidden');
                this.phase = 'REVEAL';
                this.revealNextCard();
            }, 100);
        }, { once: true });
    }

    handleMouseMove(e) {
        if (!this.packEl) return;
        const rect = this.packEl.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const maxTilt = 10;
        const rotateY = (x / (rect.width / 2)) * maxTilt;
        const rotateX = (y / (rect.height / 2)) * -maxTilt;
        this.packEl.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        this.imageArea.style.setProperty('--glare-x', `${(e.clientX - rect.left) * 100 / rect.width}%`);
        this.imageArea.style.setProperty('--glare-y', `${(e.clientY - rect.top) * 100 / rect.height}%`);
        this.imageArea.style.setProperty('--glare-opacity', '1');
    }

    handleMouseLeave() {
        if (!this.packEl) return;
        this.packEl.style.transform = 'rotateX(0deg) rotateY(0deg)';
        this.imageArea.style.setProperty('--glare-opacity', '0');
    }

    revealNextCard() {
        if (this.currentCardIndex >= this.packContents.length) {
            this.onComplete();
            return;
        }
        this.revealArea.innerHTML = '';
        const remaining = this.packContents.slice(this.currentCardIndex);
        const stack = remaining.slice().reverse();
        stack.forEach((card, idx) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'revealed-card';
            const rotation = (idx - 1) * 5;
            const yOffset = Math.abs(idx - 1) * 20;
            wrapper.style.transform = `rotate(${rotation}deg) translateY(${yOffset}px) translateZ(${idx * -20}px)`;
            wrapper.style.zIndex = idx;
            if (idx === stack.length - 1) {
                const face = document.createElement('div');
                face.className = 'card-face';
                face.appendChild(createDetailCard(card));
                wrapper.appendChild(face);
            } else {
                wrapper.classList.add('card-back-unrevealed');
                const rarity = (card.rarity || 'common').toLowerCase();
                if (rarity === 'rare') wrapper.classList.add('pre-reveal-rare');
                else if (rarity === 'epic') wrapper.classList.add('pre-reveal-epic');
            }
            this.revealArea.appendChild(wrapper);
        });
        if (this.actionContainer) this.actionContainer.classList.remove('hidden');
    }

    handleTakeCard() {
        if (this.phase !== 'REVEAL') return;
        this.selectedCard = this.packContents[this.currentCardIndex];
        this.phase = 'REPLACEMENT';
        if (this.actionContainer) this.actionContainer.classList.add('hidden');
        if (this.revealArea) this.revealArea.classList.add('hidden');
        this.updateTargetableSockets();
    }

    handleDismissCard() {
        if (this.phase !== 'REVEAL') return;
        this.currentCardIndex++;
        if (this.currentCardIndex >= this.packContents.length) {
            this.onComplete();
            return;
        }
        this.revealNextCard();
    }

    renderTeam(team) {
        this.teamRoster.innerHTML = '';
        [1,2].forEach(num => {
            const heroId = team[`hero${num}`];
            if (!heroId) return;
            const heroData = { ...allPossibleHeroes.find(h => h.id === heroId) };
            const ability = allPossibleAbilities.find(a => a.id === team[`ability${num}`]);
            const weapon = allPossibleWeapons.find(w => w.id === team[`weapon${num}`]);
            const armor = allPossibleArmors.find(a => a.id === team[`armor${num}`]);
            if (ability) heroData.abilities = [ability];

            const container = document.createElement('div');
            container.className = 'champion-display';
            container.dataset.slot = `hero${num}`;

            const cardElem = createDetailCard(heroData);
            const heroCard = cardElem.querySelector('.hero-card');
            heroCard.addEventListener('click', () => this.handleSocketSelect(`hero${num}`));
            heroCard.addEventListener('mouseover', e => this.showTooltip(e, heroData));
            heroCard.addEventListener('mouseout', () => this.hideTooltip());
            container.appendChild(cardElem);

            const abilitySocket = this.createSocket(ability, `ability${num}`, 'ability-socket');
            if (abilitySocket) {
                abilitySocket.addEventListener('mouseover', e => ability && this.showTooltip(e, ability));
                abilitySocket.addEventListener('mouseout', () => this.hideTooltip());
                container.appendChild(abilitySocket);
            }
            const weaponSocket = this.createSocket(weapon, `weapon${num}`, 'weapon-socket');
            if (weaponSocket) {
                weaponSocket.addEventListener('mouseover', e => weapon && this.showTooltip(e, weapon));
                weaponSocket.addEventListener('mouseout', () => this.hideTooltip());
                container.appendChild(weaponSocket);
            }
            const armorSocket = this.createSocket(armor, `armor${num}`, 'armor-socket');
            if (armorSocket) {
                armorSocket.addEventListener('mouseover', e => armor && this.showTooltip(e, armor));
                armorSocket.addEventListener('mouseout', () => this.hideTooltip());
                container.appendChild(armorSocket);
            }
            this.teamRoster.appendChild(container);
        });
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
        socket.addEventListener('click', e => {
            e.stopPropagation();
            this.handleSocketSelect(slotKey);
        });
        return socket;
    }

    updateTargetableSockets() {
        this.element.querySelectorAll('.equipment-socket, .champion-display').forEach(el => el.classList.remove('targetable'));
        if (!this.selectedCard) return;
        const type = this.selectedCard.type;
        if (type === 'weapon') {
            this.element.querySelectorAll('.weapon-socket').forEach(el => el.classList.add('targetable'));
        } else if (type === 'armor') {
            this.element.querySelectorAll('.armor-socket').forEach(el => el.classList.add('targetable'));
        } else if (type === 'ability') {
            this.element.querySelectorAll('.ability-socket').forEach(el => el.classList.add('targetable'));
        } else if (type === 'hero') {
            this.element.querySelectorAll('.champion-display').forEach(el => el.classList.add('targetable'));
        }
    }

    handleSocketSelect(slotKey) {
        if (this.phase !== 'REPLACEMENT' || !this.selectedCard) return;
        const expected = this.selectedCard.type;
        if (!slotKey.startsWith(expected)) return;
        this.pendingSlot = slotKey;
        if (this.confirmModal) {
            this.confirmModal.classList.remove('hidden');
        } else {
            this.executeSwap();
        }
    }

    executeSwap() {
        if (!this.pendingSlot || !this.selectedCard) return;
        const socket = this.element.querySelector(`[data-slot='${this.pendingSlot}']`);
        if (!socket) return;
        const applyNewCard = () => {
            socket.removeEventListener('animationend', applyNewCard);
            socket.style.backgroundImage = `url('${this.selectedCard.art}')`;
            socket.classList.remove('empty-socket', 'card-pop-out');
            socket.classList.add('card-pop-in');
            socket.addEventListener('animationend', finishSwap);
        };
        const finishSwap = () => {
            socket.removeEventListener('animationend', finishSwap);
            socket.classList.remove('card-pop-in');
            this.onComplete(this.pendingSlot, this.selectedCard.id);
        };
        if (socket.classList.contains('empty-socket')) {
            applyNewCard();
        } else {
            socket.classList.add('card-pop-out');
            socket.addEventListener('animationend', applyNewCard);
        }
    }

    showTooltip(event, item) {
        if (!tooltipEl || !item) return;
        tooltipNameEl.textContent = item.name || '';
        tooltipStatsEl.textContent = this.formatStats(item);
        const effect = item.effect || (item.ability ? item.ability.description || item.ability.effect : '') || (item.class ? `Class: ${item.class}` : '');
        tooltipEffectEl.textContent = effect;
        tooltipEl.style.left = `${event.clientX + 12}px`;
        tooltipEl.style.top = `${event.clientY + 12}px`;
        tooltipEl.classList.remove('hidden');
    }

    hideTooltip() {
        if (tooltipEl) tooltipEl.classList.add('hidden');
    }

    formatStats(item) {
        if (item.statBonuses) {
            return Object.entries(item.statBonuses)
                .map(([stat, val]) => `${val > 0 ? '+' : ''}${val} ${stat}`)
                .join(' ');
        }
        if (typeof item.energyCost !== 'undefined') {
            return `${item.energyCost} ENERGY`;
        }
        if (typeof item.hp !== 'undefined' && typeof item.attack !== 'undefined') {
            return `${item.hp} HP  ${item.attack} ATK`;
        }
        return '';
    }
}
