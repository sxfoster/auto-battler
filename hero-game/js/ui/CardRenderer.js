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
    const rarityClass = (item.rarity || 'common').toLowerCase().replace(' ', '-');
    cardElement.classList.add(rarityClass);

    if (item.rarity === 'Epic') { // Changed 'Ultra Rare' to 'Epic'
        clone.querySelector('.shimmer-effect').style.display = 'block';
    }

    // Set universal properties
    clone.querySelector('.hero-art').style.backgroundImage = `url('${item.art}')`;
    clone.querySelector('.hero-name').textContent = item.name;

    let statsHtml = '';
    let descriptionHtml = '';

    // Use a switch statement to handle different item types
    switch(item.type) {
        case 'hero':
            cardElement.style.backgroundColor = '#1e293b';
            statsHtml = `
                <div class="stat-block"><span class="stat-value">${item.hp}</span><span class="stat-label">HP</span></div>
                <div class="stat-block"><span class="stat-value">${item.attack}</span><span class="stat-label">Attack</span></div>`;

            if (item.abilities && item.abilities.length > 0) {
                descriptionHtml = item.abilities.map(ab => `
                    <li class="ability-item">${ab.name}
                        <div class="tooltip">${ab.effect}</div>
                    </li>
                `).join('');
            } else {
                descriptionHtml = `<p class="item-description">Class: ${item.class}</p>`;
            }
            break;
        case 'ability':
            cardElement.style.backgroundColor = '#1e293b';
            // Display the Energy Cost and Category as the primary "stats"
            statsHtml = `
        <div class="stat-block"><span class="stat-value">${item.energyCost}</span><span class="stat-label">ENERGY</span></div>
        <div class="stat-block"><span class="stat-value">${item.category.toUpperCase()}</span><span class="stat-label">TYPE</span></div>
    `;

            // Display the ability's effect description
            descriptionHtml = `
        <div class="item-ability">
            <p class="ability-description">${item.effect}</p>
        </div>`;
            break;
        case 'weapon':
            cardElement.style.backgroundColor = '#1e293b';

            // Dynamically create stat blocks from the statBonuses object
            if (item.statBonuses) {
                statsHtml = Object.entries(item.statBonuses).map(([stat, value]) => {
                    const sign = value > 0 ? '+' : '';
                    return `<div class="stat-block"><span class="stat-value">${sign}${value}</span><span class="stat-label">${stat}</span></div>`;
                }).join('');
            }

            // Display the ability name and description if it exists
            if (item.ability) {
                descriptionHtml = `
            <div class="item-ability">
                <span class="ability-name">${item.ability.name}</span>
                <p class="ability-description">${item.ability.description}</p>
            </div>`;
            }
            break;
        case 'armor':
            cardElement.style.backgroundColor = '#1e293b';

            // Dynamically create stat blocks from the statBonuses object
            if (item.statBonuses) {
                statsHtml = Object.entries(item.statBonuses).map(([stat, value]) => {
                    const sign = value > 0 ? '+' : '';
                    return `<div class="stat-block"><span class="stat-value">${sign}${value}</span><span class="stat-label">${stat}</span></div>`;
                }).join('');
            }

            // Display the armor type and passive ability if present
            descriptionHtml = `
                <div class="item-ability">
                    <span class="armor-type-label">${item.armorType} Armor</span>
                    ${item.ability ? `
                        <span class="ability-name">${item.ability.name}</span>
                        <p class="ability-description">${item.ability.description}</p>
                    ` : ''}
                </div>`;
            break;
        default:
            cardElement.style.backgroundColor = '#263238';
            // Fallback for unknown types
            descriptionHtml = `<p class="item-description">An unknown item.</p>`;
    }

    clone.querySelector('.hero-stats').innerHTML = statsHtml;
    clone.querySelector('.hero-abilities').innerHTML = descriptionHtml;

    if (selectionHandler) {
        cardElement.addEventListener('click', () => selectionHandler(item));
    }

    // The prototype returned the container, which is good practice
    return clone.querySelector('.hero-card-container');
}

/**
 * Creates a simplified card element for ability announcements.
 * @param {object} ability - The ability data object.
 * @returns {HTMLElement} The created card element.
 */
export function createAnnouncerCard(ability) {
    const clone = detailCardTemplate.content.cloneNode(true);
    const cardElement = clone.querySelector('.hero-card');
    const rarityClass = (ability.rarity || 'common').toLowerCase().replace(' ', '-');
    cardElement.classList.add(rarityClass);

    clone.querySelector('.hero-art').style.backgroundImage = `url('${ability.art}')`;
    clone.querySelector('.hero-name').textContent = ability.name;

    const statsHtml = `
        <div class="stat-block"><span class="stat-value">${ability.energyCost}</span><span class="stat-label">ENERGY</span></div>
        <div class="stat-block"><span class="stat-value">${ability.category.toUpperCase()}</span><span class="stat-label">TYPE</span></div>
    `;
    const descriptionHtml = `
        <div class="item-ability">
            <p class="ability-description">${ability.effect}</p>
        </div>`;

    clone.querySelector('.hero-stats').innerHTML = statsHtml;
    clone.querySelector('.hero-abilities').innerHTML = descriptionHtml;

    return clone.querySelector('.hero-card-container');
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
    updateEnergyDisplay(combatant, cardElement);

    return cardElement;
}

/**
 * Updates the health bar and text on a compact card.
 * @param {object} combatant - The combatant object.
 * @param {HTMLElement} cardElement - The card element to update.
 */
export function updateHealthBar(combatant, cardElement) {
    const hpBar = cardElement.querySelector('.compact-hp-bar');
    const damageBar = cardElement.querySelector('.compact-hp-bar-damage');
    const hpText = cardElement.querySelector('.hp-text');

    const newHpPercentage = (combatant.currentHp / combatant.maxHp) * 100;

    damageBar.style.width = `${newHpPercentage}%`;

    hpBar.style.backgroundColor = '#ffffff';

    setTimeout(() => {
        hpBar.style.backgroundColor = newHpPercentage > 50 ? '#48bb78' : newHpPercentage > 20 ? '#f59e0b' : '#ef4444';
        hpBar.style.width = `${newHpPercentage}%`;
    }, 100);

    hpText.textContent = `${combatant.currentHp} / ${combatant.maxHp}`;
}

export function updateEnergyDisplay(combatant, cardElement) {
    const energyValue = cardElement.querySelector('.compact-energy-value');
    if (energyValue) {
        energyValue.textContent = combatant.currentEnergy;
    }
}
