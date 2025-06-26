-- Schema for the Discord bot database

-- Games table
CREATE TABLE IF NOT EXISTS games (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player1_id VARCHAR(255) NOT NULL,
    player2_id VARCHAR(255) DEFAULT NULL,
    winner_id VARCHAR(255) DEFAULT NULL,
    status ENUM('pending', 'active', 'complete') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    discord_id VARCHAR(255) NOT NULL UNIQUE,
    current_game_id INT DEFAULT NULL,
    tutorial_completed BOOL DEFAULT FALSE,
    starter_class VARCHAR(50),
    FOREIGN KEY (current_game_id) REFERENCES games(id) ON DELETE SET NULL
);
