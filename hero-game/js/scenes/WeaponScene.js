import { createDetailCard } from '../ui/CardRenderer.js';

export class WeaponScene {
    constructor(element, onWeaponSelected, onPackClicked) {
        this.element = element;
        this.onWeaponSelected = onWeaponSelected;
        this.onPackClicked = onPackClicked;
        
        this.instructionsElement = this.element.querySelector('#weapon-instructions');
        this.packElement = this.element.querySelector('#weapon-pack-draft');
        this.draftPoolElement = this.element.querySelector('#weapon-draft-pool');
        
        this.packElement.addEventListener('click', () => this._handlePackOpen());
    }

    _handlePackOpen() {
        if (this.isOpening) return;
        this.isOpening = true;

        this.packElement.style.pointerEvents = 'none';
        this.packElement.classList.add('opening');

        this.packElement.addEventListener('animationend', () => {
            if (this.onPackClicked) this.onPackClicked();
        }, { once: true });
    }

    render(weaponChoices, heroName) {
        this.draftPoolElement.innerHTML = '';
        this.instructionsElement.textContent = `Select a weapon for ${heroName}.`;
        
        weaponChoices.forEach(weapon => {
            const cardElement = createDetailCard(weapon, () => this.onWeaponSelected(weapon));
            this.draftPoolElement.appendChild(cardElement);
        });
    }

    updateInstructions(text) {
        this.instructionsElement.textContent = text;
    }

    reset() {
        this.isOpening = false;
        this.packElement.classList.remove('opening');
        this.packElement.style.pointerEvents = 'auto';
        this.packElement.style.display = 'flex';
        this.draftPoolElement.style.display = 'none';
    }

    show() {
        this.element.classList.remove('hidden');
    }

    hide() {
        this.element.classList.add('hidden');
    }
}
