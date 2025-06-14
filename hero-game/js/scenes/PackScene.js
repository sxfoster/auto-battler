export class PackScene {
    constructor(element, onPackOpened) {
        this.element = element;
        this.onPackOpened = onPackOpened;

        this.titleElement = this.element.querySelector('#pack-scene-title');
        this.packElement = this.element.querySelector('#booster-pack');
        
        this.packElement.addEventListener('click', () => this._handlePackOpen());
    }

    _handlePackOpen() {
        if (this.isOpening) return;
        this.isOpening = true;

        this.packElement.style.pointerEvents = 'none';
        this.packElement.classList.add('opening');

        this.packElement.addEventListener('animationend', () => {
            this.onPackOpened();
        }, { once: true });
    }
    
    render(draftStage) {
        if (draftStage.startsWith('HERO')) {
            this.titleElement.textContent = draftStage === 'HERO_1_PACK' ? 'Open Your Hero Pack' : 'Open Pack for Second Hero';
        } else if (draftStage.startsWith('ARMOR')) {
            this.titleElement.textContent = draftStage === 'ARMOR_1_PACK' ? 'Open Your Armor Pack' : 'Open Pack for Second Armor';
        } else {
            this.titleElement.textContent = 'Open Pack';
        }
    }

    reset() {
        this.isOpening = false;
        this.packElement.classList.remove('opening');
        this.packElement.style.pointerEvents = 'auto';
    }
    
    show() {
        this.element.classList.remove('hidden');
    }

    hide() {
        this.element.classList.add('hidden');
    }
}
