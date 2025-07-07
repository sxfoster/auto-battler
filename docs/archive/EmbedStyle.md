# Embed Style Guide

This guide documents the formatting rules for all bot responses using embeds.

## Colors
- **Primary:** `#29b6f6` – used for most embeds.
- **Accent:** Bright colors may be used sparingly for warnings or highlights.

## Field Conventions
1. Order fields logically as they would appear in the UI.
2. Use title case for field names.
3. Keep values concise; multiline values are allowed for descriptions.

## Emoji and Icons
- Prefer standard Unicode emoji over custom icons when possible.
- Limit to one emoji per field name to avoid clutter.

## Footer and Timestamp
- All embeds include the footer text `Auto‑Battler Bot`.
- Embeds should set `.setTimestamp()` so messages show when they were generated.

Follow these guidelines when composing new command responses or updating existing ones.
