import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNotification } from "./NotificationManager.jsx";
import { getInventory, loadInventory } from "shared/inventoryState";
import cardArt from "../assets/placeholder-card-art.svg";
import styles from "./InventoryScreen.module.css";

interface InventoryItem {
  id: string;
  name: string;
  type: string;
  rarity: string;
  description: string;
}

function fetchItems(): InventoryItem[] {
  const cards = getInventory() as any[];
  return cards.map((c) => ({
    id: c.id,
    name: c.name,
    type: (c as any).category || (c as any).type || "Unknown",
    rarity: (c as any).rarity || "Common",
    description: c.description || "",
  }));
}

export default function InventoryScreen() {
  const [filter, setFilter] = useState("All");
  const [items, setItems] = useState<InventoryItem[]>([]);
  const { notify } = useNotification();
  const location = useLocation();

  useEffect(() => {
    console.log("InventoryScreen mounted");
    loadInventory();
    setItems(fetchItems());
  }, []);

  const filtered = items.filter((i) => filter === "All" || i.type === filter);

  const uniqueTypes = Array.from(new Set(items.map((i) => i.type)));

  const rarityClass: Record<string, string> = {
    Common: styles.common,
    Uncommon: styles.uncommon,
    Rare: styles.rare,
    Epic: styles.epic,
    Legendary: styles.legendary,
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Inventory</h1>
      <div className={styles.filterRow}>
        <label htmlFor="filter">Filter:</label>
        <select
          id="filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className={styles.select}
        >
          <option value="All">All</option>
          {uniqueTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.grid}>
        {filtered.map((item) => (
          <div
            key={item.id}
            className={`${styles.item} ${rarityClass[item.rarity] || styles.common}`}
            tabIndex={0}
            aria-label={`${item.name} ${item.rarity} ${item.type}. ${item.description}`}
          >
            <img src={cardArt} alt="" className={styles.icon} />
            <strong className={styles.name}>{item.name}</strong>
            <span className={styles.meta}>{item.rarity}</span>
            <p className={styles.desc}>{item.description}</p>
            <div className={styles.actions}>
              <button
                className={styles.use}
                onClick={() => notify(`Used ${item.name}`, "success")}
              >
                Use
              </button>
              <button
                className={styles.equip}
                onClick={() => notify(`Equipped ${item.name}`, "success")}
              >
                Equip
              </button>
              <button
                className={styles.sell}
                onClick={() => notify(`Sold ${item.name}`, "success")}
              >
                Sell
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
