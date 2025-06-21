let tooltipEl

function ensureElement() {
  if (!tooltipEl) {
    tooltipEl = document.getElementById('status-tooltip')
    if (!tooltipEl) {
      tooltipEl = document.createElement('div')
      tooltipEl.id = 'status-tooltip'
      tooltipEl.className = 'status-tooltip'
      tooltipEl.innerHTML = `
        <h4 class="status-tooltip-name"></h4>
        <p class="status-tooltip-duration"></p>
        <p class="status-tooltip-description"></p>
      `
      document.body.appendChild(tooltipEl)
    }
  }
  return tooltipEl
}

export function showStatusTooltip(effect, x, y) {
  const el = ensureElement()
  const nameEl = el.querySelector('.status-tooltip-name')
  const durEl = el.querySelector('.status-tooltip-duration')
  const descEl = el.querySelector('.status-tooltip-description')
  if (nameEl) nameEl.textContent = effect.name
  if (durEl) durEl.textContent = `Turns remaining: ${effect.turnsRemaining}`
  if (descEl) descEl.textContent = effect.description || ''
  el.style.left = `${x + 10}px`
  el.style.top = `${y + 10}px`
  el.classList.add('visible')
}

export function hideStatusTooltip() {
  const el = ensureElement()
  el.classList.remove('visible')
}
