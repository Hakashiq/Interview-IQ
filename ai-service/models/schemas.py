from pydantic import BaseModel
from typing import List, Optional, Dict

# Resume Schemas
class ResumeParseRequest(BaseModel):
    file_content: str  # Base64 encoded file content
    file_type: str     # pdf or docx

class ExtractedResume(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    skills: List[str] = []
    education: List[Dict] = []
    experience: List[Dict] = []
    projects: List[Dict] = []
    certifications: List[str] = []

class ResumeParseResponse(BaseModel):
    raw_text: str
    extracted_data: ExtractedResume

class ResumeScoreRequest(BaseModel):
    text: str
    skills: List[str]

class ResumeSuggestion(BaseModel):
    priority: str  # high, medium, low
    title: str
    description: str

class ResumeScoreResponse(BaseModel):
    resume_score: int
    ats_score: int
    recruiter_score: int
    technical_depth_score: int
    interview_readiness_score: int
    missing_skills: List[str]
    improvements: List[ResumeSuggestion]
    section_scores: Dict[str, int]
    final_resume_content: str

# Question Schemas
class QuestionGenerateRequest(BaseModel):
    skills: List[str]
    job_role: str = "Software Engineer"
    difficulty: str = "INTERMEDIATE"
    count: int = 5

class GeneratedQuestion(BaseModel):
    question_text: str
    ideal_answer: str
    difficulty: str
    category: str

# Evaluation Schemas
class EvaluateAnswerRequest(BaseModel):
    question: str
    ideal_answer: str
    student_answer: str
    category: str

class EvaluationResponse(BaseModel):
    technical_accuracy: int
    completeness: int
    communication: int
    relevance: int
    confidence: int
    overall_score: int
    strengths: str
    weaknesses: str
    improvements: str

# Communication Schemas
class CommunicationAnalysisRequest(BaseModel):
    transcript: str

class CommunicationAnalysisResponse(BaseModel):
    grammar_score: int
    fluency_score: int
    filler_word_count: int
    filler_words_detected: List[str]
    sentence_structure_score: int
    overall_communication_score: int
    suggestions: List[str]

# Recommendation Schemas
class RecommendationRequest(BaseModel):
    user_skills: List[str]
    interview_scores: List[Dict]
    weak_topics: List[str]

class RecommendationResponse(BaseModel):
    dsa_topics: List[str]
    interview_topics: List[str]
    weekly_roadmap: List[Dict[str, str]]
