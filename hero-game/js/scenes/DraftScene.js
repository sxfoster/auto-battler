import { createDetailCard } from '../ui/CardRenderer.js';

export class DraftScene {
    constructor(element, onHeroSelected) {
        this.element = element;
        this.onHeroSelected = onHeroSelected;

        this.instructionsElement = this.element.querySelector('#draft-instructions');
        this.poolElement = this.element.querySelector('#draft-pool');
    }

    render(packData, draftStage) {
        this.poolElement.innerHTML = '';
        this.instructionsElement.textContent = `Choose your ${draftStage === 'HERO_1_DRAFT' ? 'first' : 'second'} hero.`;

        packData.forEach(hero => {
            const cardElement = createDetailCard(hero, () => this.onHeroSelected(hero));
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
