-- Add current_game_id column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_game_id INT DEFAULT NULL;

-- Create games table
CREATE TABLE IF NOT EXISTS games (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player1_id VARCHAR(255) NOT NULL,
    player2_id VARCHAR(255) DEFAULT NULL,
    status ENUM('pending', 'active') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
