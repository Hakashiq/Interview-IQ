# Graph Report - interview-iq  (2026-09-03)

## Corpus Check
- 151 files · ~68,433 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1075 nodes · 2478 edges · 69 communities (50 shown, 12 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 108 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9bed7c00`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- resume_router.py
- App.jsx
- lombok.AllArgsConstructor
- InterviewIQ: Comprehensive API Documentation
- org.slf4j.Logger
- InterviewIQ: Comprehensive Senior Technical Study & Interview Guide
- org.springframework.security.core.Authentication
- AuthServiceImpl.java
- .submitAnswer
- org.springframework.data.jpa.repository.JpaRepository
- UserRepository
- ApiErrorResponse
- AdminController
- NotificationService
- QuestionResponse
- ResourceNotFoundException
- Answer
- RecommendationResponse
- Interview
- InterviewIQ: Full-Stack AI-Assisted Mock Interview Platform
- devDependencies
- dependencies
- org.springframework.transaction.annotation.Transactional
- org.springframework.http.ResponseEntity
- JwtAuthenticationFilter
- RedisConfig.java
- StudentSkill
- NotificationServiceImpl
- org.springframework.context.annotation.Configuration
- SecurityConfig.java
- InterviewQuestion
- AIClientServiceImpl
- AdminPrompt
- InterviewTemplate
- UserFeedback
- Violation
- JwtTokenProvider
- package.json
- WebSocketConfig.java
- Notification
- Recommendation
- Resume
- Skill
- SystemConfig
- User.java
- User
- DataSeeder.java
- InterviewIQ Workflows & AI Communication
- InterviewQuestionResponse
- org.springframework.data.jpa.domain.support.AuditingEntityListener
- mvn
- React + Vite
- ai-service/vercel.json
- frontend/vercel.json
- mvnDebug
- mvnyjp
- chart.js
- react-router-dom
- globals
- @types/react
- @vitejs/plugin-react
- com.interviewiq:interview-iq-backend

## God Nodes (most connected - your core abstractions)
1. `ResourceNotFoundException` - 45 edges
2. `UserRepository` - 41 edges
3. `AdminController` - 37 edges
4. `User` - 35 edges
5. `BadRequestException` - 34 edges
6. `MessageResponse` - 29 edges
7. `InterviewServiceImpl` - 28 edges
8. `useAuth()` - 22 edges
9. `Interview` - 20 edges
10. `Question` - 19 edges

## Surprising Connections (you probably didn't know these)
- `AuditLogRepository` --references--> `AuditLog`  [EXTRACTED]
  repository/AuditLogRepository.java → backend/src/main/java/com/interviewiq/entity/AuditLog.java
- `parse_resume()` --uses--> `ResumeParseRequest`  [INFERRED]
  ai-service/routers/resume_router.py → ai-service/models/schemas.py
- `parse_resume()` --uses--> `ResumeParseResponse`  [INFERRED]
  ai-service/routers/resume_router.py → ai-service/models/schemas.py
- `score_resume()` --uses--> `ResumeScoreRequest`  [INFERRED]
  ai-service/routers/resume_router.py → ai-service/models/schemas.py
- `score_resume()` --uses--> `ResumeSuggestion`  [INFERRED]
  ai-service/routers/resume_router.py → ai-service/models/schemas.py

## Import Cycles
- None detected.

## Communities (69 total, 12 thin omitted)

### Community 0 - "resume_router.py"
Cohesion: 0.07
Nodes (62): Config, get_gemini_model(), Get configured Gemini model. Returns None if API key not set., Settings, health_check(), CommunicationAnalysisRequest, CommunicationAnalysisResponse, EvaluateAnswerRequest (+54 more)

### Community 1 - "App.jsx"
Cohesion: 0.07
Nodes (41): api, API_BASE_URL, AdminRoute(), App(), MentorRoute(), ProtectedRoute(), PublicRoute(), AppLayout() (+33 more)

### Community 2 - "lombok.AllArgsConstructor"
Cohesion: 0.10
Nodes (28): AuthController, PostMapping, RequestMapping, ResponseEntity, RestController, PostMapping, RequestMapping, ResponseEntity (+20 more)

### Community 3 - "InterviewIQ: Comprehensive API Documentation"
Cohesion: 0.05
Nodes (42): 1.1 Register New Candidate, 1.2 User Login, 1.3 Refresh Access Token, 1.4 Logout, 1.5 Change Password, 1. Authentication & Security APIs (`/api/auth`), 2.1 Get Current User Profile, 2.2 Update Profile (+34 more)

### Community 4 - "org.slf4j.Logger"
Cohesion: 0.08
Nodes (22): Category, AllArgsConstructor, Builder, Entity, Getter, NoArgsConstructor, Setter, Table (+14 more)

### Community 5 - "InterviewIQ: Comprehensive Senior Technical Study & Interview Guide"
Cohesion: 0.05
Nodes (39): 1. Defending the Core Headline, 1. The Core Elevator Pitch (30 seconds), 2. End-to-End Feature Workflows & Implementation Code, 2. Why It's Architecturally Sound (The "Engineering" Behind It), 3. Spring Boot & MySQL REST API Architecture, 4. The 3-Layer Architecture & Maintainability (SOLID), 5. FastAPI & LLM API Integration Pipeline, 6. Deep Dive: AI Features, Libraries & Mechanics (+31 more)

### Community 6 - "org.springframework.security.core.Authentication"
Cohesion: 0.12
Nodes (18): InterviewController, GetMapping, PostMapping, RequestMapping, ResponseEntity, RestController, AllArgsConstructor, Builder (+10 more)

### Community 7 - "AuthServiceImpl.java"
Cohesion: 0.09
Nodes (25): AllArgsConstructor, Builder, Entity, EntityListeners, Getter, NoArgsConstructor, Setter, Table (+17 more)

### Community 8 - ".submitAnswer"
Cohesion: 0.07
Nodes (21): AllArgsConstructor, Builder, Data, NoArgsConstructor, SubmitAnswerRequest, AnswerFeedbackResponse, AllArgsConstructor, Builder (+13 more)

### Community 9 - "org.springframework.data.jpa.repository.JpaRepository"
Cohesion: 0.12
Nodes (18): AuditLog, AllArgsConstructor, Builder, Entity, Getter, NoArgsConstructor, Setter, Table (+10 more)

### Community 10 - "UserRepository"
Cohesion: 0.15
Nodes (9): ResumeRepository, SkillRepository, UserRepository, AIClientService, RecommendationServiceImpl, Override, SuggestionDto, ResumeServiceImpl (+1 more)

### Community 11 - "ApiErrorResponse"
Cohesion: 0.20
Nodes (13): ApiErrorResponse, GlobalExceptionHandler, ResponseEntity, UnauthorizedException, com.fasterxml.jackson.annotation.JsonInclude, org.springframework.http.HttpStatus, org.springframework.security.authentication.BadCredentialsException, org.springframework.web.bind.annotation.ExceptionHandler (+5 more)

### Community 12 - "AdminController"
Cohesion: 0.21
Nodes (10): AuditLogRepository, AdminController, PostMapping, PutMapping, RequestMapping, RestController, MessageResponse, BadRequestException (+2 more)

### Community 13 - "NotificationService"
Cohesion: 0.13
Nodes (11): GetMapping, PutMapping, RequestMapping, RestController, NotificationController, AllArgsConstructor, Builder, Data (+3 more)

### Community 14 - "QuestionResponse"
Cohesion: 0.12
Nodes (15): GetMapping, RequestMapping, RestController, QuestionController, CategoryResponse, AllArgsConstructor, Builder, Data (+7 more)

### Community 15 - "ResourceNotFoundException"
Cohesion: 0.18
Nodes (10): GetMapping, GetMapping, PostMapping, PutMapping, RequestMapping, RestController, UserController, UserProfileResponse (+2 more)

### Community 16 - "Answer"
Cohesion: 0.10
Nodes (19): Answer, AllArgsConstructor, Builder, Entity, EntityListeners, Getter, NoArgsConstructor, Setter (+11 more)

### Community 17 - "RecommendationResponse"
Cohesion: 0.14
Nodes (12): GetMapping, PostMapping, RequestMapping, ResponseEntity, RestController, RecommendationController, AllArgsConstructor, Builder (+4 more)

### Community 18 - "Interview"
Cohesion: 0.14
Nodes (12): NotificationScheduler, Interview, AllArgsConstructor, Builder, Entity, EntityListeners, Getter, NoArgsConstructor (+4 more)

### Community 19 - "InterviewIQ: Full-Stack AI-Assisted Mock Interview Platform"
Cohesion: 0.10
Nodes (19): 1. The Gateway Layer (NGINX), 2. The Java Backend Layer (Spring Boot), 3. The AI Service Layer (FastAPI), Bullet 1: "Developed a full-stack AI-assisted mock interview platform enabling resume analysis, skill assessment, adaptive interviews, and personalized learning recommendations.", Bullet 2: "Designed and implemented REST APIs using Spring Boot and MySQL, structuring the application into controller, service, and repository layers for maintainability.", Bullet 3: "Integrated FastAPI and LLM APIs for resume scoring, skill extraction, interview question generation, and answer evaluation, using Redis caching to reduce repeated database queries and response latency.", How it works: Cache-Aside Pattern, Interview Preparation & Technical Analysis Guide (+11 more)

### Community 20 - "devDependencies"
Cohesion: 0.11
Nodes (19): autoprefixer, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, devDependencies, autoprefixer, eslint (+11 more)

### Community 21 - "dependencies"
Cohesion: 0.11
Nodes (19): axios, dependencies, axios, @mediapipe/tasks-vision, react, react-chartjs-2, react-dom, react-hot-toast (+11 more)

### Community 22 - "org.springframework.transaction.annotation.Transactional"
Cohesion: 0.28
Nodes (4): InterviewServiceImpl, Override, Override, org.springframework.transaction.annotation.Transactional

### Community 23 - "org.springframework.http.ResponseEntity"
Cohesion: 0.19
Nodes (4): GetMapping, PutMapping, GetMapping, org.springframework.http.ResponseEntity

### Community 24 - "JwtAuthenticationFilter"
Cohesion: 0.23
Nodes (11): AuthEntryPoint, Override, Override, JwtAuthenticationFilter, jakarta.servlet.FilterChain, jakarta.servlet.http.HttpServletRequest, jakarta.servlet.http.HttpServletResponse, org.springframework.security.core.AuthenticationException (+3 more)

### Community 25 - "RedisConfig.java"
Cohesion: 0.22
Nodes (10): RedisConfig, InterviewIqApplication, org.springframework.boot.autoconfigure.SpringBootApplication, org.springframework.cache.annotation.EnableCaching, org.springframework.data.jpa.repository.config.EnableJpaAuditing, org.springframework.data.redis.cache.RedisCacheManager, org.springframework.data.redis.connection.RedisConnectionFactory, org.springframework.data.redis.core.RedisTemplate (+2 more)

### Community 26 - "StudentSkill"
Cohesion: 0.20
Nodes (9): AllArgsConstructor, Builder, Entity, Getter, NoArgsConstructor, Setter, Table, StudentSkill (+1 more)

### Community 27 - "NotificationServiceImpl"
Cohesion: 0.29
Nodes (3): NotificationRepository, Override, NotificationServiceImpl

### Community 28 - "org.springframework.context.annotation.Configuration"
Cohesion: 0.25
Nodes (7): CorsConfig, Override, RestTemplate, RestTemplateConfig, org.springframework.context.annotation.Configuration, org.springframework.web.servlet.config.annotation.CorsRegistry, org.springframework.web.servlet.config.annotation.WebMvcConfigurer

### Community 29 - "SecurityConfig.java"
Cohesion: 0.33
Nodes (7): SecurityConfig, org.springframework.context.annotation.Bean, org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration, org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity, org.springframework.security.config.annotation.web.builders.HttpSecurity, org.springframework.security.config.annotation.web.configuration.EnableWebSecurity, org.springframework.security.web.SecurityFilterChain

### Community 30 - "InterviewQuestion"
Cohesion: 0.20
Nodes (9): InterviewQuestion, AllArgsConstructor, Builder, Entity, Getter, NoArgsConstructor, Setter, Table (+1 more)

### Community 31 - "AIClientServiceImpl"
Cohesion: 0.29
Nodes (4): AIClientServiceImpl, Override, org.springframework.web.client.RestTemplate, SuppressWarnings

### Community 32 - "AdminPrompt"
Cohesion: 0.20
Nodes (8): AdminPrompt, AllArgsConstructor, Builder, Entity, Getter, NoArgsConstructor, Setter, Table

### Community 33 - "InterviewTemplate"
Cohesion: 0.20
Nodes (8): InterviewTemplate, AllArgsConstructor, Builder, Entity, Getter, NoArgsConstructor, Setter, Table

### Community 34 - "UserFeedback"
Cohesion: 0.20
Nodes (8): AllArgsConstructor, Builder, Entity, Getter, NoArgsConstructor, Setter, Table, UserFeedback

### Community 35 - "Violation"
Cohesion: 0.20
Nodes (8): AllArgsConstructor, Builder, Entity, Getter, NoArgsConstructor, Setter, Table, Violation

### Community 37 - "package.json"
Cohesion: 0.20
Nodes (9): name, private, scripts, build, dev, lint, preview, type (+1 more)

### Community 38 - "WebSocketConfig.java"
Cohesion: 0.36
Nodes (6): Override, WebSocketConfig, org.springframework.messaging.simp.config.MessageBrokerRegistry, org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker, org.springframework.web.socket.config.annotation.StompEndpointRegistry, org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer

### Community 39 - "Notification"
Cohesion: 0.22
Nodes (9): AllArgsConstructor, Builder, Entity, EntityListeners, Getter, NoArgsConstructor, Setter, Table (+1 more)

### Community 40 - "Recommendation"
Cohesion: 0.22
Nodes (9): AllArgsConstructor, Builder, Entity, EntityListeners, Getter, NoArgsConstructor, Setter, Table (+1 more)

### Community 41 - "Resume"
Cohesion: 0.22
Nodes (9): AllArgsConstructor, Builder, Entity, EntityListeners, Getter, NoArgsConstructor, Setter, Table (+1 more)

### Community 42 - "Skill"
Cohesion: 0.22
Nodes (8): AllArgsConstructor, Builder, Entity, Getter, NoArgsConstructor, Setter, Table, Skill

### Community 43 - "SystemConfig"
Cohesion: 0.22
Nodes (8): AllArgsConstructor, Builder, Entity, Getter, NoArgsConstructor, Setter, Table, SystemConfig

### Community 44 - "User.java"
Cohesion: 0.28
Nodes (4): CustomUserDetailsService, Override, org.springframework.security.core.userdetails.UserDetails, org.springframework.security.core.userdetails.UserDetailsService

### Community 45 - "User"
Cohesion: 0.22
Nodes (9): AllArgsConstructor, Builder, Entity, EntityListeners, Getter, NoArgsConstructor, Setter, Table (+1 more)

### Community 46 - "DataSeeder.java"
Cohesion: 0.36
Nodes (5): DataSeeder, Override, jakarta.persistence.EntityManager, lombok.RequiredArgsConstructor, org.springframework.boot.CommandLineRunner

### Community 47 - "InterviewIQ Workflows & AI Communication"
Cohesion: 0.29
Nodes (6): 1. AI Voice & Text Communication Flow (The Illusion), 2. Resume Upload & Skill Assessment Flow, 3. Interview Question Generation Flow, 4. Answer Evaluation Workflow, 5. Live Mock Interview & Proctoring Flow, InterviewIQ Workflows & AI Communication

### Community 48 - "InterviewQuestionResponse"
Cohesion: 0.29
Nodes (5): InterviewQuestionResponse, AllArgsConstructor, Builder, Data, NoArgsConstructor

### Community 50 - "mvn"
Cohesion: 0.70
Nodes (4): mvn script, concat_lines(), find_file_argument_basedir(), find_maven_basedir()

### Community 51 - "React + Vite"
Cohesion: 0.50
Nodes (3): Expanding the ESLint configuration, React Compiler, React + Vite

## Knowledge Gaps
- **129 isolated node(s):** `Config`, `builds`, `routes`, `com.interviewiq:interview-iq-backend`, `name` (+124 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 417 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `User` connect `User` to `lombok.AllArgsConstructor`, `org.slf4j.Logger`, `org.springframework.security.core.Authentication`, `AuthServiceImpl.java`, `org.springframework.data.jpa.repository.JpaRepository`, `UserRepository`, `AdminController`, `NotificationService`, `ResourceNotFoundException`, `RecommendationResponse`, `Interview`, `StudentSkill`, `JwtTokenProvider`, `Notification`, `Recommendation`, `Resume`, `User.java`, `DataSeeder.java`, `org.springframework.data.jpa.domain.support.AuditingEntityListener`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Why does `UserRepository` connect `UserRepository` to `lombok.AllArgsConstructor`, `org.slf4j.Logger`, `org.springframework.security.core.Authentication`, `AuthServiceImpl.java`, `org.springframework.data.jpa.repository.JpaRepository`, `AdminController`, `NotificationService`, `DataSeeder.java`, `ResourceNotFoundException`, `User`, `RecommendationResponse`, `User.java`, `org.springframework.transaction.annotation.Transactional`, `NotificationServiceImpl`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Why does `ResourceNotFoundException` connect `ResourceNotFoundException` to `lombok.AllArgsConstructor`, `org.slf4j.Logger`, `org.springframework.security.core.Authentication`, `AuthServiceImpl.java`, `.submitAnswer`, `UserRepository`, `ApiErrorResponse`, `AdminController`, `NotificationService`, `RecommendationResponse`, `org.springframework.transaction.annotation.Transactional`, `org.springframework.http.ResponseEntity`, `NotificationServiceImpl`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **What connects `Config`, `builds`, `routes` to the rest of the system?**
  _129 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `resume_router.py` be split into smaller, more focused modules?**
  _Cohesion score 0.06639839034205232 - nodes in this community are weakly interconnected._
- **Should `App.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07122153209109731 - nodes in this community are weakly interconnected._
- **Should `lombok.AllArgsConstructor` be split into smaller, more focused modules?**
  _Cohesion score 0.09626216077828981 - nodes in this community are weakly interconnected._