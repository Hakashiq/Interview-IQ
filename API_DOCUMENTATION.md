# InterviewIQ: Comprehensive API Documentation

Welcome to the **InterviewIQ REST & WebSocket API Specification**. This document outlines all endpoints across the **Spring Boot Core Backend**, the **Python FastAPI AI Microservice**, and the **Real-Time WebSocket Gateway**.

---

## 🌐 Global Conventions & Base URLs

| Service | Environment / Network | Base URL |
| :--- | :--- | :--- |
| **NGINX Gateway (Reverse Proxy)** | Host / Browser | `http://localhost:80` |
| **Spring Boot Core Backend** | Direct / Internal Docker | `http://localhost:8080` / `http://backend:8080` |
| **FastAPI AI Microservice** | Direct / Internal Docker | `http://localhost:8000` / `http://ai-service:8000` |
| **WebSocket Connection** | SockJS / STOMP | `ws://localhost:80/ws` |

### Authentication
Unless explicitly stated as **Public**, all Spring Boot endpoints require an HTTP header with a Bearer JWT:
```http
Authorization: Bearer <JWT_ACCESS_TOKEN>
```

### Standard Response Envelopes
- **Success Responses:** JSON payload with HTTP `200 OK` or `201 CREATED`.
- **Validation Errors:** HTTP `400 BAD REQUEST` with field error map.
- **Unauthorized / Forbidden:** HTTP `401 UNAUTHORIZED` or `403 FORBIDDEN`.
- **Resource Missing:** HTTP `404 NOT FOUND`.

---

## 1. Authentication & Security APIs (`/api/auth`)

### 1.1 Register New Candidate
- **Method:** `POST`
- **Path:** `/api/auth/register`
- **Access:** Public
- **Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "password": "StrongPassword123!",
  "role": "ROLE_USER"
}
```
- **Response (`201 CREATED`):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
  "refreshToken": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "tokenType": "Bearer",
  "expiresIn": 86400,
  "user": {
    "id": 1,
    "email": "john.doe@example.com",
    "fullName": "John Doe",
    "roles": ["ROLE_USER"]
  }
}
```

### 1.2 User Login
- **Method:** `POST`
- **Path:** `/api/auth/login`
- **Access:** Public
- **Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "StrongPassword123!"
}
```
- **Response (`200 OK`):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
  "refreshToken": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "tokenType": "Bearer",
  "expiresIn": 86400,
  "user": {
    "id": 1,
    "email": "john.doe@example.com",
    "fullName": "John Doe",
    "roles": ["ROLE_USER"]
  }
}
```

### 1.3 Refresh Access Token
- **Method:** `POST`
- **Path:** `/api/auth/refresh`
- **Access:** Public
- **Request Body:**
```json
{
  "refreshToken": "7c9e6679-7425-40de-944b-e07fc1f90ae7"
}
```
- **Response (`200 OK`):** Refreshed `AuthResponse` with new JWT access token.

### 1.4 Logout
- **Method:** `POST`
- **Path:** `/api/auth/logout`
- **Access:** Authenticated
- **Request Body:**
```json
{
  "refreshToken": "7c9e6679-7425-40de-944b-e07fc1f90ae7"
}
```
- **Response (`200 OK`):**
```json
{
  "message": "Logged out successfully"
}
```

### 1.5 Change Password
- **Method:** `PUT`
- **Path:** `/api/auth/change-password`
- **Access:** Authenticated
- **Request Body:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewStrongPassword456!"
}
```
- **Response (`200 OK`):** `{"message": "Password changed successfully"}`

---

## 2. User & Profile Management APIs (`/api/users`)

### 2.1 Get Current User Profile
- **Method:** `GET`
- **Path:** `/api/users/profile`
- **Access:** Authenticated
- **Response (`200 OK`):**
```json
{
  "id": 1,
  "email": "john.doe@example.com",
  "fullName": "John Doe",
  "phone": "+1234567890",
  "avatarUrl": "/api/users/profile/avatar/view/avatar_1_uuid.png",
  "education": "B.Tech Computer Science",
  "address": "San Francisco, CA",
  "githubUrl": "https://github.com/johndoe",
  "linkedinUrl": "https://linkedin.com/in/johndoe",
  "leetcodeUrl": "https://leetcode.com/johndoe",
  "roles": ["ROLE_USER"]
}
```

### 2.2 Update Profile
- **Method:** `PUT`
- **Path:** `/api/users/profile`
- **Access:** Authenticated
- **Request Body:** Full `UpdateProfileRequest` JSON.
- **Response (`200 OK`):** Updated `UserProfileResponse`.

### 2.3 Apply Proctoring Cheat Penalty
- **Method:** `POST`
- **Path:** `/api/users/penalty`
- **Access:** Authenticated
- **Description:** Called when client-side MediaPipe or tab-blur violations exceed 3 strikes. Bans the account for 24 hours.
- **Response (`200 OK`):**
```json
{
  "message": "Penalty applied. Account banned for 24 hours."
}
```

### 2.4 Upload Profile Avatar
- **Method:** `POST`
- **Path:** `/api/users/profile/avatar`
- **Content-Type:** `multipart/form-data`
- **Parameter:** `file` (Binary Image: JPG, PNG, GIF, WEBP)
- **Response (`200 OK`):** Updated `UserProfileResponse`.

---

## 3. Resume & Skill APIs (`/api/resumes`)

### 3.1 Upload & Parse Resume
- **Method:** `POST`
- **Path:** `/api/resumes/upload`
- **Content-Type:** `multipart/form-data`
- **Parameter:** `file` (PDF, DOC, DOCX)
- **Access:** Authenticated
- **Response (`201 CREATED`):**
```json
{
  "id": 12,
  "fileName": "John_Doe_Resume.pdf",
  "uploadedAt": "2026-09-02T10:30:00",
  "skillsDetected": ["Java", "Spring Boot", "MySQL", "React", "Docker"],
  "atsScore": 84,
  "summary": "Full Stack developer with 2+ years experience in enterprise Java systems."
}
```

### 3.2 Get Latest Uploaded Resume
- **Method:** `GET`
- **Path:** `/api/resumes/latest`
- **Access:** Authenticated
- **Response (`200 OK`):** Complete `ResumeDetailResponse` including extracted education, work experience, and detected skill list.

### 3.3 Get Resume Skills by ID
- **Method:** `GET`
- **Path:** `/api/resumes/{id}/skills`
- **Access:** Authenticated
- **Response (`200 OK`):** Array of detected skill entities.

---

## 4. Interview Session Lifecycle APIs (`/api/interviews`)

### 4.1 Start Interview Session
- **Method:** `POST`
- **Path:** `/api/interviews/start`
- **Access:** Authenticated
- **Request Body:**
```json
{
  "jobRole": "Full Stack",
  "difficulty": "MEDIUM",
  "mode": "PRACTICE",
  "totalQuestions": 5
}
```
- **Response (`201 CREATED`):**
```json
{
  "id": 45,
  "jobRole": "Full Stack",
  "difficulty": "MEDIUM",
  "mode": "PRACTICE",
  "status": "IN_PROGRESS",
  "totalQuestions": 5,
  "answeredQuestions": 0,
  "startedAt": "2026-09-02T11:00:00"
}
```

### 4.2 Fetch Next Pending Question
- **Method:** `GET`
- **Path:** `/api/interviews/{id}/next-question`
- **Access:** Authenticated
- **Response (`200 OK`):**
```json
{
  "interviewQuestionId": 101,
  "questionText": "Explain the difference between optimistic and pessimistic locking in database transactions.",
  "category": "SQL",
  "difficulty": "MEDIUM",
  "sequenceOrder": 1
}
```

### 4.3 Submit Question Answer & Evaluate
- **Method:** `POST`
- **Path:** `/api/interviews/{id}/submit-answer`
- **Access:** Authenticated
- **Request Body:**
```json
{
  "interviewQuestionId": 101,
  "answerText": "Optimistic locking assumes collisions are rare and verifies record version before update. Pessimistic locking acquires a row lock upfront...",
  "timeTakenSeconds": 45
}
```
- **Response (`200 OK`):**
```json
{
  "feedback": {
    "technicalAccuracy": 9,
    "completeness": 8,
    "communication": 8,
    "relevance": 10,
    "confidence": 9,
    "overallScore": 9,
    "strengths": "Clear distinction between lock mechanisms and correct reference to version columns.",
    "weaknesses": "Could mention deadlock risks associated with pessimistic locks.",
    "improvements": "Provide an example scenario where optimistic locking is preferred (e.g., read-heavy web apps)."
  }
}
```

### 4.4 Complete Interview
- **Method:** `POST`
- **Path:** `/api/interviews/{id}/complete`
- **Access:** Authenticated
- **Response (`200 OK`):**
```json
{
  "message": "Interview completed successfully"
}
```

### 4.5 Get Comprehensive Interview Results
- **Method:** `GET`
- **Path:** `/api/interviews/{id}/results`
- **Access:** Authenticated
- **Response (`200 OK`):** Aggregated score, duration, per-question student answers, and AI feedback breakdowns.

### 4.6 Get Interview History
- **Method:** `GET`
- **Path:** `/api/interviews/history`
- **Access:** Authenticated
- **Response (`200 OK`):** Array of historical `InterviewResponse` records for the user.

---

## 5. Question Bank & Categories (`/api`)

### 5.1 Query Questions
- **Method:** `GET`
- **Path:** `/api/questions`
- **Parameters:**
  - `category` (optional, string)
  - `difficulty` (optional: `EASY`, `MEDIUM`, `HARD`)
- **Access:** Public / Authenticated
- **Response (`200 OK`):**
```json
[
  {
    "id": 14,
    "questionText": "Explain the internal working of HashMap in Java.",
    "idealAnswer": "HashMap uses an array of Node objects...",
    "category": "Java",
    "difficulty": "MEDIUM",
    "type": "TECHNICAL"
  }
]
```

### 5.2 List Categories
- **Method:** `GET`
- **Path:** `/api/categories`
- **Response (`200 OK`):** List of categories (`Java`, `Spring Boot`, `React`, `System Design`, `DSA`, etc.).

---

## 6. Recommendations & Analytics (`/api/recommendations`)

### 6.1 Get Stored Recommendations
- **Method:** `GET`
- **Path:** `/api/recommendations`
- **Access:** Authenticated
- **Response (`200 OK`):** Array of historical recommendations.

### 6.2 Generate AI Personalized Learning Roadmap
- **Method:** `POST`
- **Path:** `/api/recommendations/generate`
- **Access:** Authenticated
- **Response (`201 CREATED`):**
```json
{
  "id": 5,
  "type": "SKILL_GAP",
  "content": "Focus on improving System Design and Database Sharding concepts where your score was below 60%.",
  "roadmap": "Week 1: Horizontal vs Vertical scaling. Week 2: Consistent Hashing and Caching strategies.",
  "generatedAt": "2026-09-02T11:15:00"
}
```

---

## 7. Notifications & Real-Time Events (`/api/notifications`)

### 7.1 List Notifications
- **Method:** `GET`
- **Path:** `/api/notifications`
- **Response (`200 OK`):** List of user notification items.

### 7.2 Mark Single / All as Read
- **Method:** `PUT`
- **Path:** `/api/notifications/{id}/read` & `/api/notifications/read-all`
- **Response (`200 OK`):** `{"message": "Notification marked as read"}`

### 7.3 Get Unread Count
- **Method:** `GET`
- **Path:** `/api/notifications/unread-count`
- **Response (`200 OK`):** `{"unreadCount": 3}`

---

## 8. FastAPI AI Microservice Endpoints (`/ai`)

These endpoints are exposed by the Python FastAPI service on port 8000 and routed by NGINX via `/ai/`:

### 8.1 Parse Resume (`POST /ai/resume/parse`)
- **Request Body:**
```json
{
  "file_content": "<BASE64_ENCODED_BINARY_STREAM>",
  "file_type": "pdf"
}
```
- **Response (`200 OK`):**
```json
{
  "raw_text": "Extracted text string...",
  "name": "Candidate Name",
  "email": "candidate@example.com",
  "skills": ["Python", "FastAPI", "Docker"],
  "education": [{"degree": "B.Tech", "institution": "State University"}],
  "experience": [{"title": "Software Engineer", "company": "Tech Corp"}]
}
```

### 8.2 Generate Adaptive Questions (`POST /ai/questions/generate`)
- **Request Body:**
```json
{
  "skills": ["Java", "Spring Boot", "Microservices"],
  "job_role": "Backend Engineer",
  "difficulty": "HARD",
  "count": 5
}
```
- **Response (`200 OK`):** Array of generated questions with ideal answers and categories.

### 8.3 Evaluate Answer (`POST /ai/answers/evaluate`)
- **Request Body:**
```json
{
  "category": "Java",
  "question": "What is the role of volatile keyword?",
  "ideal_answer": "Ensures memory visibility across threads...",
  "student_answer": "It tells the JVM not to cache the variable in CPU registers..."
}
```
- **Response (`200 OK`):** Criteria scores (1-10) and feedback strings.

### 8.4 Communication & Transcript Analysis (`POST /ai/answers/communication`)
- **Request Body:** `{"transcript": "Um, basically, like, I used Spring Security..."}`
- **Response (`200 OK`):** Filler word counts, fluency scores, and grammar suggestions.

---

## 9. Real-Time WebSockets (`/ws`)

- **Protocol:** STOMP over SockJS
- **Connection URL:** `http://localhost:80/ws` (proxied by NGINX with `Upgrade: websocket` headers)
- **Topics & Subscriptions:**
  - `/topic/interviews/{sessionId}`: Real-time status, live timer synchronization, and avatar events.
  - `/user/queue/notifications`: Instant personal alerts and cheat warnings pushed directly from backend services.
