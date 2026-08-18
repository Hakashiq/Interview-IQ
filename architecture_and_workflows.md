# InterviewIQ Workflows & AI Communication

This document contains visual diagrams mapping out the exact data flow for every major feature in your platform. These diagrams are excellent for visual learners and are highly recommended for technical interviews to demonstrate your understanding of system architecture.

## 1. AI Voice & Text Communication Flow (The Illusion)

This diagram shows how you achieve "voice-to-voice" communication without sending heavy audio files to the server.

```mermaid
sequenceDiagram
    actor User
    participant Chrome as Browser (Speech APIs)
    participant React as Frontend
    participant Java as Spring Boot Backend
    
    Note over Java, React: 1. AI Asks Question
    Java->>React: Send Question (JSON Text)
    React->>Chrome: window.speechSynthesis.speak("Text")
    Chrome-->>User: Plays Audio (Female/Male Voice)
    
    Note over User, React: 2. User Answers
    User->>Chrome: Speaks into Microphone
    Chrome->>React: window.SpeechRecognition (Converts to Text)
    React-->>User: Displays Text in Textarea
    
    Note over React, Java: 3. Submit Answer
    React->>Java: Send Answer (JSON Text)
```

---

## 2. Resume Upload & Skill Assessment Flow

How a PDF becomes structured skill data in the database.

```mermaid
sequenceDiagram
    actor User
    participant React as Frontend
    participant Python as AI Service
    participant Gemini as Google AI
    participant Java as Backend
    participant DB as MySQL
    
    User->>React: Upload Resume (PDF)
    React->>Python: POST /ai/parse-resume (PDF File)
    Note over Python: PyMuPDF extracts raw text
    Python->>Gemini: Prompt: Extract skills from this text
    Gemini-->>Python: Return JSON (Skills, Roles)
    Python->>Java: Save Skills for User ID
    Java->>DB: INSERT into user_skills
    DB-->>Java: Success
    Java-->>Python: 200 OK
    Python-->>React: Return Extracted Data
    React-->>User: Display Skills on Screen
```

---

## 3. Interview Question Generation Flow

How the system dynamically creates tailored questions.

```mermaid
sequenceDiagram
    actor User
    participant React as Frontend
    participant Java as Backend
    participant Python as AI Service
    participant Gemini as Google AI
    participant DB as MySQL
    
    User->>React: Select Role & Click "Start Interview"
    React->>Java: POST /interviews/start (Role, Difficulty)
    Java->>DB: Fetch User's Saved Skills
    DB-->>Java: Return Skills
    Java->>Python: POST /ai/generate-questions (Skills, Role)
    Python->>Gemini: Prompt: Generate 5 interview questions
    Gemini-->>Python: Return 5 Questions (JSON)
    Python-->>Java: Return Questions
    Java->>DB: SAVE InterviewSession & Questions
    Java-->>React: Return Session ID & Question 1
    React-->>User: Display Question 1
```

---

## 4. Answer Evaluation Workflow

How an answer is graded in real-time.

```mermaid
sequenceDiagram
    actor User
    participant React as Frontend
    participant Java as Backend
    participant Python as AI Service
    participant Gemini as Google AI
    participant DB as MySQL
    
    User->>React: Click "Submit Answer" (Text)
    React->>Java: POST /interviews/{id}/submit-answer
    Java->>Python: POST /ai/evaluate (Question Text, Answer Text)
    Python->>Gemini: Prompt: Grade this answer out of 10
    Gemini-->>Python: Return Grades & Feedback (JSON)
    Python-->>Java: Return Feedback
    Java->>DB: SAVE Score to Interview History
    Java-->>React: Return Score & Feedback
    React-->>User: Display Charts & Score
```

---

## 5. Live Mock Interview & Proctoring Flow

How the frontend uses local AI to detect cheating without hitting the server.

```mermaid
sequenceDiagram
    actor User
    participant Webcam
    participant MediaPipe as Browser AI (MediaPipe)
    participant React as Frontend
    participant Java as Backend
    
    User->>Webcam: Sits in front of camera
    Webcam->>React: Video Stream (Active)
    
    loop Every 250ms
        React->>MediaPipe: Send Video Frame
        MediaPipe-->>React: Return Face Landmarks (Pitch, Yaw, Eyes)
        
        alt User looks away or 2 faces detected
            React-->>User: SHOW WARNING UI (Local)
            Note over React: If Warnings > 3
            React->>Java: POST /users/penalty (Cheat Detected)
            Java-->>React: Lock Account
            React-->>User: Redirect to Login
        else Tab Switched (Blur Event)
            React-->>User: SHOW WARNING UI (Local)
        end
    end
```
