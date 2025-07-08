-- Database schema for the Discord bot

-- Drop obsolete tables
DROP TABLE IF EXISTS battle_replays;
DROP TABLE IF EXISTS auction_house_listings;
DROP TABLE IF EXISTS pvp_battles;
DROP TABLE IF EXISTS user_inventory;
DROP TABLE IF EXISTS champion_decks;
DROP TABLE IF EXISTS user_champions;
DROP TABLE IF EXISTS user_weapons;
DROP TABLE IF EXISTS user_ability_cards;
DROP TABLE IF EXISTS user_flags;
DROP TABLE IF EXISTS users;

-- Players table
CREATE TABLE IF NOT EXISTS players (
    id INT AUTO_INCREMENT PRIMARY KEY,
    discord_id VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    class VARCHAR(50) DEFAULT NULL,
    gold INT DEFAULT 0,
    xp INT DEFAULT 0,
    level INT DEFAULT 1,
    state VARCHAR(20) DEFAULT 'idle',
    equipped_weapon_id INT DEFAULT NULL,
    equipped_armor_id INT DEFAULT NULL,
    equipped_ability_id INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Missions table
CREATE TABLE IF NOT EXISTS missions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    reward VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mission log table
CREATE TABLE IF NOT EXISTS mission_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mission_id INT NOT NULL,
    player_id INT NOT NULL,
    status ENUM('started','completed','failed') DEFAULT 'started',
    log TEXT,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (mission_id) REFERENCES missions(id),
    FOREIGN KEY (player_id) REFERENCES players(id)
);

-- Codex entries table
CREATE TABLE IF NOT EXISTS codex_entries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT NOT NULL,
    entry_key VARCHAR(255) NOT NULL,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_entry (player_id, entry_key),
    FOREIGN KEY (player_id) REFERENCES players(id)
);

-- Player stats table
CREATE TABLE IF NOT EXISTS user_stats (
    player_id INT NOT NULL,
    stat VARCHAR(10) NOT NULL,
    value INT DEFAULT 1,
    PRIMARY KEY (player_id, stat),
    FOREIGN KEY (player_id) REFERENCES players(id)
);

-- Player inventory tables
CREATE TABLE IF NOT EXISTS user_weapons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    durability INT DEFAULT 100,
    FOREIGN KEY (player_id) REFERENCES players(id)
);

CREATE TABLE IF NOT EXISTS user_armors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    durability INT DEFAULT 100,
    FOREIGN KEY (player_id) REFERENCES players(id)
);

CREATE TABLE IF NOT EXISTS user_ability_cards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    durability INT DEFAULT 100,
    FOREIGN KEY (player_id) REFERENCES players(id)
);

-- Player flags table
CREATE TABLE IF NOT EXISTS user_flags (
    player_id INT NOT NULL,
    flag VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (player_id, flag),
    FOREIGN KEY (player_id) REFERENCES players(id)
);

-- GM audit log
CREATE TABLE IF NOT EXISTS gm_audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_user VARCHAR(255) NOT NULL,
    target_user VARCHAR(255) NOT NULL,
    action VARCHAR(50) NOT NULL,
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
