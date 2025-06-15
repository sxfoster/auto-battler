import { createDetailCard } from '../ui/CardRenderer.js';
import { allPossibleHeroes, allPossibleAbilities, allPossibleWeapons, allPossibleArmors } from '../data.js';

export class RecapScene {
    constructor(element, onContinue) {
        this.element = element;
        this.onContinue = onContinue;

        // Get references to all the slots
        this.heroSlot = this.element.querySelector('#recap-hero-slot');
        this.abilitySlot = this.element.querySelector('#recap-ability-slot');
        this.weaponSlot = this.element.querySelector('#recap-weapon-slot');
        this.armorSlot = this.element.querySelector('#recap-armor-slot');

        this.element.querySelector('#recap-continue-button').addEventListener('click', () => this.onContinue());
    }

    render(championData) {
        // Clear any previous cards
        this.heroSlot.innerHTML = '<h3 class="text-2xl font-cinzel mb-2">Hero</h3>';
        this.abilitySlot.innerHTML = '';
        this.weaponSlot.innerHTML = '';
        this.armorSlot.innerHTML = '';

        // Find the full data object for each selected item using its ID
        const hero = allPossibleHeroes.find(h => h.id === championData.hero);
        const ability = allPossibleAbilities.find(a => a.id === championData.ability);
        const weapon = allPossibleWeapons.find(w => w.id === championData.weapon);
        const armor = allPossibleArmors.find(a => a.id === championData.armor);

        // Create and append the cards to their slots
        if (hero) this.heroSlot.appendChild(createDetailCard(hero));
        if (ability) this.abilitySlot.appendChild(createDetailCard(ability));
        if (weapon) this.weaponSlot.appendChild(createDetailCard(weapon));
        if (armor) this.armorSlot.appendChild(createDetailCard(armor));
    }
}
