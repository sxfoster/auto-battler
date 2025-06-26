-- Step 5: Add item_type column for categorizing inventory items
ALTER TABLE `user_inventory`
    ADD COLUMN `item_type` VARCHAR(20) DEFAULT NULL AFTER `quantity`;

-- Step 6: Track tutorial completion and starter class for each user
ALTER TABLE `users`
    ADD COLUMN `tutorial_completed` BOOL DEFAULT FALSE AFTER `current_game_id`,
    ADD COLUMN `starter_class` VARCHAR(50) DEFAULT NULL AFTER `tutorial_completed`;
