from pathlib import Path
import importlib.util
import sys

# Load OllamaService directly to avoid importing the heavy ``services`` package
_ollama_path = Path(__file__).resolve().parents[1] / "services" / "ollama_service.py"
_spec = importlib.util.spec_from_file_location("services.ollama_service", _ollama_path)
_ollama_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_ollama_mod)
sys.modules.setdefault("services.ollama_service", _ollama_mod)
OllamaService = _ollama_mod.OllamaService


def _concat_markdown_files(folder: str) -> str:
    """Concatenate all markdown files found recursively under *folder*."""
    base = Path(folder)

    # Support passing a direct file path for backwards compatibility
    if base.is_file():
        try:
            return base.read_text(encoding="utf-8")
        except Exception as exc:  # pragma: no cover - simple fallback
            print(f"Error reading {base}: {exc}")
            return ""

    parts = []
    for md_file in sorted(base.rglob("*.md")):
        try:
            parts.append(md_file.read_text(encoding="utf-8"))
        except Exception as exc:  # pragma: no cover - simple fallback
            print(f"Error reading {md_file}: {exc}")
    return "\n\n".join(parts)

class AIAgent:
    """
    The main AI agent for the bot.
    This class acts as a bridge between the bot's cogs and the Ollama service.
    It formats prompts and directs them to the correct model (Narrator or GM).
    """

    def __init__(self, world_bible_path: str = "docs/"):
        """
        Initializes the AIAgent.

        Args:
            world_bible_path: Path to a folder (or file) containing markdown
                documents with game lore and rules. Defaults to the ``docs/``
                directory in the repository.
        """
        self.ollama_service = OllamaService()
        self.world_bible = self._load_world_bible(world_bible_path)

    def _load_world_bible(self, path: str) -> str:
        """Return the concatenated lore text from ``path``.

        The method aggregates all markdown files under the provided directory
        (or reads a single file if ``path`` points to one). The combined content
        is used as context for the AI models.
        """
        try:
            text = _concat_markdown_files(path)
            if not text:
                raise FileNotFoundError(path)
            return text
        except FileNotFoundError:
            # If lore files are missing, use a simple fallback.
            return (
                "The world is a grim, dark, post-apocalyptic wasteland. Resources "
                "are scarce. Survival is paramount."
            )
        except Exception as e:  # pragma: no cover - unexpected I/O errors
            print(f"Error loading world bible: {e}")
            return "Error: Could not load world bible."

    async def get_narrative(self, prompt: str) -> str:
        """
        Generates a narrative response using the creative model.
        It automatically prepends the world bible for context.

        Args:
            prompt: The specific story prompt.

        Returns:
            A narrative string from the Narrator model.
        """
        # Combine the world bible context with the specific prompt
        full_prompt = f"WORLD CONTEXT:\n{self.world_bible}\n\nSTORY PROMPT:\n{prompt}"
        return await self.ollama_service.get_narrative(full_prompt)

    async def get_gm_response(self, prompt: str) -> str:
        """
        Generates a logical or rule-based response from the fast GM model.
        This does not include the full world bible to keep it fast and focused.

        Args:
            prompt: The specific logical prompt.

        Returns:
            A direct response string from the GM model.
        """
        return await self.ollama_service.get_gm_response(prompt)

    async def get_completion(self, prompt: str) -> str:
        """Return a creative completion from the Lore Weaver model."""
        return await self.get_narrative(prompt)

    def get_opening_scene_prompt(self, character_description: str, rag_context: str) -> str:
        """Return the prompt used to generate the opening scene."""
        return f"""
        You are Lore Weaver, a master storyteller and game master for a tabletop role-playing game.
        Your task is to generate the opening scene for a new player based on their character description and relevant lore.

        **Character Description:**
        {character_description}

        **Relevant Lore from the World Codex:**
        {rag_context}

        **Your Instructions:**
        Generate a JSON object with three keys: "scene", "question", and "choices".
        - "scene": A compelling opening scene that introduces the character to the world. **The scene description must be concise and limited to a maximum of two to three paragraphs.**
        - "question": A thought-provoking question for the player to answer, based on the scene.
        - "choices": An array of two distinct choices the player can make in response to the question. Each choice should be an object with a "Choice" and a "Result" key, describing the immediate consequence of that choice.

        **Output Format (Strictly JSON):**
        {{
            "scene": "...",
            "question": "...",
            "choices": [
                {{"Choice": "...", "Result": "..."}},
                {{"Choice": "...", "Result": "..."}}
            ]
        }}
        """

    def get_structured_scene_prompt(self, location: dict, npc: dict) -> str:
        """Return a prompt for generating a scene focused on ``location`` and ``npc``.

        The prompt embeds the provided dictionaries as factual context and
        instructs the language model to return structured JSON, mirroring the
        style of the opening scene prompt.
        """

        return f"""
        You are Lore Weaver, a master storyteller guiding a tabletop role-playing game.
        Use the factual details below to describe the current scene and the NPC's interaction.

        **Location Facts:**
        {location}

        **NPC Facts:**
        {npc}

        **Your Instructions:**
        Craft a concise scene description featuring the location and NPC. Conclude with a
        single question for the player and two short choices they might take. Respond only
        with a JSON object using the keys "scene", "question", and "choices" as shown earlier.
        """
