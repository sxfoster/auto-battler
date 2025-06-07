import React from 'react'
import { Link } from 'react-router-dom'

export default function Shop() {
  // TODO: fetch shop inventory, prices, purchase logic
  const items = [] // placeholder

  return (
    <div className="shop-container">
      <h1>Shop</h1>
      <div className="shop-grid">
        {items.length
          ? items.map((item) => (
              <div key={item.id} className="shop-item">
                <img src={item.icon} alt={item.name} />
                <div>{item.name}</div>
                <div>Price: {item.price}</div>
                <button>Buy</button>
              </div>
            ))
          : <p>Welcome! Trade here soon.</p>}
      </div>
      <Link to="/dungeon">Back to Dungeon</Link>
    </div>
  )
}
