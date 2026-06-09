from pydantic_settings import BaseSettings
import google.generativeai as genai
import logging

logger = logging.getLogger(__name__)

class Settings(BaseSettings):
    gemini_api_key: str = ""
    debug: bool = True
    app_name: str = "InterviewIQ AI Service"

    class Config:
        env_file = ".env"

settings = Settings()

def get_gemini_model(temperature=0.7):
    """Get configured Gemini model. Returns None if API key not set."""
    if not settings.gemini_api_key:
        logger.warning("Gemini API key not configured")
        return None
    try:
        genai.configure(api_key=settings.gemini_api_key)
        generation_config = genai.types.GenerationConfig(temperature=temperature)
        return genai.GenerativeModel('gemini-2.0-flash', generation_config=generation_config)
    except Exception as e:
        logger.error(f"Failed to initialize Gemini: {e}")
        return None
