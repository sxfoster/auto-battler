import { createDetailCard } from '../ui/CardRenderer.js';
import { allPossibleHeroes, allPossibleWeapons, allPossibleArmors, allPossibleAbilities } from '../data.js';

export class UpgradeScene {
    constructor(element, onComplete) {
        this.element = element;
        this.onComplete = onComplete;
        this.bonusPool = this.element.querySelector('#upgrade-bonus-pool');
        this.teamRoster = this.element.querySelector('#upgrade-team-roster');
        this.continueButton = this.element.querySelector('#upgrade-continue-button');
        if (this.continueButton) {
            this.continueButton.addEventListener('click', () => {
                if (this.pendingSlot && this.selectedCard) {
                    this.onComplete(this.pendingSlot, this.selectedCard.id);
                }
            });
        }
    }

    render(bonusCards, playerTeam) {
        this.selectedCard = null;
        this.pendingSlot = null;
        if (this.continueButton) this.continueButton.classList.add('hidden');
        this.renderBonusPool(bonusCards);
        this.renderTeam(playerTeam);
    }

    renderBonusPool(cards) {
        this.bonusPool.innerHTML = '';
        cards.forEach(card => {
            const el = document.createElement('div');
            el.className = 'bonus-card';
            el.style.backgroundImage = `url('${card.art}')`;
            el.addEventListener('click', () => this.handleBonusCardSelect(card, el));
            this.bonusPool.appendChild(el);
        });
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
            cardElem.querySelector('.hero-card').addEventListener('click', () => this.handleSocketSelect(`hero${num}`));
            container.appendChild(cardElem);

            const abilitySocket = this.createSocket(ability, `ability${num}`, 'ability-socket');
            if (abilitySocket) container.appendChild(abilitySocket);
            const weaponSocket = this.createSocket(weapon, `weapon${num}`, 'weapon-socket');
            if (weaponSocket) container.appendChild(weaponSocket);
            const armorSocket = this.createSocket(armor, `armor${num}`, 'armor-socket');
            if (armorSocket) container.appendChild(armorSocket);

            this.teamRoster.appendChild(container);
        });
    }

    createSocket(itemData, slotKey, cssClass) {
        if (!itemData) return null;
        const socket = document.createElement('div');
        socket.className = `equipment-socket ${cssClass}`;
        socket.style.backgroundImage = `url('${itemData.art}')`;
        socket.dataset.slot = slotKey;
        socket.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleSocketSelect(slotKey);
        });
        return socket;
    }

    handleBonusCardSelect(card, element) {
        this.selectedCard = card;
        this.pendingSlot = null;
        if (this.continueButton) this.continueButton.classList.add('hidden');
        this.bonusPool.querySelectorAll('.bonus-card').forEach(el => el.classList.remove('selected'));
        element.classList.add('selected');
        this.updateTargetableSockets();
    }

    updateTargetableSockets() {
        this.element.querySelectorAll('.equipment-socket, .champion-display, .hero-card-container').forEach(el => el.classList.remove('targetable'));
        if (!this.selectedCard) return;
        const type = this.selectedCard.type;
        if (type === 'weapon') {
            this.element.querySelectorAll('.weapon-socket').forEach(el => el.classList.add('targetable'));
        } else if (type === 'armor') {
            this.element.querySelectorAll('.armor-socket').forEach(el => el.classList.add('targetable'));
        } else if (type === 'ability') {
            this.element.querySelectorAll('.ability-socket').forEach(el => el.classList.add('targetable'));
        } else if (type === 'hero') {
            this.element.querySelectorAll('.champion-display, .hero-card-container').forEach(el => el.classList.add('targetable'));
        }
    }

    handleSocketSelect(slotKey) {
        if (!this.selectedCard) return;
        const expected = this.selectedCard.type;
        if (!slotKey.startsWith(expected)) return;
        if (!window.confirm('Replace this item with the selected card?')) return;
        this.pendingSlot = slotKey;
        if (this.continueButton) this.continueButton.classList.remove('hidden');
    }
}
