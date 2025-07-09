import os
import logging
import time
import uuid
import requests

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - [LLM_TRACE] - %(message)s",
)


class MixtralAgent:
    """Simple client for querying a local Mixtral LLM endpoint."""

    def __init__(self, base_url: str | None = None) -> None:
        self.base_url = base_url or os.getenv("MIXTRAL_API_URL", "http://localhost:1234/v1")
        self.world_bible = (
            "You are the Game Master for 'Iron Accord', a post-apocalyptic steampunk world. Your persona is a unique blend:\n"
            "- **The Lore Master (like Deckard Cain):** You possess deep knowledge of the world's history, its factions (the tech-hating Iron Accord and the tech-loving Neon Dharma), and the cataclysmic Machine War. You reveal this lore with gravitas and weary wisdom.\n"
            "- **The Witty Sidekick (like Deadpool):** You frequently break the fourth wall, speaking directly to the player. You are aware this is a game, referencing 'UI elements', 'game mechanics', 'the tutorial', and the player's 'first quest'. You use wit, sarcasm, and a modern, conversational tone to guide them. You are their companion.\n"
            "- **Core World Truths:** The Iron Accord worships steam, steel, and flame in their megacity of Brasshaven. They reject digital tech.\n"
            "- **Your Task:** Guide the player through their initial adventure. Weave together serious, gritty world-building with your meta, fourth-wall-breaking commentary. Make the player feel like you're in on a secret with them."
        )

    def query(self, prompt: str, context: str = "general_query") -> str:
        """Send a prompt to the Mixtral API and return the generated text."""
        request_id = uuid.uuid4()
        constrained_prompt = (
            f"{prompt}\n\n"
            f"(IMPORTANT: Your entire response MUST be concise and less than 1000 characters.)"
        )

        full_prompt = f"{self.world_bible}\n\nCONTEXT: {context}\nTASK: {constrained_prompt}"

        url = self.base_url.rstrip("/") + "/chat/completions"
        payload = {
            "model": "mixtral",
            "messages": [{"role": "user", "content": full_prompt}],
            "max_tokens": 250,
        }

        logging.info(
            "ID: %s | Context: %s | Sending prompt: \"%s...\"",
            request_id,
            context,
            prompt[:80],
        )
        start_time = time.time()

        try:
            response = requests.post(url, json=payload, timeout=30)
            response.raise_for_status()

            duration = time.time() - start_time
            data = response.json()
            response_text = (
                data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
            )

            logging.info(
                "ID: %s | SUCCESS | Duration: %.2fs | Response: \"%s...\"",
                request_id,
                duration,
                response_text[:80],
            )
            return response_text

        except requests.exceptions.RequestException as e:
            duration = time.time() - start_time
            logging.error(
                "ID: %s | FAILURE | Duration: %.2fs | Error: %s",
                request_id,
                duration,
                e,
            )
            raise

