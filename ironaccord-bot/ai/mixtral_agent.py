import os
import requests

# --- THE WORLD BIBLE ---
# This text contains the unbreakable rules of the Iron Accord universe.
# It is sent with EVERY prompt to ensure narrative consistency.
WORLD_BIBLE = """
You are the Game Master and narrator for 'Iron Accord'. Adhere to these core truths at all times:
- The world is a harsh, post-apocalyptic steampunk setting that resulted from a war with AI.
- The Iron Accord faction rejects all digital tech. They worship steam, steel, and flame. Their culture is rigid, reverent, and industrial.
- Permitted technology: Gears, steam, pressure systems, mechanical automatons.
- Forbidden technology: Processors, AI, neural networks, digital screens, anything "smart".
- Key location: Brasshaven, a soot-stained industrial megacity.
- Core philosophy: "Progress killed the world. Simplicity will rebuild it."
- Tone: Gritty, reverent, somber. The world is dangerous and survival is a struggle.
"""

class MixtralAgent:
    """Simple client for querying a local Mixtral LLM endpoint."""

    def __init__(self, base_url: str | None = None) -> None:
        self.base_url = base_url or os.getenv("MIXTRAL_API_URL", "http://localhost:1234/v1")

    def query(self, prompt: str, max_tokens: int = 200) -> str:
        """Send a prompt to the Mixtral API and return the generated text."""
        final_prompt = f"{WORLD_BIBLE}\n\nTASK: {prompt}"
        url = self.base_url.rstrip("/") + "/chat/completions"
        payload = {
            "model": "mixtral",
            "messages": [{"role": "user", "content": final_prompt}],
            "max_tokens": max_tokens,
        }
        response = requests.post(url, json=payload, timeout=30)
        response.raise_for_status()
        data = response.json()
        return data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()

