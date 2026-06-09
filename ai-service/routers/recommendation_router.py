import logging
from fastapi import APIRouter
from models.schemas import RecommendationRequest, RecommendationResponse
from config import get_gemini_model
from utils import parse_gemini_json

logger = logging.getLogger(__name__)

router = APIRouter()


def _get_mock_recommendations() -> RecommendationResponse:
    """Return mock recommendation data."""
    return RecommendationResponse(
        dsa_topics=["Arrays & Strings", "Dynamic Programming", "Graphs & Trees", "Stack & Queue"],
        interview_topics=["Spring Boot Internals", "System Design", "Database Optimization", "Microservices"],
        weekly_roadmap=[
            {"week": "Week 1", "topic": "Java Collections & Internals", "focus": "HashMap, ArrayList, LinkedList deep dive"},
            {"week": "Week 2", "topic": "Spring Boot & Security", "focus": "REST APIs, JWT, Spring Data JPA"},
            {"week": "Week 3", "topic": "System Design Fundamentals", "focus": "Load balancers, caching, database design"},
            {"week": "Week 4", "topic": "DSA Problem Solving", "focus": "Arrays, DP, Graph algorithms practice"},
        ]
    )


@router.post("/generate", response_model=RecommendationResponse)
async def generate_recommendations(request: RecommendationRequest):
    """Generate personalized learning recommendations.
    Uses Gemini API with fallback to mock recommendations."""
    model = get_gemini_model(temperature=0.7)
    if model is None:
        logger.info("Gemini model not available, returning mock recommendations.")
        return _get_mock_recommendations()

    try:
        skills_str = ", ".join(request.user_skills) if request.user_skills else "General programming"
        weak_str = ", ".join(request.weak_topics) if request.weak_topics else "None specified"

        scores_summary = ""
        for score_entry in request.interview_scores:
            scores_summary += f"  - {score_entry}\n"
        if not scores_summary:
            scores_summary = "  No scores available\n"

        prompt = (
            f"You are a technical interview coach. Generate personalized learning recommendations "
            f"for a student preparing for software engineering interviews.\n\n"
            f"Student Profile:\n"
            f"- Current Skills: {skills_str}\n"
            f"- Weak Topics: {weak_str}\n"
            f"- Interview Scores:\n{scores_summary}\n"
            f"Based on this profile, return a JSON object with these exact fields:\n"
            f"- dsa_topics (array of strings): 4-6 DSA topics to practice, prioritizing weak areas\n"
            f"- interview_topics (array of strings): 4-6 interview topics to review\n"
            f"- weekly_roadmap (array of objects): A 4-week study plan. Each object must have exactly these keys:\n"
            f"  - week (string): e.g. 'Week 1'\n"
            f"  - topic (string): Main topic for the week\n"
            f"  - focus (string): Specific areas to focus on\n\n"
            f"Tailor recommendations to address the weak topics and improve low scores.\n"
            f"Respond ONLY with a JSON object, no markdown formatting."
        )

        response = model.generate_content(prompt)
        data = parse_gemini_json(response.text)

        recommendations = RecommendationResponse(**data)
        logger.info("Successfully generated recommendations via Gemini.")
        return recommendations

    except Exception as e:
        logger.error(f"Gemini recommendation generation failed: {e}", exc_info=True)
        return _get_mock_recommendations()
