import { createDetailCard } from '../ui/CardRenderer.js';

export class DraftScene {
    constructor(element, onItemSelected) {
        this.element = element;
        this.onItemSelected = onItemSelected;

        this.instructionsElement = this.element.querySelector('#draft-instructions');
        this.poolElement = this.element.querySelector('#draft-pool');
    }

    render(packData, draftStage) {
        this.poolElement.innerHTML = '';
        let instruction = '';
        if (draftStage.startsWith('HERO')) {
            instruction = `Choose your ${draftStage === 'HERO_1_DRAFT' ? 'first' : 'second'} hero.`;
        } else if (draftStage.startsWith('WEAPON')) {
            instruction = 'Select a weapon.';
        } else if (draftStage.startsWith('ARMOR')) {
            instruction = 'Select an armor.';
        } else if (draftStage.startsWith('ABILITY')) {
            instruction = 'Select an ability.';
        } else {
            instruction = 'Select a card.';
        }
        this.instructionsElement.textContent = instruction;

        packData.forEach(item => {
            const cardElement = createDetailCard(item, () => this.onItemSelected(item));
            this.poolElement.appendChild(cardElement);
        });
    }

    show() {
        this.element.classList.remove('hidden');
    }

    hide() {
        this.element.classList.add('hidden');
    }
}
