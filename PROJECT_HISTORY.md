# Recent Project History

This document summarizes notable features and infrastructure changes implemented during early July 2025. Dates refer to the merge timestamps in this repository.

## July 3, 2025
- Added a static battle-state renderer to the React client for easier replay visualization.
- Introduced URL-based replay fetching and a new `/api/replay.php?id=` endpoint.
- The adventure flow now includes "link to replay" buttons so users can share past battles.
- Discord bot updated to store replay logs, enabling post-battle review across platforms.

## July 2, 2025
- Centralized player state management inside the React client.
- "Back to Town" navigation was rolled out on purchase and summary screens.
- Guided tutorial flow received dynamic champion selection, video lore scenes and removed pauses during adventures.
- Standardized player feedback messages throughout the tutorial.

## July 1, 2025
- Database schema updated with a `user_weapons` table and `equipped_weapon_id` column.
- Added admin command `grant-weapon` for distributing gear.
- Victory screens now show a "Continue Adventuring" button, XP gains and progress bars.

## June 30, 2025
- Finalized the player economy and auction house: gold rewards, auction services and PvE/PvP leaderboards.
- Discord bot can mention users when auctions finish.
- Database tables added for gold balances and auction listings.
