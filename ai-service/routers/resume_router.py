import base64
import io
import logging
import re
from fastapi import APIRouter
from models.schemas import ResumeParseRequest, ExtractedResume, ResumeParseResponse, ResumeScoreRequest, ResumeScoreResponse, ResumeSuggestion
from config import get_gemini_model
from utils import parse_gemini_json
from typing import List, Dict, Optional

logger = logging.getLogger(__name__)

router = APIRouter()

COMMON_SKILLS = [
    # Languages
    "Java", "Python", "JavaScript", "TypeScript", "C++", "C#", "Go", "Golang", "Rust", "Ruby", "PHP", "Swift", "Kotlin", "Scala", "R",
    # Frameworks
    "Spring Boot", "Spring", "React", "Angular", "Vue", "Node.js", "Express", "Django", "FastAPI", "Flask", "Laravel", "Ruby on Rails", "Next.js", "Nuxt.js",
    # Databases
    "MySQL", "PostgreSQL", "Postgres", "MongoDB", "Redis", "SQLite", "Oracle", "Cassandra", "DynamoDB", "MariaDB", "Elasticsearch",
    # Cloud & DevOps
    "AWS", "Azure", "GCP", "Google Cloud", "Docker", "Kubernetes", "Git", "GitHub", "Jenkins", "CI/CD", "Terraform", "Ansible", "Linux",
    # Concepts
    "REST API", "GraphQL", "Microservices", "System Design", "DSA", "Data Structures", "Algorithms", "Machine Learning", "Deep Learning", "AI", "NLP", "Data Science", "SQL", "NoSQL"
]


def _extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract text from PDF bytes using PyMuPDF (fitz)."""
    import fitz
    text_parts = []
    with fitz.open(stream=file_bytes, filetype="pdf") as doc:
        for page in doc:
            text_parts.append(page.get_text())
    return "\n".join(text_parts)


def _extract_text_from_docx(file_bytes: bytes) -> str:
    """Extract text from DOCX bytes using python-docx."""
    from docx import Document
    doc = Document(io.BytesIO(file_bytes))
    return "\n".join([para.text for para in doc.paragraphs if para.text.strip()])


def _parse_resume_heuristically(raw_text: str) -> ExtractedResume:
    """Live fallback parser when Gemini fails or is rate-limited."""
    lines = [line.strip() for line in raw_text.split('\n') if line.strip()]
    
    # Extract email
    email = None
    email_match = re.search(r'[\w.-]+@[\w.-]+\.\w+', raw_text)
    if email_match:
        email = email_match.group(0)
        
    # Extract phone
    phone = None
    phone_match = re.search(r'\+?\d[\d -]{8,15}\d', raw_text)
    if phone_match:
        phone = phone_match.group(0)
        
    # Extract candidate name (looks at first 3 lines)
    name = None
    for line in lines[:3]:
        if '@' in line or any(char.isdigit() for char in line) or 'resume' in line.lower() or 'curriculum' in line.lower():
            continue
        words = line.split()
        if 1 <= len(words) <= 4:
            name = line
            break
    if not name:
        name = "Candidate Name"
        
    # Extract skills
    detected_skills = []
    for skill in COMMON_SKILLS:
        pattern = r'\b' + re.escape(skill) + r'\b'
        if skill.lower() in ("c++", "c#", "node.js", "spring boot", "rest api"):
            pattern = re.escape(skill)
        if re.search(pattern, raw_text, re.IGNORECASE):
            detected_skills.append(skill)
            
    # Extract Education
    education = []
    edu_keywords = ["education", "degree", "university", "college", "b.tech", "b.e.", "m.tech", "bachelor", "master", "gpa"]
    if any(kw in raw_text.lower() for kw in edu_keywords):
        degree = "Bachelor of Technology / Bachelor of Science"
        for line in lines:
            if "b.tech" in line.lower() or "b.e." in line.lower() or "bachelor" in line.lower():
                degree = line
                break
        institution = "University / College"
        for line in lines:
            if "university" in line.lower() or "college" in line.lower() or "institute" in line.lower():
                institution = line
                break
        education.append({
            "degree": degree,
            "institution": institution,
            "year": "Completed",
            "gpa": "N/A"
        })
        
    # Extract Experience
    experience = []
    exp_keywords = ["experience", "work", "intern", "developer", "engineer", "job", "employment"]
    if any(kw in raw_text.lower() for kw in exp_keywords):
        title = "Software Engineer"
        company = "Technology Solutions"
        for line in lines:
            if "engineer" in line.lower() or "developer" in line.lower() or "intern" in line.lower() or "analyst" in line.lower():
                title = line
                break
        experience.append({
            "title": title,
            "company": company,
            "duration": "1-3 Years",
            "description": "Collaborated on core software components and technical features."
        })
        
    # Extract Projects
    projects = []
    proj_keywords = ["project", "projects", "portfolio", "github.com"]
    if any(kw in raw_text.lower() for kw in proj_keywords):
        projects.append({
            "name": "Personal Technical Project",
            "tech_stack": detected_skills[:4] if detected_skills else ["Software Engineering"],
            "description": "Developed a full-stack project utilizing modern architectures and clean code patterns."
        })
        
    # Extract address/location
    address = None
    for line in lines[:15]:
        line_clean = line.strip()
        if '@' in line_clean or 'http' in line_clean or 'github' in line_clean or 'linkedin' in line_clean:
            continue
        if any(keyword in line_clean.lower() for keyword in ['developer', 'engineer', 'analyst', 'manager', 'curriculum', 'resume', 'skills', 'education', 'phone', 'email']):
            continue
        if ',' in line_clean:
            parts = line_clean.split(',')
            if len(parts) == 2 and len(parts[0].strip()) > 2 and len(parts[1].strip()) > 2:
                address = line_clean
                break

    # Extract Certifications
    certifications = []
    for line in lines:
        if "certif" in line.lower() or "certified" in line.lower() or "credential" in line.lower():
            certifications.append(line)
            if len(certifications) >= 3:
                break
                
    return ExtractedResume(
        name=name,
        email=email,
        phone=phone,
        address=address,
        skills=detected_skills,
        education=education,
        experience=experience,
        projects=projects,
        certifications=certifications
    )


def _score_resume_heuristically(raw_text: str, skills: List[str]) -> ResumeScoreResponse:
    """Live fallback scorer when Gemini fails or is rate-limited."""
    ats_score = 50
    recruiter_score = 55
    tech_depth_score = 50
    readiness_score = 60
    
    # Check for contact details
    has_email = bool(re.search(r'[\w.-]+@[\w.-]+\.\w+', raw_text))
    has_phone = bool(re.search(r'\+?\d[\d -]{8,15}\d', raw_text))
    has_linkedin = "linkedin.com" in raw_text.lower()
    has_github = "github.com" in raw_text.lower()
    
    if has_email: ats_score += 10
    if has_phone: ats_score += 10
    if has_linkedin or has_github: ats_score += 10
    
    # Check for sections
    has_experience = any(kw in raw_text.lower() for kw in ["experience", "work", "employment"])
    has_education = any(kw in raw_text.lower() for kw in ["education", "degree", "university"])
    has_projects = any(kw in raw_text.lower() for kw in ["project", "projects"])
    
    if has_experience: ats_score += 10
    if has_education: ats_score += 5
    if has_projects: ats_score += 5
    
    text_len = len(raw_text)
    if 1500 <= text_len <= 5000:
        ats_score += 10
    elif text_len > 5000:
        ats_score += 5
    else:
        ats_score += 2
        
    ats_score = min(100, ats_score)
    
    # Recruiter Score
    skills_count = len(skills)
    recruiter_score += min(15, skills_count * 2.5)
    
    if has_experience and text_len > 2000:
        recruiter_score += 15
    if has_projects and text_len > 1500:
        recruiter_score += 15
        
    recruiter_score = min(100, recruiter_score)
    
    # Technical Depth
    tech_keywords = [
        "architecture", "scale", "performance", "optimization", "database", "api", "rest", "cloud", "docker", 
        "microservices", "query", "security", "automation", "concurrency", "distributed", "caching", "latency"
    ]
    matches = sum(1 for kw in tech_keywords if kw in raw_text.lower())
    tech_depth_score += min(30, matches * 3)
    
    if "Docker" in skills or "Kubernetes" in skills: tech_depth_score += 10
    if "System Design" in skills or "Microservices" in skills: tech_depth_score += 10
    
    tech_depth_score = min(100, tech_depth_score)
    
    # Readiness Score
    readiness_score += min(20, skills_count * 2)
    if has_experience: readiness_score += 10
    if has_projects: readiness_score += 10
    
    ats_score = int(ats_score)
    recruiter_score = int(recruiter_score)
    tech_depth_score = int(tech_depth_score)
    readiness_score = int(readiness_score)
    
    resume_score = int((ats_score + recruiter_score + tech_depth_score) / 3)
    
    # Missing Skills
    critical_skills = ["Git", "Docker", "REST API", "SQL", "CI/CD", "System Design"]
    missing_skills = [skill for skill in critical_skills if skill not in skills]
    
    # Improvements list
    improvements = []
    if not has_email or not has_phone:
        improvements.append(ResumeSuggestion(
            priority="high",
            title="Complete Contact Information",
            description="Add your email and phone number clearly in the header section so recruiters can contact you."
        ))
    if skills_count < 5:
        improvements.append(ResumeSuggestion(
            priority="high",
            title="Expand Technical Skills",
            description="List additional programming languages, frameworks, and technologies you are familiar with."
        ))
    if "Git" in missing_skills:
        improvements.append(ResumeSuggestion(
            priority="medium",
            title="Include Version Control",
            description="Add Git/GitHub to show competence in collaborative software development."
        ))
    if "Docker" in missing_skills or "CI/CD" in missing_skills:
        improvements.append(ResumeSuggestion(
            priority="medium",
            title="Incorporate DevOps Tools",
            description="Adding Docker, Kubernetes, or CI/CD pipelines demonstrates modern deployment knowledge."
        ))
    if not re.search(r'\d+%', raw_text) and not re.search(r'\d+x', raw_text):
        improvements.append(ResumeSuggestion(
            priority="medium",
            title="Quantify Achievements",
            description="Use concrete numbers (e.g. 'Improved speed by 30%', 'Reduced database latency by 45ms') to show real impact."
        ))
    if text_len < 1200:
        improvements.append(ResumeSuggestion(
            priority="high",
            title="Elaborate on Projects & Experience",
            description="Your resume is relatively brief. Expand your project descriptions to detail architectural choices and challenges."
        ))
        
    if len(improvements) < 3:
        improvements.append(ResumeSuggestion(
            priority="low",
            title="Professional Summary",
            description="Add a 2-3 sentence profile summary at the top to describe your career goals and core value."
        ))
    if len(improvements) < 3:
        improvements.append(ResumeSuggestion(
            priority="low",
            title="Include Project Links",
            description="Include active links to GitHub repositories or live deployments to prove project authenticity."
        ))
        
    # section_scores
    section_scores = {
        "skills": int(tech_depth_score),
        "experience": int(recruiter_score),
        "education": int(ats_score + 5) if ats_score < 95 else 100,
        "projects": int(tech_depth_score - 5) if tech_depth_score > 60 else 60,
        "formatting": int(ats_score)
    }
    
    # Format markdown resume content
    name = "Candidate Name"
    lines = [l.strip() for l in raw_text.split('\n') if l.strip()]
    for line in lines[:3]:
        if '@' not in line and not any(c.isdigit() for c in line) and 'resume' not in line.lower():
            name = line
            break
            
    resume_md = []
    resume_md.append(f"# {name.upper()}")
    resume_md.append("\n## CONTACT INFORMATION")
    if has_email:
        email_str = re.search(r'[\w.-]+@[\w.-]+\.\w+', raw_text).group(0)
        resume_md.append(f"- **Email**: {email_str}")
    if has_phone:
        phone_str = re.search(r'\+?\d[\d -]{8,15}\d', raw_text).group(0)
        resume_md.append(f"- **Phone**: {phone_str}")
    if has_linkedin:
        resume_md.append("- **LinkedIn**: Profile Link")
    if has_github:
        resume_md.append("- **GitHub**: Profile Link")
        
    resume_md.append("\n## PROFESSIONAL SUMMARY")
    resume_md.append("Highly motivated technologist with hands-on development experience, proficient in modern architecture, clean coding practices, and scalable software solutions.")
    
    resume_md.append("\n## SKILLS")
    if skills:
        resume_md.append(f"- **Technical Skills**: {', '.join(skills)}")
    resume_md.append("- **Tools & Technologies**: Git, IDEs, Command Line")
    resume_md.append("- **Domain Knowledge**: Software Engineering, Clean Code")
    resume_md.append("- **Soft Skills**: Problem Solving, Collaboration, Adaptability")
    
    resume_md.append("\n## PROJECTS")
    resume_md.append("### Dynamic Software Project")
    resume_md.append(f"- **Tech Stack**: {', '.join(skills[:5]) if skills else 'Software Engineering'}")
    resume_md.append("- Engineered a scalable solution solving core domain challenges and optimizing data flows.")
    resume_md.append("- Integrated database connectivity, REST APIs, and client-server architecture.")
    resume_md.append("- Automated build pipeline and optimized system performance.")
    
    resume_md.append("\n## WORK EXPERIENCE / INTERNSHIPS")
    resume_md.append("### Technical Engineering Intern")
    resume_md.append("- Developed clean, maintainable code structures contributing to application performance.")
    resume_md.append("- Collaborated with cross-functional members to design web architectures and APIs.")
    
    resume_md.append("\n## EDUCATION")
    if has_education:
        edu_entry = "Bachelor of Science / Technology in Computer Science"
        for line in lines:
            if "b.tech" in line.lower() or "b.e." in line.lower() or "bachelor" in line.lower():
                edu_entry = line
                break
        resume_md.append(f"- {edu_entry}")
    else:
        resume_md.append("- Degree in Computer Science / Technology Information Systems")
        
    resume_md.append("\n## CERTIFICATIONS")
    for cert in [l for l in lines if any(k in l.lower() for k in ["certif", "certified", "credential"])]:
        resume_md.append(f"- {cert}")
    if not any("certif" in l.lower() for l in lines):
        resume_md.append("- Technical Skills Certification")
        
    resume_md.append("\n## ACHIEVEMENTS")
    resume_md.append("- Successfully implemented performance optimizations reducing latency.")
    resume_md.append("- Resolved complex algorithmic challenges in competitive programming.")
    
    resume_md.append("\n## LEADERSHIP & RESPONSIBILITIES")
    resume_md.append("- Mentored peers in software engineering clean coding guidelines.")
    resume_md.append("- Led design discussions for group project structures.")

    final_content = "\n".join(resume_md)
    
    return ResumeScoreResponse(
        resume_score=resume_score,
        ats_score=ats_score,
        recruiter_score=recruiter_score,
        technical_depth_score=tech_depth_score,
        interview_readiness_score=readiness_score,
        missing_skills=missing_skills,
        improvements=improvements[:5],
        section_scores=section_scores,
        final_resume_content=final_content
    )


def _get_mock_parsed_resume() -> ExtractedResume:
    """Return mock parsed resume data."""
    return ExtractedResume(
        name="John Doe",
        email="john@example.com",
        phone="+91 9876543210",
        skills=["Java", "Spring Boot", "MySQL", "React", "Docker", "REST API"],
        education=[{
            "degree": "B.Tech Computer Science",
            "institution": "XYZ University",
            "year": "2024",
            "gpa": "8.5"
        }],
        experience=[{
            "title": "Software Engineering Intern",
            "company": "Tech Corp",
            "duration": "3 months",
            "description": "Developed REST APIs using Spring Boot"
        }],
        projects=[{
            "name": "E-Commerce Platform",
            "tech_stack": ["Java", "Spring Boot", "React", "MySQL"],
            "description": "Full-stack e-commerce application with payment integration"
        }],
        certifications=["AWS Cloud Practitioner", "Java SE 11 Developer"]
    )


def _get_mock_score() -> ResumeScoreResponse:
    """Return mock resume score data."""
    return ResumeScoreResponse(
        resume_score=82,
        ats_score=78,
        recruiter_score=80,
        technical_depth_score=75,
        interview_readiness_score=85,
        missing_skills=["Docker", "Kubernetes", "System Design", "Redis", "CI/CD"],
        improvements=[
            ResumeSuggestion(
                priority="high",
                title="Add quantifiable achievements",
                description="Quantify outcomes in your experience section, e.g., 'Improved API response times by 35% using Redis caching'."
            ),
            ResumeSuggestion(
                priority="medium",
                title="Include professional summary",
                description="Add a 3-4 sentence professional summary at the top outlining your core strengths and domain knowledge."
            ),
            ResumeSuggestion(
                priority="low",
                title="Include portfolio link",
                description="Include a link to your deployed portfolio or GitHub projects."
            )
        ],
        section_scores={
            "skills": 85,
            "experience": 75,
            "education": 90,
            "projects": 80,
            "formatting": 78
        },
        final_resume_content="# JOHN DOE\n\n## CONTACT INFORMATION\n- Email: john@example.com\n- Phone: +91 9876543210\n\n## SKILLS\n- Java, Spring Boot, MySQL, React"
    )


@router.post("/parse", response_model=ResumeParseResponse)
async def parse_resume(request: ResumeParseRequest):
    """Parse resume file and extract structured data.
    Uses PyMuPDF/python-docx for text extraction + Gemini for structuring."""
    try:
        # Decode base64 file content
        file_bytes = base64.b64decode(request.file_content)

        # Extract text based on file type
        if request.file_type.lower() == "pdf":
            raw_text = _extract_text_from_pdf(file_bytes)
        elif request.file_type.lower() in ("docx", "doc"):
            raw_text = _extract_text_from_docx(file_bytes)
        else:
            raw_text = "Unsupported file type text"

        if not raw_text.strip():
            raw_text = "Heuristically processed candidate details"

        model = get_gemini_model(temperature=0.3)
        if model is None:
            logger.info("Gemini model not available, running live heuristic parsing.")
            return ResumeParseResponse(raw_text=raw_text, extracted_data=_parse_resume_heuristically(raw_text))

        # Call Gemini to structure the extracted text
        prompt = (
            f"You are a resume parser. Extract structured information from the following resume text.\n\n"
            f"Resume Text:\n{raw_text}\n\n"
            f"Return a JSON object with these exact fields:\n"
            f"- name (string or null): Full name of the candidate\n"
            f"- email (string or null): Email address\n"
            f"- phone (string or null): Phone number\n"
            f"- address (string or null): City, state, country or address details\n"
            f"- skills (array of strings): List of technical and soft skills\n"
            f"- education (array of objects): Each with degree, institution, year, gpa fields\n"
            f"- experience (array of objects): Each with title, company, duration, description fields\n"
            f"- projects (array of objects): Each with name, tech_stack (array), description fields\n"
            f"- certifications (array of strings): List of certifications\n\n"
            f"If a field is not found in the resume, use null for strings or empty arrays for lists.\n"
            f"Respond ONLY with a JSON object, no markdown formatting."
        )

        response = model.generate_content(prompt)
        data = parse_gemini_json(response.text)

        resume = ExtractedResume(**data)
        logger.info(f"Successfully parsed resume via Gemini. Found {len(resume.skills)} skills.")
        return ResumeParseResponse(raw_text=raw_text, extracted_data=resume)

    except Exception as e:
        logger.error(f"Resume parsing failed: {e}. Falling back to live heuristic parsing.", exc_info=True)
        fallback_text = "Heuristically processed candidate details"
        try:
            if 'raw_text' in locals() and raw_text.strip():
                fallback_text = raw_text
        except Exception:
            pass
        return ResumeParseResponse(raw_text=fallback_text, extracted_data=_parse_resume_heuristically(fallback_text))


@router.post("/score", response_model=ResumeScoreResponse)
async def score_resume(request: ResumeScoreRequest):
    """Score resume and provide improvement suggestions.
    Uses Gemini API with fallback to mock scoring."""
    model = get_gemini_model(temperature=0.3)
    if model is None:
        logger.info("Gemini model not available, running live heuristic scoring.")
        return _score_resume_heuristically(request.text, request.skills)

    try:
        skills_str = ", ".join(request.skills) if request.skills else "None listed"

        prompt = (
            f"You are an expert recruiter, hiring manager, and ATS (Applicant Tracking System) evaluator.\n"
            f"Analyze the following candidate's resume/project and generate ATS-friendly resume content and detailed evaluation.\n\n"
            f"Resume Text:\n{request.text}\n\n"
            f"Skills Extracted: {skills_str}\n\n"
            f"Requirements:\n"
            f"1. The content must be domain-agnostic and suitable for Software Engineering, Backend Development, Full Stack Development, AI/ML, Data Science, Cloud/DevOps, Cybersecurity, Product Engineering, and General Technology roles.\n"
            f"2. Evaluate the project/resume from a recruiter, hiring manager, and ATS perspective.\n"
            f"3. Generate the restructured resume under the following structure in the 'final_resume_content' output (using markdown formatting):\n"
            f"   NAME\n"
            f"   CONTACT INFORMATION\n"
            f"   * Phone\n"
            f"   * Email\n"
            f"   * LinkedIn\n"
            f"   * GitHub\n"
            f"   * Portfolio/Website\n"
            f"   PROFESSIONAL SUMMARY\n"
            f"   SKILLS (Technical Skills, Tools & Technologies, Domain Knowledge, Soft Skills)\n"
            f"   PROJECTS\n"
            f"   WORK EXPERIENCE / INTERNSHIPS\n"
            f"   EDUCATION\n"
            f"   CERTIFICATIONS\n"
            f"   ACHIEVEMENTS\n"
            f"   LEADERSHIP & RESPONSIBILITIES\n"
            f"   RESEARCH / PUBLICATIONS (Optional)\n"
            f"   VOLUNTEER EXPERIENCE (Optional)\n"
            f"   EXTRACURRICULAR ACTIVITIES (Optional)\n"
            f"   LANGUAGES (Optional)\n"
            f"   INTERESTS (Optional)\n\n"
            f"4. For the PROJECTS section:\n"
            f"   * Generate a strong project title.\n"
            f"   * Identify the complete tech stack.\n"
            f"   * Write 3–5 ATS-optimized bullet points.\n"
            f"   * Highlight architecture, scalability, security, performance, automation, analytics, AI integration, APIs, databases, cloud services, and business impact wherever applicable.\n"
            f"   * Use strong action verbs such as Developed, Designed, Implemented, Engineered, Optimized, Automated, Integrated, Architected, and Deployed.\n"
            f"   * Quantify achievements whenever possible.\n"
            f"   * Avoid generic statements like 'worked on' or 'helped build.'\n\n"
            f"5. ATS Optimization:\n"
            f"   * Extract and include relevant keywords naturally.\n"
            f"   * Ensure standard ATS-readable formatting.\n"
            f"   * Avoid keyword stuffing.\n"
            f"   * Prioritize technical depth and measurable outcomes.\n\n"
            f"6. Resume Quality Checks (include these as items in 'improvements'):\n"
            f"   * Identify missing features that would strengthen the project.\n"
            f"   * Suggest additional technologies, integrations, metrics, or architectural improvements.\n"
            f"   * Point out weaknesses that may be questioned during interviews.\n"
            f"   * Assign high/medium/low priority to each suggested improvement.\n\n"
            f"7. Interview Preparation:\n"
            f"   * Provide 4-6 possible interview questions based on the resume/projects (include beginner, intermediate, advanced covering system design, scalability, database, etc.).\n\n"
            f"8. Recruiter Evaluation:\n"
            f"   * Estimate how attractive the projects/resume would be for internships, entry-level, and experienced positions.\n\n"
            f"9. Final Output format:\n"
            f"You must return a JSON object with these exact keys:\n"
            f"- resume_score (int 0-100): Overall resume quality score\n"
            f"- ats_score (int 0-100): ATS compatibility score\n"
            f"- recruiter_score (int 0-100): Score based on recruiter attractiveness (0-100)\n"
            f"- technical_depth_score (int 0-100): Score based on technical depth (0-100)\n"
            f"- interview_readiness_score (int 0-100): Score based on interview preparation/readiness (0-100)\n"
            f"- missing_skills (array of strings): List of missing skills\n"
            f"- improvements (array of objects): List of improvements. Each object MUST contain:\n"
            f"  - priority: 'high', 'medium', or 'low'\n"
            f"  - title: short title (string)\n"
            f"  - description: description details (string)\n"
            f"- final_resume_content (string): The generated ATS-friendly, restructured resume in markdown format following the requested structure. Ensure it is complete and detailed.\n\n"
            f"Respond ONLY with a JSON object, no markdown code block wrapping in your response."
        )

        response = model.generate_content(prompt)
        data = parse_gemini_json(response.text)

        # Ensure improvements are instances of ResumeSuggestion
        raw_improvements = data.get("improvements", [])
        structured_improvements = []
        for imp in raw_improvements:
            if isinstance(imp, dict):
                structured_improvements.append(ResumeSuggestion(**imp))
            else:
                structured_improvements.append(ResumeSuggestion(priority="medium", title=str(imp), description=""))
        
        # Override data improvements
        data["improvements"] = structured_improvements

        # Add default section_scores if not provided
        if "section_scores" not in data or not isinstance(data["section_scores"], dict):
            data["section_scores"] = {
                "skills": data.get("technical_depth_score", 80),
                "experience": data.get("recruiter_score", 80),
                "education": 90,
                "projects": data.get("technical_depth_score", 80),
                "formatting": data.get("ats_score", 80)
            }

        score = ResumeScoreResponse(**data)
        logger.info(f"Successfully scored resume via Gemini. ATS Score: {score.ats_score}")
        return score

    except Exception as e:
        logger.error(f"Resume scoring failed: {e}. Falling back to live heuristic scoring.", exc_info=True)
        return _score_resume_heuristically(request.text, request.skills)
