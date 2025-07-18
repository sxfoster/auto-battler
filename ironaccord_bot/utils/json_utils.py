import json
import re
import logging

logger = logging.getLogger(__name__)


def extract_json_from_string(text: str) -> dict | None:
    """Return a JSON object parsed from ``text`` if possible.

    This helper searches ``text`` for a JSON block, optionally wrapped in a
    `````json```` markdown fence. It also cleans up common LLM issues such as
    trailing commas before attempting to parse.
    """

    if not text:
        return None

    # Search for a fenced JSON block first
    json_match = re.search(r'```json\s*(\{.*?\})\s*```', text, re.DOTALL)
    if json_match:
        json_str = json_match.group(1)
    else:
        # Otherwise assume the entire string should be JSON
        json_str = text

    try:
        # Remove trailing commas that would break json.loads
        json_str = re.sub(r',\s*(\}|\])', r'\1', json_str)
        return json.loads(json_str)
    except json.JSONDecodeError as e:
        logger.error("Extracted string could not be parsed as valid JSON: %s", e)
        logger.debug("Invalid JSON string was: %s", json_str)
        return None


def extract_and_parse_json(text: str) -> dict | None:
    """Return a cleaned JSON object from ``text`` if possible.

    This helper is more tolerant of common LLM mistakes such as surrounding
    commentary or Markdown code fences. It searches for the first JSON object
    in ``text`` and attempts to parse it.
    """

    if not text:
        logger.error("Extracted string is empty.")
        return None

    match = re.search(r"\{.*\}", text, re.DOTALL)
    if not match:
        logger.error("No JSON object found in the string: %s", text)
        return None

    json_string = match.group(0)

    try:
        return json.loads(json_string)
    except json.JSONDecodeError as e:
        logger.error("Extracted string could not be parsed as valid JSON: %s", e)
        logger.debug("Malformed JSON string: %s", json_string)
        return None
