// hero-game/js/scenes/RecapScene.js

import { createChampionDisplay } from '../ui/ChampionDisplay.js';

export class RecapScene {
    constructor(element, onContinue) {
        this.element = element;
        this.onContinue = onContinue;

        this.displayArea = this.element.querySelector('#recap-display-area');
        this.continueButton = this.element.querySelector('#recap-continue-button');
        if (this.continueButton) {
            this.continueButton.addEventListener('click', () => this.onContinue());
        }
    }

    setContinueButtonLabel(text) {
        if (this.continueButton) {
            this.continueButton.textContent = text;
        }
    }

    render(championData, championNum) {
        this.displayArea.innerHTML = '';
        const championDisplayElement = createChampionDisplay(championData, championNum);
        this.displayArea.appendChild(championDisplayElement);
    }
}
