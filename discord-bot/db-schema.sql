-- Minimal schema for the Discord bot

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    discord_id VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL UNIQUE COLLATE utf8mb4_unicode_ci,
    class VARCHAR(50) DEFAULT NULL
);

-- Ability cards owned by users
CREATE TABLE IF NOT EXISTS user_ability_cards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    ability_id INT NOT NULL,
    charges INT DEFAULT 10,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Equipped ability reference
ALTER TABLE users
    ADD COLUMN equipped_ability_id INT DEFAULT NULL,
    ADD FOREIGN KEY (equipped_ability_id) REFERENCES user_ability_cards(id);

-- Champions owned by users
CREATE TABLE IF NOT EXISTS user_champions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    base_hero_id INT NOT NULL,
    equipped_ability_id INT DEFAULT NULL,
    equipped_weapon_id INT DEFAULT NULL,
    equipped_armor_id INT DEFAULT NULL,
    level INT DEFAULT 1,
    xp INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Ability deck for each champion
CREATE TABLE IF NOT EXISTS champion_decks (
    user_champion_id INT NOT NULL,
    ability_id INT NOT NULL,
    order_index INT NOT NULL,
    PRIMARY KEY (user_champion_id, order_index),
    FOREIGN KEY (user_champion_id) REFERENCES user_champions(id) ON DELETE CASCADE
);

-- Items owned by users
CREATE TABLE IF NOT EXISTS user_inventory (
    user_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity INT DEFAULT 1,
    item_type VARCHAR(20) DEFAULT NULL,
    PRIMARY KEY (user_id, item_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
