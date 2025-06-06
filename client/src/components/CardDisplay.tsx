import React from 'react'
import type { Card } from '../../../shared/models/Card'
import placeholderArt from '../assets/placeholder-card-art.svg'

const abilityImages = import.meta.glob('../../../shared/images/ability_*.png', {
  eager: true,
  import: 'default',
}) as Record<string, string>

const getAbilityImage = (cardName: string): string => {
  const key = cardName.toLowerCase().replace(/ /g, '_')
  const path = `../../../shared/images/ability_${key}.png`
  return abilityImages[path] || abilityImages['../../../shared/images/ability_default.png'] || placeholderArt
}
import styles from './CardDisplay.module.css'

interface CardDisplayProps {
  card: Card
  onSelect: (card: Card) => void
  isSelected: boolean
  isDisabled: boolean // e.g., if card is already assigned to this character or max cards assigned
}

const CardDisplay: React.FC<CardDisplayProps> = ({ card, onSelect, isSelected, isDisabled }) => {
  const rarityClass = styles[`rarity-${card.rarity}`] || styles['rarity-Common']
  const classes = [styles.card, rarityClass]
  if (isSelected) classes.push(styles.selected)
  if (isDisabled) classes.push(styles.disabled)

  const handleClick = () => {
    if (!isDisabled) {
      onSelect(card)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleClick()
    }
  }

  const art = getAbilityImage(card.name)
  const classText = (card as any).classRestriction || (card as any).roleTag
  return (
    <div
      className={classes.join(' ')}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={isDisabled ? -1 : 0}
      role="button"
      aria-pressed={isSelected}
      aria-disabled={isDisabled}
      aria-label={`Select card ${card.name}, type ${card.category}. ${card.description || 'No effect description.'}`}
    >
      <div className={styles.frame}>
        <div className={styles.cardTop}>
          {'energyCost' in card && (
            <span className={styles.cardCost}>{(card as any).energyCost}</span>
          )}
        </div>
        <div className={styles.art} style={{ backgroundImage: `url(${art})` }}>
          <span className={styles.cardTitle}>{card.name}</span>
        </div>
        {/* type badge removed per design update */}
      </div>
      {classText && <span className={styles.classBanner}>{classText}</span>}
      <div className={styles.cardDescription}>{card.description || 'No effect description.'}</div>
      {('attack' in card || 'defense' in card) && (
        <div className={styles.stats}>
          {'attack' in card && (
            <span className={`${styles.stat} ${styles.attack}`}>🗡 {(card as any).attack}</span>
          )}
          {'defense' in card && (
            <span className={`${styles.stat} ${styles.defense}`}>🛡 {(card as any).defense}</span>
          )}
        </div>
      )}
    </div>
  )
};

export default CardDisplay;
