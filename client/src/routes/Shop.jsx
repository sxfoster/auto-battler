import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getGold, spendGold } from 'shared/resourcesState'
import { addCardToInventory } from 'shared/inventoryState'

export default function Shop() {
  const [gold, setGold] = useState(0)
  const navigate = useNavigate()
  // Example shop items
  const items = [
    { id: 'sword', name: 'Iron Sword', price: 5, type: 'card', card: {} },
    // …
  ]

  useEffect(() => {
    setGold(getGold())
  }, [])

  return (
    <div className="shop-container">
      <h1>Shop</h1>
      <div className="shop-gold">Gold: {gold}</div>
      <div className="shop-grid">
        {items.length
          ? items.map((item) => (
              <div key={item.id} className="shop-item">
                <img src={item.icon} alt={item.name} />
                <div>{item.name}</div>
                <div>Price: {item.price}</div>
                <button
                  disabled={gold < item.price}
                  onClick={() => {
                    if (spendGold(item.price)) {
                      if (item.type === 'card') addCardToInventory(item.card)
                      setGold(getGold())
                    }
                  }}
                >
                  {gold < item.price ? 'Too Poor' : 'Buy'}
                </button>
              </div>
            ))
          : <p>Welcome! Trade here soon.</p>}
      </div>
      <button onClick={() => navigate('/dungeon')}>Back to Dungeon</button>
    </div>
  )
}
