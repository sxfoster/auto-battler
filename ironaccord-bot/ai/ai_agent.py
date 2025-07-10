from pathlib import Path
from services.ollama_service import OllamaService


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
