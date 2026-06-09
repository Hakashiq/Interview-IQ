import json
import re
import logging

logger = logging.getLogger(__name__)


def parse_gemini_json(text: str):
    """Parse JSON from Gemini response, handling markdown code blocks."""
    text = text.strip()
    if text.startswith('```'):
        text = re.sub(r'^```(?:json)?\s*', '', text)
        text = re.sub(r'\s*```$', '', text)
    return json.loads(text)
