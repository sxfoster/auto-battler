const detailCardTemplate = document.getElementById('detail-card-template');
const compactCardTemplate = document.getElementById('compact-card-template');

/**
 * Creates a large, detailed card for the draft scenes.
 * @param {object} item - The hero or weapon data object.
 * @param {function} selectionHandler - The function to call when the card is clicked.
 * @returns {HTMLElement} The created card element.
 */
export function createDetailCard(item, selectionHandler) {
    const clone = detailCardTemplate.content.cloneNode(true);
    const cardElement = clone.querySelector('.hero-card');
    const rarityClass = item.rarity.toLowerCase().replace(' ', '-');
    cardElement.classList.add(rarityClass);

    if (item.rarity === 'Ultra Rare') {
        clone.querySelector('.shimmer-effect').style.display = 'block';
    }

    clone.querySelector('.hero-art').style.backgroundImage = `url('${item.art}')`;
    clone.querySelector('.hero-name').textContent = item.name;

    let statsHtml = '';
    if (item.type === 'hero') {
        statsHtml = `
            <div class="stat-block"><span class="stat-value">${item.hp}</span><span class="stat-label">HP</span></div>
            <div class="stat-block"><span class="stat-value">${item.attack}</span><span class="stat-label">Attack</span></div>`;
    } else {
        statsHtml = `<div class="stat-block"><span class="stat-value">+${item.damage}</span><span class="stat-label">Damage</span></div>`;
    }
    clone.querySelector('.hero-stats').innerHTML = statsHtml;

    const abilitiesHtml = item.abilities.map(ab => 
        `<li>${ab.name}<div class="tooltip">${ab.description}</div></li>`
    ).join('');
    clone.querySelector('.hero-abilities').innerHTML = abilitiesHtml;

    cardElement.addEventListener('click', () => selectionHandler(item));
    return clone;
}

/**
 * Creates a smaller, compact card for the battle scene.
 * @param {object} combatant - The combatant object from the battle state.
 * @returns {HTMLElement} The created card element.
 */
export function createCompactCard(combatant) {
    const clone = compactCardTemplate.content.cloneNode(true);
    const cardElement = clone.querySelector('.compact-card');
    const rarityClass = combatant.heroData.rarity.toLowerCase().replace(' ', '-');
    
    cardElement.id = combatant.id;
    cardElement.classList.add(rarityClass);

    cardElement.querySelector('.compact-art').style.backgroundImage = `url('${combatant.heroData.art}')`;
    cardElement.querySelector('.compact-name').textContent = combatant.heroData.name;
    
    updateHealthBar(combatant, cardElement);

    return cardElement;
}

/**
 * Updates the health bar and text on a compact card.
 * @param {object} combatant - The combatant object.
 * @param {HTMLElement} cardElement - The card element to update.
 */
export function updateHealthBar(combatant, cardElement) {
    const bar = cardElement.querySelector('.compact-hp-bar');
    const hpText = cardElement.querySelector('.hp-text');
    const percentage = (combatant.currentHp / combatant.maxHp) * 100;
    
    bar.style.width = `${percentage}%`;
    bar.style.backgroundColor = percentage > 50 ? '#48bb78' : percentage > 20 ? '#f59e0b' : '#ef4444';
    hpText.textContent = `${combatant.currentHp} / ${combatant.maxHp}`;
}
