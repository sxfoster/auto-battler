export class PackScene {
    constructor(element, onPackOpened) {
        this.element = element;
        this.onPackOpened = onPackOpened;

        // Keep title and instruction references
        this.titleElement = this.element.querySelector('#pack-scene-title');
        this.instructionsElement = this.element.querySelector('#pack-scene-instructions');

        // References to new booster pack elements
        this.packageEl = this.element.querySelector('#package');
        this.topCrimp = this.element.querySelector('#top-crimp');
        this.imageArea = this.element.querySelector('#image-area');

        // Bind interactions
        if (this.packageEl) {
            this.packageEl.addEventListener('click', () => this._handleTearOff());
            this.packageEl.addEventListener('mousemove', (e) => this._handleMouseMove(e));
            this.packageEl.addEventListener('mouseleave', () => this._handleMouseLeave());
        }
        if (this.topCrimp) {
            // The crimp element still hosts the tear-off animation but no longer
            // directly receives click events.
        }
    }

    // Handle tear-off animation and notify when done
    _handleTearOff() {
        if (this.isOpening) return;
        this.isOpening = true;

        this.topCrimp.classList.add('torn-off');
        this.topCrimp.style.pointerEvents = 'none';
        this.instructionsElement.textContent = 'Revealing cards...';

        this.topCrimp.addEventListener('animationend', () => {
            this.packageEl.classList.add('is-open');
            setTimeout(() => {
                this.onPackOpened();
            }, 300);
        }, { once: true });
    }

    // Tilt the pack and update glare
    _handleMouseMove(e) {
        if (!this.packageEl) return;
        const rect = this.packageEl.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const maxTilt = 10;
        const rotateY = (x / (rect.width / 2)) * maxTilt;
        const rotateX = (y / (rect.height / 2)) * -maxTilt;

        this.packageEl.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

        this.imageArea.style.setProperty('--glare-x', `${(e.clientX - rect.left) * 100 / rect.width}%`);
        this.imageArea.style.setProperty('--glare-y', `${(e.clientY - rect.top) * 100 / rect.height}%`);
        this.imageArea.style.setProperty('--glare-opacity', '1');
    }

    // Reset tilt and glare
    _handleMouseLeave() {
        if (!this.packageEl) return;
        this.packageEl.style.transform = 'rotateX(0deg) rotateY(0deg)';
        this.imageArea.style.setProperty('--glare-opacity', '0');
    }

    render(draftStage) {
        this.isOpening = false;
        if (draftStage.includes('HERO_1')) {
            this.titleElement.textContent = 'Forge Your First Champion';
        } else if (draftStage.includes('HERO_2')) {
            this.titleElement.textContent = 'Forge Your Second Champion';
        }
        this.instructionsElement.textContent = 'Click anywhere on the pack to tear it open.';
    }

    reset() {
        this.isOpening = false;
        if (this.topCrimp) {
            this.topCrimp.classList.remove('torn-off');
            this.topCrimp.style.pointerEvents = 'auto';
        }
        if (this.packageEl) {
            this.packageEl.classList.remove('is-open');
        }
    }

    show() {
        this.element.classList.remove('hidden');
    }

    hide() {
        this.element.classList.add('hidden');
    }
}

