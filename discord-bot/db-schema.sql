-- Minimal schema for the Discord bot

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    discord_id VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL UNIQUE COLLATE utf8mb4_unicode_ci,
    class VARCHAR(50) DEFAULT NULL,
    pve_wins INT DEFAULT 0,
    pve_losses INT DEFAULT 0,
    pvp_wins INT DEFAULT 0,
    pvp_losses INT DEFAULT 0,
    tutorial_completed TINYINT(1) DEFAULT 0,
    dm_battle_logs_enabled TINYINT(1) DEFAULT 1,
    dm_item_drops_enabled TINYINT(1) DEFAULT 1
);

-- Ability cards owned by users
CREATE TABLE IF NOT EXISTS user_ability_cards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    ability_id INT NOT NULL,
    charges INT DEFAULT 10,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Weapons owned by users
CREATE TABLE IF NOT EXISTS user_weapons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    weapon_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Equipped ability reference
ALTER TABLE users
    ADD COLUMN equipped_ability_id INT DEFAULT NULL,
    ADD COLUMN dm_battle_logs_enabled TINYINT(1) DEFAULT 1,
    ADD COLUMN dm_item_drops_enabled TINYINT(1) DEFAULT 1,
    ADD FOREIGN KEY (equipped_ability_id) REFERENCES user_ability_cards(id);

ALTER TABLE users
    ADD COLUMN tutorial_completed TINYINT(1) DEFAULT 0,
    ADD COLUMN dm_battle_logs_enabled TINYINT(1) DEFAULT 1,
    ADD COLUMN dm_item_drops_enabled TINYINT(1) DEFAULT 1;

-- Equipped weapon reference
ALTER TABLE users
    ADD COLUMN equipped_weapon_id INT DEFAULT NULL,
    ADD FOREIGN KEY (equipped_weapon_id) REFERENCES user_weapons(id) ON DELETE SET NULL;

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

-- PvP battle challenges
CREATE TABLE IF NOT EXISTS pvp_battles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    challenger_id INT NOT NULL,
    challenged_id INT NOT NULL,
    status ENUM('pending','accepted','declined','expired') DEFAULT 'pending',
    message_id VARCHAR(255) DEFAULT NULL,
    channel_id VARCHAR(255) DEFAULT NULL,
    winner_id INT DEFAULT NULL,
    battle_log TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (challenger_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (challenged_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Currency for users
ALTER TABLE users
    ADD COLUMN gold INT UNSIGNED DEFAULT 0;

-- Auction house listings
CREATE TABLE IF NOT EXISTS auction_house_listings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    seller_id INT NOT NULL,
    ability_id INT NOT NULL,
    charges INT DEFAULT 0,
    price INT UNSIGNED NOT NULL,
    listed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
);
