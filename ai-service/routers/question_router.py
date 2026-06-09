import logging
from fastapi import APIRouter
from models.schemas import QuestionGenerateRequest, GeneratedQuestion
from config import get_gemini_model
from utils import parse_gemini_json
from typing import List

logger = logging.getLogger(__name__)

router = APIRouter()


def _get_mock_questions(request: QuestionGenerateRequest) -> List[GeneratedQuestion]:
    """Return mock/fallback questions."""
    mock_questions = {
        "Java": [
            GeneratedQuestion(
                question_text="Explain the internal working of HashMap in Java. How does it handle collisions?",
                ideal_answer="HashMap uses an array of Node objects. Each Node contains key, value, hash, and next pointer. When put() is called, hash of key is computed, index = hash & (n-1). If collision occurs, entries are stored as linked list (or TreeMap if size > 8). Load factor 0.75 triggers resize.",
                difficulty=request.difficulty,
                category="Java"
            ),
            GeneratedQuestion(
                question_text="What are the differences between JDK, JRE, and JVM?",
                ideal_answer="JVM is the virtual machine that executes bytecode. JRE = JVM + core libraries (runtime environment). JDK = JRE + development tools (compiler, debugger). JDK is for development, JRE for running applications.",
                difficulty=request.difficulty,
                category="Java"
            ),
        ],
        "Spring Boot": [
            GeneratedQuestion(
                question_text="Explain the Spring Boot auto-configuration mechanism.",
                ideal_answer="Spring Boot auto-configuration automatically configures beans based on classpath dependencies. It uses @EnableAutoConfiguration which loads META-INF/spring.factories. Conditional annotations (@ConditionalOnClass, @ConditionalOnMissingBean) control which configurations are applied.",
                difficulty=request.difficulty,
                category="Spring Boot"
            ),
        ],
        "System Design": [
            GeneratedQuestion(
                question_text="How would you design a URL shortening service like bit.ly?",
                ideal_answer="Use base62 encoding of auto-increment ID. Store mapping in DB with cache layer (Redis). Handle redirects with 301/302. Consider: hash collisions, analytics, rate limiting, horizontal scaling with consistent hashing.",
                difficulty=request.difficulty,
                category="System Design"
            ),
        ],
    }

    questions = []
    for skill in request.skills:
        if skill in mock_questions:
            questions.extend(mock_questions[skill])

    if not questions:
        questions.append(GeneratedQuestion(
            question_text=f"Explain the core concepts of {request.skills[0] if request.skills else 'software engineering'}.",
            ideal_answer="A comprehensive answer covering fundamental principles and best practices.",
            difficulty=request.difficulty,
            category=request.skills[0] if request.skills else "General"
        ))

    return questions[:request.count]


@router.post("/generate", response_model=List[GeneratedQuestion])
async def generate_questions(request: QuestionGenerateRequest):
    """Generate interview questions based on skills, role, and difficulty.
    Uses Gemini API with fallback to mock data."""
    model = get_gemini_model(temperature=0.7)
    if model is None:
        logger.info("Gemini model not available, returning mock questions.")
        return _get_mock_questions(request)

    try:
        skills_list = ", ".join(request.skills)
        prompt = (
            f"Generate {request.count} {request.difficulty} level interview questions "
            f"for a {request.job_role} position focusing on the following skills: {skills_list}.\n"
            f"Ensure the questions and ideal answers align directly with modern learning paths from roadmap.sh "
            f"and capture real-world practical concepts, community opinions, and issues discussed on developer subreddits (avoid generic textbook definitions).\n\n"
            f"For each question, provide:\n"
            f"1. question_text: The interview question\n"
            f"2. ideal_answer: A comprehensive ideal answer (2-3 paragraphs)\n"
            f"3. difficulty: {request.difficulty}\n"
            f"4. category: The most relevant skill category from the provided skills\n\n"
            f"Respond ONLY with a JSON array, no markdown formatting."
        )

        response = model.generate_content(prompt)
        data = parse_gemini_json(response.text)

        questions = [GeneratedQuestion(**item) for item in data]
        logger.info(f"Successfully generated {len(questions)} questions via Gemini.")
        return questions[:request.count]

    except Exception as e:
        logger.error(f"Gemini question generation failed: {e}", exc_info=True)
        return _get_mock_questions(request)
