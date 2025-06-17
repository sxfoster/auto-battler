import { createDetailCard } from '../ui/CardRenderer.js';

export class RevealScene {
    constructor(element, onRevealComplete) {
        this.element = element;
        this.onRevealComplete = onRevealComplete;

        this.revealArea = this.element.querySelector('#reveal-area');
        // Grab the instructions element if present. Some prototype pages may not
        // include it, so guard against a null result.
        this.instructions = this.element.querySelector('#reveal-instructions');

        this.packContents = [];
        this.revealedCardCount = 0;
    }

    startReveal(choices) {
        this.packContents = choices;
        this.revealedCardCount = 0;
        this.revealArea.innerHTML = '';
        if (this.instructions) {
            this.instructions.textContent = 'Click a card to reveal it.';
        }

        choices.slice().reverse().forEach((item, index) => {
            const cardWrapper = document.createElement('div');
            // Initially display the card as the back side with glow effects
            cardWrapper.className = 'revealed-card card-back-unrevealed';
            cardWrapper.dataset.cardIndex = choices.length - 1 - index;

            const rotation = (index - 1) * 5;
            const yOffset = Math.abs(index - 1) * 20;
            cardWrapper.style.transform = `rotate(${rotation}deg) translateY(${yOffset}px) translateZ(${index * -20}px)`;
            cardWrapper.style.zIndex = index;

            const rarity = (item.rarity || 'common').toLowerCase();
            if (rarity === 'rare') cardWrapper.classList.add('pre-reveal-rare');
            else if (rarity === 'epic') cardWrapper.classList.add('pre-reveal-epic');

            cardWrapper.addEventListener('click', this.handleCardClick.bind(this));
            this.revealArea.appendChild(cardWrapper);
        });
    }

    handleCardClick(e) {
        const cardWrapper = e.currentTarget;
        if (cardWrapper.classList.contains('is-dismissed')) return;

        if (cardWrapper.classList.contains('is-flipping')) {
            cardWrapper.classList.add('is-dismissed');
            this.revealedCardCount++;
            if (this.revealedCardCount >= this.packContents.length) {
                if (this.instructions) {
                    this.instructions.textContent = 'All cards revealed!';
                }
                setTimeout(() => {
                    this.onRevealComplete(this.packContents);
                }, 300);
            }
        } else {
            const cardIndex = parseInt(cardWrapper.dataset.cardIndex);
            const itemData = this.packContents[cardIndex];

            const cardFace = document.createElement('div');
            cardFace.className = 'card-face';
            const detailCard = createDetailCard(itemData);
            cardFace.appendChild(detailCard);
            cardWrapper.appendChild(cardFace);

            cardWrapper.classList.add('is-flipping');
            if (this.instructions) {
                this.instructions.textContent = 'Click the card again to dismiss it.';
            }
        }
    }

    show() { this.element.classList.remove('hidden'); }
    hide() { this.element.classList.add('hidden'); }
}
