-- Step 5: Create the 'defense_teams' table to store player-designated PvP teams.
CREATE TABLE IF NOT EXISTS `defense_teams` (
    `user_id` VARCHAR(255) PRIMARY KEY,
    `champion_1_id` INT NOT NULL COMMENT 'This is the ID from the user_champions table.',
    `champion_2_id` INT NULL COMMENT 'Can be NULL if a monster is used.',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`discord_id`)
);
