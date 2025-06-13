// --- GENERIC CARD CREATION ---
export function createDetailCard(item, selectionHandler) {
    const container = document.createElement('div');
    container.className = 'hero-card-container';
    const cardFront = document.createElement('div');
    const rarityClass = item.rarity.toLowerCase().replace(' ', '-');
    cardFront.className = `hero-card ${rarityClass}`;

    let statsHtml = item.type === 'hero' ? `
        <div class="stat-block"><span class="stat-value">${item.hp}</span><span class="stat-label">HP</span></div>
        <div class="stat-block"><span class="stat-value">${item.attack}</span><span class="stat-label">Attack</span></div>` : `
        <div class="stat-block"><span class="stat-value">+${item.damage}</span><span class="stat-label">Damage</span></div>`;

    cardFront.innerHTML = `
        ${item.rarity === 'Ultra Rare' ? '<div class="shimmer-effect"></div>' : ''}
        <div class="hero-art" style="background-image: url('${item.art}')"></div>
        <h3 class="hero-name font-cinzel">${item.name}</h3>
        <div class="hero-stats">${statsHtml}</div>
        <ul class="hero-abilities">
            ${item.abilities.map(ab => `<li>${ab.name}<div class="tooltip">${ab.description}</div></li>`).join('')}
        </ul>`;
    container.appendChild(cardFront);
    cardFront.addEventListener('click', () => selectionHandler(item));
    return container;
}

// Placeholder for other UI functions that might be added later
export function displayMessage(message) {
  console.log(message);
}
