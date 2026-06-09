import logging
from fastapi import APIRouter
from models.schemas import (
    EvaluateAnswerRequest, EvaluationResponse,
    CommunicationAnalysisRequest, CommunicationAnalysisResponse
)
from config import get_gemini_model
from utils import parse_gemini_json

logger = logging.getLogger(__name__)

router = APIRouter()


import re

STOP_WORDS = {
    "i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours", 
    "yourself", "yourselves", "he", "him", "his", "himself", "she", "her", "hers", "herself", 
    "it", "its", "itself", "they", "them", "their", "theirs", "themselves", "what", "which", 
    "who", "whom", "this", "that", "these", "those", "am", "is", "are", "was", "were", "be", 
    "been", "being", "have", "has", "had", "having", "do", "does", "did", "doing", "a", "an", 
    "the", "and", "but", "if", "or", "because", "as", "until", "while", "of", "at", "by", "for", 
    "with", "about", "against", "between", "into", "through", "during", "before", "after", 
    "above", "below", "to", "from", "up", "down", "in", "out", "on", "off", "over", "under", 
    "again", "further", "then", "once", "here", "there", "when", "where", "why", "how", "all", 
    "any", "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not", 
    "only", "own", "same", "so", "than", "too", "very", "s", "t", "can", "will", "just", "don", 
    "should", "now", "d", "ll", "m", "o", "re", "ve", "y", "ain", "aren", "couldn", "didn", 
    "doesn", "hadn", "hasn", "haven", "isn", "ma", "mightn", "mustn", "needn", "shan", "shouldn", 
    "wasn", "weren", "won", "wouldn"
}

COMMON_NON_TECH = {
    "using", "used", "uses", "make", "makes", "made", "take", "takes", "took", "taken",
    "show", "shows", "showed", "shown", "give", "gives", "gave", "given", "would", "could",
    "should", "also", "many", "well", "good", "great", "simple", "example", "different",
    "difference", "another", "call", "called", "calling", "calls", "need", "needs", "needed",
    "want", "wants", "wanted", "like", "likes", "liked", "look", "looks", "looked", "come",
    "comes", "came", "work", "works", "worked", "find", "finds", "found", "think", "thinks",
    "thought", "know", "knows", "knew", "known", "part", "parts", "step", "steps", "type",
    "types", "way", "ways", "case", "cases", "main", "first", "second", "third", "last",
    "next", "back", "front", "left", "right", "high", "low", "more", "less", "much",
    "some", "any", "every", "each", "both", "all", "none", "only", "even",
    "still", "yet", "already", "just", "then", "thus", "therefore", "however", "although",
    "though", "instead", "rather", "quite", "fairly", "pretty", "very", "too", "enough",
    "definition", "explain", "explanation", "question", "answer", "define", "concept", "concepts"
}

def _clean_and_tokenize(text: str) -> list:
    # Remove HTML-like tags if any
    text = re.sub(r'<[^>]*>', '', text)
    # Remove punctuation except common characters like + and # (C++, C#) and . (.equals)
    words = re.findall(r'[a-zA-Z0-9+#\.]+', text.lower())
    cleaned = []
    for w in words:
        if w.endswith('.') and len(w) > 1:
            w = w[:-1]
        if w:
            cleaned.append(w)
    return cleaned

def _get_mock_evaluation(request: EvaluateAnswerRequest) -> EvaluationResponse:
    """Return mock evaluation scores dynamically calculated from student answer vs ideal answer."""
    student_tokens = _clean_and_tokenize(request.student_answer)
    ideal_tokens = _clean_and_tokenize(request.ideal_answer)
    
    # Filter stopwords for matching
    student_content = [w for w in student_tokens if w not in STOP_WORDS]
    ideal_content = [w for w in ideal_tokens if w not in STOP_WORDS]
    
    student_set = set(student_content)
    ideal_set = set(ideal_content)
    
    # Technical concepts
    tech_student = {w for w in student_content if w not in COMMON_NON_TECH and len(w) >= 3}
    tech_ideal = {w for w in ideal_content if w not in COMMON_NON_TECH and len(w) >= 3}
    
    matching_concepts = sorted(list(tech_student & tech_ideal))
    missed_concepts = sorted(list(tech_ideal - tech_student))
    
    # Overlap and ratio calculations
    overlap = student_set & ideal_set
    overlap_ratio = len(overlap) / max(1, len(ideal_set))
    
    # Length ratio (capped to prevent rambling inflation)
    len_ratio = len(student_tokens) / max(1, len(ideal_tokens))
    len_ratio_capped = min(1.2, len_ratio)
    
    # Relevance check: student words overlapping with question words
    question_tokens = _clean_and_tokenize(request.question)
    question_content = {w for w in question_tokens if w not in STOP_WORDS and len(w) >= 3}
    relevance_overlap = student_set & question_content
    relevance_ratio = len(relevance_overlap) / max(1, len(question_content))
    
    # Negation check
    negation_words = {"not", "never", "no", "cannot", "doesn't", "don't", "isn't", "wasn't", "won't", "wouldn't", "couldn't"}
    student_negations = [w for w in student_tokens if w in negation_words]
    # If student answer is extremely short and contains negations, likely it's "I do not know"
    is_negated_empty = len(student_tokens) < 12 and len(student_negations) > 0
    
    # Calculate dimensions (1 to 10)
    # Technical Accuracy
    if is_negated_empty:
        technical_accuracy = 2
    else:
        # Base accuracy on technical keyword overlap
        tech_overlap_ratio = len(tech_student & tech_ideal) / max(1, len(tech_ideal))
        technical_accuracy = int(3 + 6.5 * tech_overlap_ratio + 0.5 * len_ratio_capped)
        technical_accuracy = min(10, max(3, technical_accuracy))
        
    # Completeness
    if is_negated_empty:
        completeness = 1
    else:
        completeness = int(2 + 6.0 * len_ratio_capped + 2.0 * overlap_ratio)
        completeness = min(10, max(2, completeness))
        
    # Relevance
    if is_negated_empty:
        relevance = 2
    else:
        relevance = int(4 + 6.0 * relevance_ratio)
        relevance = min(10, max(3, relevance))
        
    # Communication
    # Penalize filler words
    filler_words = ["um", "uh", "like", "actually", "basically", "you know", "sort of"]
    student_fillers = [w for w in student_tokens if w in filler_words]
    filler_count = len(student_fillers)
    
    # Grammar / structure estimation based on average sentence length
    sentences = [s.strip() for s in re.split(r'[\.\?\!]', request.student_answer) if s.strip()]
    num_sentences = len(sentences)
    avg_sentence_len = len(student_tokens) / max(1, num_sentences)
    
    if is_negated_empty:
        communication = 4
    else:
        communication_base = 8
        if avg_sentence_len < 5 or avg_sentence_len > 30:
            communication_base -= 2
        if filler_count > 3:
            communication_base -= min(3, filler_count // 2)
        if len(student_tokens) < 10:
            communication_base -= 2
        communication = min(10, max(3, communication_base))
        
    # Confidence
    assertive_markers = {"clearly", "definitely", "specifically", "because", "structure", "implements", "main", "core", "always", "usually", "designed"}
    hesitant_markers = {"maybe", "guess", "probably", "not sure", "don't know", "think", "might", "could be"}
    
    assertive_count = sum(1 for w in student_tokens if w in assertive_markers)
    hesitant_count = sum(1 for w in student_tokens if w in hesitant_markers)
    
    if is_negated_empty:
        confidence = 2
    else:
        confidence_base = 6
        if len(student_tokens) > 25:
            confidence_base += 1
        confidence_base += min(3, assertive_count)
        confidence_base -= min(3, hesitant_count)
        confidence = min(10, max(3, confidence_base))
        
    # Overall Score
    overall_score = int(round((technical_accuracy + completeness + relevance + communication + confidence) / 5.0))
    
    # Formatting concepts for presentation
    matching_display = [c.capitalize() if not c.isupper() else c for c in matching_concepts[:4]]
    missed_display = [c.capitalize() if not c.isupper() else c for c in missed_concepts[:4]]
    
    category_name = request.category if request.category else "Technical"
    
    # Generate Feedbacks
    if is_negated_empty:
        strengths = "No specific strengths identified. An answer was not fully attempted."
        weaknesses = f"You did not address the question. Missed critical {category_name} concepts including: {', '.join(missed_display[:3]) if missed_display else 'expected key terms'}."
        improvements = f"Review foundational concepts in {category_name}. Practice explaining basic definitions and principles aloud."
    else:
        # Strengths
        if overlap_ratio >= 0.7:
            if matching_display:
                strengths = f"Excellent response! You demonstrated solid understanding of {category_name} principles, covering core terms like: {', '.join(matching_display)}."
            else:
                strengths = f"Excellent response! You demonstrated solid understanding and clearly structured your explanation of {category_name}."
        elif overlap_ratio >= 0.35:
            if matching_display:
                strengths = f"Good effort. You correctly referenced key concepts such as: {', '.join(matching_display)}. The structure of your response is clear."
            else:
                strengths = f"Good effort. Your explanation has a clear structure and covers the basic concepts well."
        else:
            if matching_display:
                strengths = f"You correctly mentioned some relevant terms such as: {', '.join(matching_display)}."
            else:
                strengths = "You attempted to answer the question, which is a good starting point."
                
        # Weaknesses
        if missed_display:
            weaknesses = f"Your answer missed several critical details from the ideal answer, including: {', '.join(missed_display)}."
            if len_ratio < 0.4:
                weaknesses += " Additionally, your explanation was too brief and lacked implementation details."
        else:
            weaknesses = "No major technical gaps identified. You covered all key concepts from the ideal answer."
            
        # Improvements
        if missed_display:
            improvements = f"To improve, study the role and implementation of: {', '.join(missed_display)}. Try incorporating these elements when explaining {category_name}."
        else:
            improvements = "Consider providing a short code snippet or real-world example to make your answer even more compelling."
            
        if filler_count > 2:
            improvements += " Also, try to reduce filler words (like 'like', 'basically') to sound more direct and professional."
            
    return EvaluationResponse(
        technical_accuracy=technical_accuracy,
        completeness=completeness,
        communication=communication,
        relevance=relevance,
        confidence=confidence,
        overall_score=overall_score,
        strengths=strengths,
        weaknesses=weaknesses,
        improvements=improvements
    )


def _get_mock_communication(request: CommunicationAnalysisRequest) -> CommunicationAnalysisResponse:
    """Return mock communication analysis with real filler word detection."""
    filler_words = ["um", "uh", "like", "actually", "basically", "you know", "sort of"]
    transcript_lower = request.transcript.lower()
    detected = [w for w in filler_words if w in transcript_lower]
    count = sum(transcript_lower.count(w) for w in detected)

    return CommunicationAnalysisResponse(
        grammar_score=8,
        fluency_score=7,
        filler_word_count=count,
        filler_words_detected=detected,
        sentence_structure_score=8,
        overall_communication_score=7,
        suggestions=[
            "Reduce filler words for clearer communication",
            "Use more structured responses with clear points",
            "Practice pausing instead of using filler words"
        ]
    )


@router.post("/evaluate", response_model=EvaluationResponse)
async def evaluate_answer(request: EvaluateAnswerRequest):
    """Evaluate a student's answer against the ideal answer.
    Uses Gemini API with fallback to mock scoring."""
    model = get_gemini_model(temperature=0.3)
    if model is None:
        logger.info("Gemini model not available, returning mock evaluation.")
        return _get_mock_evaluation(request)

    try:
        prompt = (
            f"You are an expert interview evaluator. Evaluate the following student answer "
            f"against the ideal answer for the given interview question.\n\n"
            f"Category: {request.category}\n"
            f"Question: {request.question}\n"
            f"Ideal Answer: {request.ideal_answer}\n"
            f"Student Answer: {request.student_answer}\n\n"
            f"Provide scores from 1-10 for each criterion and detailed feedback.\n"
            f"Return a JSON object with these exact fields:\n"
            f"- technical_accuracy (int, 1-10): How technically correct is the answer?\n"
            f"- completeness (int, 1-10): How complete is the answer compared to the ideal?\n"
            f"- communication (int, 1-10): How well is the answer communicated?\n"
            f"- relevance (int, 1-10): How relevant is the answer to the question?\n"
            f"- confidence (int, 1-10): How confident does the answer sound?\n"
            f"- overall_score (int, 1-10): Overall assessment score\n"
            f"- strengths (string): What the student did well\n"
            f"- weaknesses (string): Areas where the student fell short\n"
            f"- improvements (string): Specific suggestions for improvement\n\n"
            f"Respond ONLY with a JSON object, no markdown formatting."
        )

        response = model.generate_content(prompt)
        data = parse_gemini_json(response.text)

        evaluation = EvaluationResponse(**data)
        logger.info("Successfully evaluated answer via Gemini.")
        return evaluation

    except Exception as e:
        logger.error(f"Gemini answer evaluation failed: {e}", exc_info=True)
        return _get_mock_evaluation(request)


@router.post("/communication", response_model=CommunicationAnalysisResponse)
async def analyze_communication(request: CommunicationAnalysisRequest):
    """Analyze communication quality of a transcript.
    Uses filler word detection + Gemini for scoring, with mock fallback."""
    # Always detect filler words (this works reliably)
    filler_words = ["um", "uh", "like", "actually", "basically", "you know", "sort of"]
    transcript_lower = request.transcript.lower()
    detected = [w for w in filler_words if w in transcript_lower]
    filler_count = sum(transcript_lower.count(w) for w in detected)

    model = get_gemini_model(temperature=0.3)
    if model is None:
        logger.info("Gemini model not available, returning mock communication analysis.")
        return _get_mock_communication(request)

    try:
        prompt = (
            f"You are a communication skills evaluator. Analyze the following interview transcript "
            f"for communication quality.\n\n"
            f"Transcript: {request.transcript}\n\n"
            f"Evaluate and return a JSON object with these exact fields:\n"
            f"- grammar_score (int, 1-10): Quality of grammar usage\n"
            f"- fluency_score (int, 1-10): Fluency and flow of speech\n"
            f"- sentence_structure_score (int, 1-10): Quality of sentence structure\n"
            f"- overall_communication_score (int, 1-10): Overall communication quality\n"
            f"- suggestions (array of strings): 3-5 specific improvement suggestions\n\n"
            f"Respond ONLY with a JSON object, no markdown formatting."
        )

        response = model.generate_content(prompt)
        data = parse_gemini_json(response.text)

        analysis = CommunicationAnalysisResponse(
            grammar_score=data["grammar_score"],
            fluency_score=data["fluency_score"],
            filler_word_count=filler_count,
            filler_words_detected=detected,
            sentence_structure_score=data["sentence_structure_score"],
            overall_communication_score=data["overall_communication_score"],
            suggestions=data.get("suggestions", [
                "Reduce filler words for clearer communication",
                "Use more structured responses with clear points",
                "Practice pausing instead of using filler words"
            ])
        )
        logger.info("Successfully analyzed communication via Gemini.")
        return analysis

    except Exception as e:
        logger.error(f"Gemini communication analysis failed: {e}", exc_info=True)
        return _get_mock_communication(request)
