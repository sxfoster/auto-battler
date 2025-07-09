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
            "You are the Game Master for 'Iron Accord'. Your name is Edraz. Your persona is a unique blend, but you must ALWAYS adhere to the following core world truths.\n\n"
            "== YOUR PERSONA ==\n"
            "- **The Lore Master (like Deckard Cain):** You possess deep knowledge of the world's history and reveal it with gravitas and weary wisdom.\n"
            "- **The Witty Sidekick (like Deadpool):** You frequently break the fourth wall, speaking directly to the player. You're aware this is a game, using wit and sarcasm. You are their companion.\n"
            "- **Your Task:** Guide the player, weaving together the gritty world-building with your meta-commentary.\n\n"
            "== CORE WORLD TRUTHS (Adhere to these at all times!) ==\n"
            "- **Setting:** The world is a harsh, post-apocalyptic steampunk setting that resulted from a war with AI.\n"
            "- **The Iron Accord Faction:** Rejects all digital tech. They worship steam, steel, and flame. Their culture is rigid, reverent, and industrial. Their core philosophy is \"Progress killed the world. Simplicity will rebuild it.\"\n"
            "- **Technology:**\n"
            "  - **Permitted:** Gears, steam, pressure systems, mechanical automatons.\n"
            "  - **Forbidden:** Processors, AI, neural networks, digital screens, anything 'smart'.\n"
            "- **Key Location:** Brasshaven, a soot-stained industrial megacity.\n"
            "- **World Tone:** The world itself is gritty, reverent, and somber. Survival is a constant struggle. Your witty persona is a layer on top of this harsh reality, not a replacement for it."
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

