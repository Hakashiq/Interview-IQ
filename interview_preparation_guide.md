# InterviewIQ: Full-Stack AI-Assisted Mock Interview Platform
## Interview Preparation & Technical Analysis Guide

This guide is structured to help you confidently explain, defend, and discuss the architectural and design decisions of your project in senior-level backend and system design interviews. It directly aligns with your resume bullet points.

---

## 📌 Section 1: Resume Bullet Analysis & Interview Translation

Here is how to translate your resume bullet points into compelling interview talking points.

### Bullet 1: "Developed a full-stack AI-assisted mock interview platform enabling resume analysis, skill assessment, adaptive interviews, and personalized learning recommendations."

*   **Interview Narrative:** "I built an end-to-end preparation platform for candidates. Instead of standard static question banks, the system uses AI to parse a user's resume, extract their specific skills, run an adaptive mock interview tailored to those skills and role, and generate a post-interview roadmap pointing out their weaknesses and how to fix them."
*   **Key Technical Challenge:** Combining real-time video/webcam proctoring in the browser with asynchronous AI scoring and heavy document parsing (PDFs) without lagging the UI.

### Bullet 2: "Designed and implemented REST APIs using Spring Boot and MySQL, structuring the application into controller, service, and repository layers for maintainability."

*   **Interview Narrative:** "I structured the backend using a strict 3-tier architecture (Controller-Service-Repository) in Spring Boot. This separates REST request mapping (Controller) from business rules (Service) and database queries (Repository/Spring Data JPA). This separation allowed us to write clean unit tests and swap implementations easily (e.g., swapping local storage for AWS S3 without changing controller endpoints)."
*   **Key Technical Challenge:** Managing complex relational data (User -> Resumes -> Interviews -> Questions -> Answers -> Feedback) while maintaining referential integrity in MySQL.

### Bullet 3: "Integrated FastAPI and LLM APIs for resume scoring, skill extraction, interview question generation, and answer evaluation, using Redis caching to reduce repeated database queries and response latency."

*   **Interview Narrative:** "I designed a split-backend microservices architecture. The core application runs on Spring Boot, while the AI processing runs on FastAPI (Python). Since Python has superior library support for document extraction (PyMuPDF) and NLP, FastAPI acts as our AI Orchestrator that parses resumes and talks to the Gemini API. We used Redis as a caching layer to avoid querying MySQL repeatedly for static data (like question banks) and dashboard analytics, slashing latency."
*   **Key Technical Challenge:** Maintaining inter-service communication (Spring Boot calling FastAPI, and NGINX routing calls) while securing endpoints.

---

## ⚙️ Section 2: Architecture & Component Breakdown

```text
       [ User (Browser) ]
              │
              ▼
       [ NGINX (Port 80) ]  <-- API Gateway / Routing
              │
    ┌─────────┴─────────┐
    │                   │
    ▼                   ▼
[ Frontend ]      [ Backend ]  <-- Main Business Engine (Spring Boot)
 (React)            (Java)           │
    │                   │            │
    │                   ▼            ▼
    │           [ MySQL DB ]   [ Redis ] <-- Memory Cache
    │             (Data)        (Caches: questions, dashboard)
    │                   
    │                   
    └──────────────► [ AI Service ] <-- AI Engine (FastAPI / Python)
                       (Gemini API)
```

### 1. The Gateway Layer (NGINX)
*   **Role:** Acts as the API Gateway. It routes `/api/` traffic to the Java Backend, `/ws/` to WebSockets, `/ai/` to the Python AI service, and `/` to React.
*   **Interview Defense:** "I used NGINX to prevent CORS (Cross-Origin Resource Sharing) issues by exposing a single origin (`localhost:80`) to the browser, while proxying requests to different microservices in the backend network."

### 2. The Java Backend Layer (Spring Boot)
*   **Role:** Handles Auth (Spring Security, JWT), state machine of the interview, session status, database persistence.
*   **The 3-Layer Design:**
    *   `Controller`: Validates requests (`@Valid`), maps HTTP requests (`@RestController`), returns HTTP status codes.
    *   `Service`: Contains transactional logic (`@Transactional`). Implements business rules (e.g., checking if user has remaining warnings before applying penalty).
    *   `Repository`: Implements JpaRepository interface. Abstracts SQL database queries.

### 3. The AI Service Layer (FastAPI)
*   **Role:** Performs CPU-heavy PDF processing and LLM calls.
*   **Why separated from Java?**
    1.  **Language fit:** Python is the industry standard for AI integration and data parsing.
    2.  **Resource isolation:** If a user uploads a huge PDF that consumes massive CPU during parsing, it will freeze the FastAPI node, but your Java backend will continue serving logins and interviews without interruption.

---

## ⚡ Section 3: Caching Strategy (Redis Config & Optimization)

### The Setup in your Code (`RedisConfig.java`)
Your backend defines a `RedisCacheManager` with custom configurations:
*   `dashboard`: 5 minutes TTL (Time-To-Live).
*   `questions`: 30 minutes TTL.
*   `leaderboard`: 10 minutes TTL.

### How it works: Cache-Aside Pattern
When a user requests practice questions:
1.  **Step 1:** The Backend checks if the questions exist in the Redis cache under the key `questions::[category]_[difficulty]`.
2.  **Step 2 (Cache Hit):** If they exist, Redis returns them instantly (latency ~1ms). MySQL is not hit.
3.  **Step 3 (Cache Miss):** If they don't exist, Spring queries MySQL, saves the result into Redis so it's there next time, and returns it to the user.

### Interview Scenario: Where to place `@Cacheable`
The interviewer might ask: *"Walk me through the exact code annotation you'd use to cache the question bank."*
**Your Answer:**
"I would annotate the `getQuestions` method in `QuestionServiceImpl.java` like this:"
```java
@Override
@Cacheable(value = "questions", key = "#category + '_' + #difficulty")
@Transactional(readOnly = true)
public List<QuestionResponse> getQuestions(String category, String difficulty) {
    // ... Database lookup runs only on cache miss ...
}
```
"Spring Boot interceptors will intercept this method call. If the result is already in Redis under that key, Spring returns it immediately, skipping the execution of this method entirely."

---

## 💬 Section 4: Behavioral & Technical Interview Q&A

### Q1: "What happens to the database when 10,000 users upload their resumes at the same time?" (Scalability)
*   **Expectation:** The interviewer wants to see if you understand bottlenecks. Saving PDF files inside MySQL will crash the database.
*   **Your Answer:** "First, we do not store the PDF file bytes in MySQL. MySQL only stores the metadata (e.g., file path, upload time, extracted text). Second, the actual file is written to local disk (or an S3 bucket in production). To scale this, I would introduce a **Message Queue** (like RabbitMQ or Kafka) between the Java Backend and the Python AI Service. When a PDF is uploaded, Java puts a message on the queue and returns 'Processing'. The Python service pulls from the queue at its own pace, preventing the AI servers from getting overloaded."

### Q2: "How does JWT work, and how does your backend know the token hasn't been tampered with?" (Security)
*   **Expectation:** Do you understand cryptographic signing?
*   **Your Answer:** "A JWT has three parts: Header, Payload, and Signature. During login, the backend hashes the Header and Payload together with a **secret key** (kept only on the server) to create the Signature. When a client makes a request, they send the JWT. The backend takes the Header and Payload of the incoming JWT, hashes it again with the secret key, and compares it to the incoming Signature. If they match, the token is authentic. If a hacker alters their User ID in the payload, the hashes won't match, and Spring Security will reject the request."

### Q3: "What is your Database Transaction strategy?" (Data Integrity)
*   **Expectation:** Do you know how `@Transactional` works?
*   **Your Answer:** "In my service implementations (like `RecommendationServiceImpl`), I use Spring's `@Transactional` annotation. When a method is annotated with `@Transactional`, Spring opens a database transaction at the start of the method. If the method runs successfully, Spring commits the transaction. If a runtime exception occurs (e.g., the AI service returns an error), Spring automatically rolls back all database modifications made inside that method, keeping the database in a consistent state. For read-only actions, I use `@Transactional(readOnly = true)` to optimize performance."

### Q4: "How does the Python service extract skills from a PDF?" (Parsing & NLP)
*   **Expectation:** Do you know the libraries you utilized?
*   **Your Answer:** "The FastAPI service receives the PDF file as a multipart request. We use `PyMuPDF` (fitz) to read the binary stream and extract the raw string text page-by-page. Then, we use a combination of rule-based NLP (using `spaCy` to identify tokens and nouns) and a zero-shot classification prompt sent to Google's Gemini API to classify the text into skills, work experience, and education blocks."
