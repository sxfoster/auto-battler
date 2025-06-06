import React, { useState } from 'react'
import type { Card } from '../../../shared/models/Card'
import { sampleCards } from '../../../shared/models/cards.js'
import { sampleRecipes } from '../../../shared/models/recipes.js'
import { attemptCraft, registerRecipeDiscovery } from '../../../shared/systems/crafting.js'
import type { Profession, Player } from '../../../shared/models'

interface SlotProps {
  card: Card | null
  onRemove: () => void
}

const Slot: React.FC<SlotProps> = ({ card, onRemove }) => {
  return (
    <div
      style={{ width: 80, height: 120, border: '1px dashed #999', margin: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onRemove}
    >
      {card ? card.name : 'Empty'}
    </div>
  )
}

/** Simple Magical Pouch crafting UI */
const MagicalPouch: React.FC<{ player: Player; profession: Profession }> = ({ player, profession }) => {
  const [slots, setSlots] = useState<(Card | null)[]>(Array(5).fill(null))
  const [result, setResult] = useState<string>('')

  const handleAdd = (card: Card) => {
    const idx = slots.findIndex((s) => s === null)
    if (idx !== -1) {
      const copy = [...slots]
      copy[idx] = card
      setSlots(copy)
    }
  }

  const handleRemove = (index: number) => {
    const copy = [...slots]
    copy[index] = null
    setSlots(copy)
  }

  const craft = () => {
    const used = slots.filter(Boolean) as Card[]
    const attempt = attemptCraft(profession, used, sampleRecipes)
    if (attempt.success && attempt.result) {
      attempt.result.craftedBy = player.name
      setResult(`Crafted: ${attempt.result.name}`)
      if (attempt.newRecipeDiscovered) {
        registerRecipeDiscovery(player, sampleRecipes.find(r => r.id === attempt.result?.id.split('_')[0])!)
      }
    } else {
      setResult('Experiment failed')
    }
    setSlots(Array(5).fill(null))
  }

  return (
    <div>
      <h2>Magical Pouch</h2>
      <div style={{ display: 'flex' }}>
        {slots.map((s, i) => (
          <Slot key={i} card={s} onRemove={() => handleRemove(i)} />
        ))}
      </div>
      <button onClick={craft}>Craft</button>
      {result && <p>{result}</p>}
      <h3>Inventory</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {sampleCards
          .filter((c) => c.category === 'Ingredient' || c.category === 'Equipment')
          .map((card) => (
            <div
              key={card.id}
              style={{ border: '1px solid #ccc', margin: 4, padding: 4, cursor: 'pointer' }}
              onClick={() => handleAdd(card)}
            >
              {card.name}
            </div>
          ))}
      </div>
    </div>
  )
}

export default MagicalPouch
