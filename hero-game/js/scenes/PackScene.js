export class PackScene {
    constructor(element, onPackOpened) {
        this.element = element;
        this.onPackOpened = onPackOpened;

        this.titleElement = this.element.querySelector('#pack-scene-title');
        this.packElements = {
            hero: this.element.querySelector('#hero-pack'),
            ability: this.element.querySelector('#ability-pack'),
            weapon: this.element.querySelector('#weapon-pack'),
            armor: this.element.querySelector('#armor-pack')
        };

        Object.values(this.packElements).forEach(el => {
            el.addEventListener('click', () => this._handlePackOpen(el));
        });
    }

    _handlePackOpen(packElement) {
        if (this.isOpening) return;
        this.isOpening = true;

        this.currentPackElement = packElement;
        packElement.style.pointerEvents = 'none';
        packElement.classList.add('opening');

        packElement.addEventListener('animationend', () => {
            this.onPackOpened();
        }, { once: true });
    }
    
    render(draftStage) {
        if (draftStage.startsWith('HERO')) {
            this.titleElement.textContent = draftStage === 'HERO_1_PACK' ? 'Open Your Hero Pack' : 'Open Pack for Second Hero';
        } else if (draftStage.startsWith('ARMOR')) {
            this.titleElement.textContent = draftStage === 'ARMOR_1_PACK' ? 'Open Your Armor Pack' : 'Open Pack for Second Armor';
        } else if (draftStage.startsWith('ABILITY')) {
            this.titleElement.textContent = 'Open Ability Pack';
        } else if (draftStage.startsWith('WEAPON')) {
            this.titleElement.textContent = draftStage === 'WEAPON_1_PACK' ? 'Open Your Weapon Pack' : 'Open Pack for Second Weapon';
        } else {
            this.titleElement.textContent = 'Open Pack';
        }
    }

    reset() {
        this.isOpening = false;
        Object.values(this.packElements).forEach(el => {
            el.classList.remove('opening');
            el.style.pointerEvents = 'auto';
        });
    }
    
    show() {
        this.element.classList.remove('hidden');
    }

    hide() {
        this.element.classList.add('hidden');
    }
}
