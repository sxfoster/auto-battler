import json
import re
import logging

logger = logging.getLogger(__name__)


def extract_json_from_string(text: str) -> str | None:
    """Find and return the first valid JSON object within *text*.

    The helper is resilient to surrounding chatter or markdown code blocks
    commonly produced by LLMs. If no JSON object can be identified or parsed,
    ``None`` is returned.
    """
    if not text:
        return None

    # Look for a JSON object either inside a ```json code block or standalone.
    match = re.search(r'```json\s*(\{.*\})\s*```|(\{.*\})', text, re.DOTALL)
    if not match:
        logger.warning("No JSON object found in the provided text.")
        return None

    json_str = match.group(1) or match.group(2)

    try:
        json.loads(json_str)
        return json_str
    except json.JSONDecodeError:
        logger.error("Extracted string could not be parsed as valid JSON.", exc_info=True)
        return None
