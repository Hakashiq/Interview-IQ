# InterviewIQ — Backend Engineering Study Guide

> **Repository Analyzed:** `D:/antigravity/interview-iq`  
> **Primary Backend Module:** `backend/` (`com.interviewiq:interview-iq-backend`, Java 21, Spring Boot 3.3.5, MySQL 8.0)  
> **Companion AI Microservice:** `ai-service/` (Python 3.12, FastAPI 0.115.0, Google Gemini 2.0 Flash + Local Heuristic Fallbacks)  
> **Gateway & Orchestration:** `nginx/nginx.conf`, `docker-compose.yml`, `render.yaml`

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Project Architecture Overview](#2-project-architecture-overview)
3. [Backend Technology Stack and Rationale](#3-backend-technology-stack-and-rationale)
4. [Backend Concept Inventory](#4-backend-concept-inventory)
5. [Core Backend Concepts Explained](#5-core-backend-concepts-explained)
   - [5.1 Layered Architecture, Dependency Injection, and the Spring IoC Container](#51-layered-architecture-dependency-injection-and-the-spring-ioc-container)
   - [5.2 Spring Boot Auto-Configuration, Externalized Properties, and Custom Bean Overrides](#52-spring-boot-auto-configuration-externalized-properties-and-custom-bean-overrides)
   - [5.3 REST API Design, HTTP Semantics, and Multipart File Handling](#53-rest-api-design-http-semantics-and-multipart-file-handling)
   - [5.4 DTO Pattern, Jackson Serialization, and Jakarta Bean Validation](#54-dto-pattern-jackson-serialization-and-jakarta-bean-validation)
   - [5.5 Centralized Exception Handling (`@RestControllerAdvice`) vs. Filter-Level Error Handling](#55-centralized-exception-handling-restcontrolleradvice-vs-filter-level-error-handling)
   - [5.6 Relational Data Modeling, JPA/Hibernate ORM, Fetch Strategies, and Auditing](#56-relational-data-modeling-jpahibernate-orm-fetch-strategies-and-auditing)
   - [5.7 Spring Data JPA Repositories, Derived Queries, JPQL `@Modifying`, and the N+1 Problem](#57-spring-data-jpa-repositories-derived-queries-jpql-modifying-and-the-n1-problem)
   - [5.8 Transaction Management (`@Transactional`), ACID Guarantees, and Connection Pool Starvation](#58-transaction-management-transactional-acid-guarantees-and-connection-pool-starvation)
   - [5.9 Stateless Authentication, Spring Security Filter Chain, and Dual-Token JWT Architecture](#59-stateless-authentication-spring-security-filter-chain-and-dual-token-jwt-architecture)
   - [5.10 Synchronous Microservice Integration (`RestTemplate`) and Graceful Degradation](#510-synchronous-microservice-integration-resttemplate-and-graceful-degradation)
   - [5.11 Java 21 Virtual Threads, Scheduled Background Jobs (`@Scheduled`), and Concurrency](#511-java-21-virtual-threads-scheduled-background-jobs-scheduled-and-concurrency)
   - [5.12 Configured-Only Infrastructure: Redis Caching, STOMP WebSockets, and Startup Seeding](#512-configured-only-infrastructure-redis-caching-stomp-websockets-and-startup-seeding)
6. [End-to-End Request Flows](#6-end-to-end-request-flows)
   - [6.1 User Registration, Authentication, and Refresh Token Rotation](#61-user-registration-authentication-and-refresh-token-rotation)
   - [6.2 Resume Upload, AI Parsing/Scoring, and Skill Extraction](#62-resume-upload-ai-parsingscoring-and-skill-extraction)
   - [6.3 Adaptive Interview Session Lifecycle (Start, Next Question, Submit Answer, Complete)](#63-adaptive-interview-session-lifecycle-start-next-question-submit-answer-complete)
   - [6.4 Personalized Recommendation Generation (and Its Contract Failure Path)](#64-personalized-recommendation-generation-and-its-contract-failure-path)
7. [Database and Data Consistency Analysis](#7-database-and-data-consistency-analysis)
8. [Security Analysis](#8-security-analysis)
9. [Performance and Scalability Analysis](#9-performance-and-scalability-analysis)
10. [Architectural Risks and Code Review Findings](#10-architectural-risks-and-code-review-findings)
11. [Recommended Improvements and Priorities](#11-recommended-improvements-and-priorities)
12. [Learning Prerequisites and Study Roadmap](#12-learning-prerequisites-and-study-roadmap)
13. [Hands-On Exercises](#13-hands-on-exercises)
14. [Project-Specific Interview Questions and Answer Outlines](#14-project-specific-interview-questions-and-answer-outlines)
15. [Knowledge Verification Checklist](#15-knowledge-verification-checklist)
16. [Glossary of Important Terms](#16-glossary-of-important-terms)
17. [Final Engineering Assessment](#17-final-engineering-assessment)

---

## 1. Executive Summary

**InterviewIQ** is a full-stack AI-assisted technical mock interview and resume intelligence platform. Its backend is split across two cooperating services:

1. **Core Domain & Transaction Service (`backend/`)**: A **Java 21** and **Spring Boot 3.3.5** application backed by **MySQL 8.0**. It owns user identity, role-based access control (RBAC), JWT access/refresh token lifecycles, file uploads (resumes, avatars, ID cards), the interview state machine (`SCHEDULED` → `IN_PROGRESS` → `COMPLETED`), question-bank management, scheduled reminder notifications, and administrative moderation.
2. **AI Orchestration Service (`ai-service/`)**: A **Python 3.12** and **FastAPI 0.115.0** microservice that handles binary document extraction (`PyMuPDF` for PDFs, `python-docx` for Word documents) and prompts **Google Gemini 2.0 Flash** (`google-generativeai`) for structured resume extraction, 5-dimensional ATS scoring, dynamic question generation, rubric-based answer evaluation, and study roadmap synthesis—backed by deterministic local regex/token-overlap fallbacks when the Gemini API key is absent or rate-limited.

### Source-of-Truth Audit: Reality vs. Documentation

A critical skill for any senior backend engineer is distinguishing between **what documentation claims** and **what the executable source code actually does**. Inspecting all 85 Java source files in `backend/src/main/java/com/interviewiq/` and all Python modules in `ai-service/` reveals several important divergences from `README.md`, `STUDY_GUIDE.md`, and `interview_preparation_guide.md`:

| Feature / Claim in Docs | Actual Source Code Reality | Status | Evidence |
| :--- | :--- | :--- | :--- |
| **Redis Caching (`@Cacheable`)** for `questions`, `dashboard`, and `leaderboard` | `RedisConfig.java` defines `RedisTemplate` and `RedisCacheManager` beans, and `@EnableCaching` is present. However, **`@Cacheable`, `@CachePut`, `@CacheEvict`, and `RedisTemplate` are never used on any method or class** in the codebase. Furthermore, `application.yml:35-36` sets `spring.cache.type: simple`. | **Configured Only** (Not used in business logic) | [`RedisConfig.java`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/config/RedisConfig.java#L18-L52), [`application.yml`](file:///D:/antigravity/interview-iq/backend/src/main/resources/application.yml#L35-L36), [`QuestionServiceImpl.java`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/service/impl/QuestionServiceImpl.java#L32-L60) |
| **WebSockets (`/ws/interview`)** for real-time interview telemetry | `WebSocketConfig.java` registers STOMP over SockJS at `/ws/interview` with `/topic` and `/queue` brokers, and `SecurityConfig.java:42` permits `/ws/**`. However, **there are zero `@MessageMapping` methods and zero `SimpMessagingTemplate` usages** anywhere in `backend/`. | **Configured Only** (No active handlers/publishers) | [`WebSocketConfig.java`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/config/WebSocketConfig.java#L9-L25) |
| **Personalized AI Study Roadmap** (`POST /api/recommendations/generate`) | `ai-service` returns JSON keys `dsa_topics`, `interview_topics`, and `weekly_roadmap` ([`schemas.py:94-98`](file:///D:/antigravity/interview-iq/ai-service/models/schemas.py#L94-L98)). `RecommendationServiceImpl.java:103-106` looks for keys `type`, `content`, and `roadmap`. Because the keys do not match, **every recommendation silently saves fallback default strings and `roadmap = null`**. | **Partially Implemented / Buggy Contract** | [`RecommendationServiceImpl.java`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/service/impl/RecommendationServiceImpl.java#L99-L115), [`recommendation_router.py`](file:///D:/antigravity/interview-iq/ai-service/routers/recommendation_router.py#L26-L72) |
| **Speech/Transcript Fluency Evaluation** (`Interview.communicationAnalysis`, `Answer.transcript`) | FastAPI implements `POST /ai/answers/communication` ([`evaluation_router.py:293`](file:///D:/antigravity/interview-iq/ai-service/routers/evaluation_router.py#L293)), and `Interview.java:46` / `Answer.java:31-35` have database columns for `communication_analysis`, `audio_path`, and `transcript`. However, **`AIClientService` never calls `/ai/answers/communication`**, and `SubmitAnswerRequest` only accepts `answerText` and `timeTakenSeconds`. | **Partially Implemented** (AI route & DB columns exist; Java bridge missing) | [`Interview.java`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/entity/Interview.java#L46-L47), [`Answer.java`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/entity/Answer.java#L31-L35), [`SubmitAnswerRequest.java`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/dto/request/SubmitAnswerRequest.java#L7-L14) |
| **Admin Dynamic AI Config, Prompts & Templates** (`SystemConfig`, `AdminPrompt`, `InterviewTemplate`) | Seeded in `DataSeeder.java` and CRUD-exposed in `AdminController.java`, but **never read by `InterviewServiceImpl`, `ResumeServiceImpl`, or `AIClientServiceImpl`**. AI prompts and model names (`gemini-2.0-flash`) are hardcoded in Python. | **Partially Implemented** (Persisted for Admin UI only) | [`AdminController.java`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/controller/AdminController.java#L297-L347), [`config.py`](file:///D:/antigravity/interview-iq/ai-service/config.py#L25) |
| **Normalized Student Skills Table** (`student_skills`) | `StudentSkill.java` and `StudentSkillRepository.java` exist, and `User.java:108` maps `studentSkills`. However, **`StudentSkillRepository` is never injected anywhere**. Skills are instead linked to `Resume` via the `resume_skills` join table. | **Planned / Unused Entity** | [`StudentSkill.java`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/entity/StudentSkill.java#L1-L28), [`Resume.java`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/entity/Resume.java#L61-L68) |
| **SQL Seed Script (`src/main/resources/data.sql`)** & **Health Endpoint (`/api/health`)** | Mentioned in `README.md:152` and `README.md:264`, but **neither `data.sql` nor `/api/health` exists** in `backend/`. Seeding is done in `DataSeeder.java`. | **Documentation Drift** | [`DataSeeder.java`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/config/DataSeeder.java#L32-L44) |
| **Automated Unit / Integration Tests** | `spring-boot-starter-test` and `spring-security-test` are declared in `pom.xml:98-107`, but **`backend/src/test/` does not exist**. | **Configured Dependency Only** | [`pom.xml`](file:///D:/antigravity/interview-iq/backend/pom.xml#L98-L107) |

---

## 2. Project Architecture Overview

### 2.1 System-Level Topology

In Docker Compose ([`docker-compose.yml`](file:///D:/antigravity/interview-iq/docker-compose.yml)), InterviewIQ runs as five containers on a shared bridge network (`interviewiq-net`), fronted by an **Nginx reverse proxy** ([`nginx/nginx.conf`](file:///D:/antigravity/interview-iq/nginx/nginx.conf)) listening on port `80`:

```mermaid
flowchart TD
    subgraph Client["Client Tier (Browser)"]
        SPA["React 19 SPA"]
        MP["MediaPipe FaceLandmarker (WASM)<br/>Web Speech API (TTS/STT)"]
        SPA --- MP
    end

    subgraph Gateway["Gateway Tier (:80)"]
        Nginx["Nginx Reverse Proxy<br/>(client_max_body_size 10M)"]
    end

    subgraph BackendTier["Application Tier"]
        SB["Spring Boot 3.3.5 Backend (:8080)<br/>Java 21 • Virtual Threads • HikariCP (20)"]
        FastAPI["FastAPI AI Service (:8000)<br/>Python 3.12 • PyMuPDF • python-docx"]
    end

    subgraph DataTier["Persistence & External Tier"]
        MySQL[("MySQL 8.0 (:3306)<br/>20 JPA Entities / 22 Tables")]
        Disk[("Local Filesystem (./uploads)<br/>resumes/, avatars/, id_cards/")]
        Redis[("Redis 7 (:6379)<br/>Configured, 0 Active Calls")]
        Gemini["Google Gemini 2.0 Flash API<br/>(HTTPS External)"]
    end

    SPA -->|"HTTP /api/*, /ws/*"| Nginx
    Nginx -->|"proxy_pass /api/*, /ws/*"| SB
    Nginx -->|"proxy_pass /ai/* (120s timeout)"| FastAPI
    Nginx -->|"proxy_pass /*"| SPA

    SB -->|"JDBC / Spring Data JPA"| MySQL
    SB -->|"java.nio.file.Files"| Disk
    SB -.->|"Auto-configured bean only<br/>(No @Cacheable / RedisTemplate calls)"| Redis
    SB -->|"RestTemplate (10s conn / 60s read)<br/>/ai/resume/*, /ai/questions/*, /ai/answers/*, /ai/recommendations/*"| FastAPI
    FastAPI -->|"google-generativeai SDK<br/>(Falls back to local heuristics)"| Gemini
```

### 2.2 Internal Package Structure of `backend/`

All Java source code resides under `backend/src/main/java/com/interviewiq/` (85 files across 9 packages):

```text
com.interviewiq
├── InterviewIqApplication.java       # @SpringBootApplication, @EnableCaching, @EnableJpaAuditing, @EnableScheduling
├── config/                           # 8 infrastructure configuration & startup classes
│   ├── CorsConfig.java               # WebMvcConfigurer global CORS policy
│   ├── DataSeeder.java               # CommandLineRunner seeding roles, users, skills, categories, 48 questions, configs
│   ├── DataSourceConfig.java         # @Primary HikariDataSource normalizing mysql:// URIs into jdbc:mysql://
│   ├── NotificationScheduler.java    # @Scheduled(cron = "0 * * * * *") 30-minute upcoming interview alert job
│   ├── RedisConfig.java              # RedisTemplate & RedisCacheManager beans (configured but uninvoked)
│   ├── RestTemplateConfig.java       # RestTemplate bean (10s connect, 60s read timeout)
│   ├── SecurityConfig.java           # SecurityFilterChain, BCryptPasswordEncoder, AuthenticationManager
│   └── WebSocketConfig.java          # STOMP /ws/interview endpoint & in-memory broker (configured but uninvoked)
├── controller/                       # 8 REST controllers (@RestController)
│   ├── AdminController.java          # /api/admin/** (Users, bans, roles, stats, configs, templates, prompts, logs, violations)
│   ├── AuthController.java           # /api/auth/** (register, login, refresh, logout, change-password, id-card upload/view)
│   ├── InterviewController.java      # /api/interviews/** (start, schedule, next-question, submit-answer, complete, results, history)
│   ├── NotificationController.java   # /api/notifications/** (list, mark read, read-all, unread-count)
│   ├── QuestionController.java       # /api/questions, /api/categories
│   ├── RecommendationController.java # /api/recommendations, /api/recommendations/generate
│   ├── ResumeController.java         # /api/resumes/** (upload, latest, {id}, {id}/skills)
│   └── UserController.java           # /api/users/** (penalty, profile GET/PUT, avatar upload/view, import-resume)
├── dto/
│   ├── request/                      # 7 inbound DTOs with Jakarta Bean Validation annotations
│   └── response/                     # 15 outbound DTOs shaping JSON responses
├── entity/                           # 20 JPA @Entity classes mapped to MySQL tables
├── exception/                        # GlobalExceptionHandler (@RestControllerAdvice) + 3 custom RuntimeExceptions
├── repository/                       # 20 Spring Data JPA @Repository interfaces
├── security/                         # JwtAuthenticationFilter, JwtTokenProvider, CustomUserDetailsService, AuthEntryPoint
└── service/                          # 7 Service interfaces + 7 implementations in service/impl/
```

### 2.3 Architectural Pattern: Partial 3-Layer Architecture

The project is designed around a **3-Layer Architecture** (**Controller → Service → Repository**), but inspection shows **two distinct implementation styles** coexisting in the codebase:

1. **Strict Service-Mediated Domains (`Auth`, `Interview`, `Resume`, `Question`, `Recommendation`, `Notification`)**:
   - Controllers accept DTOs/requests, delegate business logic and transactions to a `@Service` implementation (`AuthServiceImpl`, `InterviewServiceImpl`, etc.), and return Response DTOs.
   - *Minor Layer Leak*: `InterviewController`, `ResumeController`, `RecommendationController`, and `NotificationController` each inject `UserRepository` directly to execute `userRepository.findByEmail(authentication.getName())` inside a private `getCurrentUserId(Authentication)` helper method before calling the service.
2. **Direct Controller-to-Repository Domains (`AdminController`, `UserController`)**:
   - Neither `AdminService` nor `UserService` exists.
   - [`AdminController`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/controller/AdminController.java#L23-L57) injects **10 JPA Repositories** directly, accepts raw `Map<String, String>` or `@Entity` objects (`InterviewTemplate`, `AdminPrompt`, `Violation`, `UserFeedback`) as `@RequestBody`, and executes multi-step writes without `@Transactional`.
   - [`UserController`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/controller/UserController.java#L37-L48) injects `UserRepository`, `ResumeRepository`, and `ObjectMapper` directly, containing 100+ lines of regex and JSON resume-importing business logic inside the controller method [`importFromLatestResume()`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/controller/UserController.java#L152-L259).

---

## 3. Backend Technology Stack and Rationale

Every dependency below is verified directly from [`backend/pom.xml`](file:///D:/antigravity/interview-iq/backend/pom.xml) and [`ai-service/requirements.txt`](file:///D:/antigravity/interview-iq/ai-service/requirements.txt):

| Dependency / Technology | Version | Scope / Tier | Actual Usage in Codebase | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Java (`java.version`)** | `21` | Backend Runtime | Virtual threads (`spring.threads.virtual.enabled: true`), `var`, `List.of()`, `Set.of()`, `Map.of()`, switch/stream APIs. | **Implemented** |
| **`spring-boot-starter-parent`** | `3.3.5` | Maven Parent | Manages BOM versions, compiler configuration, and default plugin configurations. (Note: `spring-boot-maven-plugin` is overridden to `3.2.5` at `pom.xml:144`). | **Implemented** |
| **`spring-boot-starter-web`** | `3.3.5` | Backend Web | Embedded Apache Tomcat, `DispatcherServlet`, `@RestController`, `RestTemplate`, Jackson JSON serialization, multipart file uploads. | **Implemented** |
| **`spring-boot-starter-data-jpa`** | `3.3.5` | Persistence | Hibernate ORM 6.5, HikariCP connection pool, `JpaRepository` proxies, `@Transactional`, `@EnableJpaAuditing`. | **Implemented** |
| **`spring-boot-starter-security`** | `3.3.5` | Security | `SecurityFilterChain`, `OncePerRequestFilter`, `@EnableMethodSecurity` (`@PreAuthorize`), `BCryptPasswordEncoder`, `DaoAuthenticationProvider`. | **Implemented** |
| **`spring-boot-starter-validation`** | `3.3.5` | Validation | Hibernate Validator implementation of Jakarta Bean Validation (`@Valid`, `@NotBlank`, `@Email`, `@Size`, `@Pattern`, `@NotNull`). | **Implemented** |
| **`mysql-connector-j`** | Managed (`8.3.x`) | Runtime JDBC | MySQL JDBC driver (`com.mysql.cj.jdbc.Driver`) configured in `application.yml:12` and `DataSourceConfig.java:29`. | **Implemented** |
| **`io.jsonwebtoken` (`jjwt-api`, `jjwt-impl`, `jjwt-jackson`)** | `0.12.6` | Security (JWT) | Signing (`Jwts.builder().signWith(...)`) and verifying (`Jwts.parser().verifyWith(...)`) HMAC-SHA JWT access tokens in `JwtTokenProvider.java`. | **Implemented** |
| **`org.projectlombok:lombok`** | `1.18.38` | Compile / Annotation Processor | Generates boilerplate (`@Data`, `@Getter`, `@Setter`, `@Builder`, `@NoArgsConstructor`, `@AllArgsConstructor`, `@RequiredArgsConstructor`). | **Implemented** |
| **`springdoc-openapi-starter-webmvc-ui`** | `2.6.0` | API Docs | Auto-generates OpenAPI 3 specification (`/v3/api-docs/**`) and Swagger UI (`/swagger-ui/**`), permitted in `SecurityConfig.java:43`. | **Configured** (No custom `@Operation` annotations) |
| **`spring-boot-starter-data-redis` & `spring-boot-starter-cache`** | `3.3.5` | Caching | Configures `RedisTemplate` and `RedisCacheManager` in `RedisConfig.java`, but **no `@Cacheable` or `RedisTemplate` calls exist**. | **Configured Only** |
| **`spring-boot-starter-websocket`** | `3.3.5` | Messaging | Configures STOMP endpoint `/ws/interview` in `WebSocketConfig.java`, but **no message handlers or senders exist**. | **Configured Only** |
| **`spring-boot-starter-test` & `spring-security-test`** | `3.3.5` | Test | Declared in `pom.xml:98-107`, and `Dockerfile:7` runs `mvn clean package -DskipTests`. **No test classes exist in `backend/src/test`**. | **Unused Dependency** |
| **FastAPI + Uvicorn + Pydantic** | `0.115.0` / `0.30.0` | AI Microservice | Hosts `/ai/resume/*`, `/ai/questions/*`, `/ai/answers/*`, and `/ai/recommendations/*` REST endpoints called by `AIClientServiceImpl`. | **Implemented** |
| **`PyMuPDF` (`fitz`) & `python-docx`** | `1.24.0` / `1.1.0` | AI Microservice | Extracts raw text from Base64-encoded `.pdf` and `.docx` resume bytes in `ai-service/routers/resume_router.py:29-43`. | **Implemented** |
| **`google-generativeai`** | `0.8.0` | AI Microservice | Invokes `gemini-2.0-flash` in `ai-service/config.py:25` for parsing, scoring, question generation, evaluation, and recommendations. | **Implemented** |
| **`spacy` & `httpx`** | `3.7.0` / `0.27.0` | AI Microservice | Listed in `ai-service/requirements.txt:8-10`, **but never imported in any Python file in `ai-service/`** (heuristic fallbacks use Python `re` and `set` operations instead). | **Unused Dependency** |

---

## 4. Backend Concept Inventory

The table below catalogs every significant backend engineering concept discovered in `InterviewIQ`, ordered by priority for understanding, debugging, and scaling the system.

| # | Concept Name | Category | Where Used in Codebase | Relevant Class / Method / Config | Purpose in This Project | Status | Priority |
| :- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | **3-Layer Architecture & Separation of Concerns** | Architecture | `controller/`, `service/`, `repository/` | `InterviewController` → `InterviewServiceImpl` → `InterviewRepository` (vs. `AdminController` direct repo access) | Separates HTTP transport, transactional business rules, and data persistence. | **Partially Implemented** (Bypassed in `AdminController` & `UserController`) | **P0** |
| 2 | **Dependency Injection (DI) & IoC Container** | Spring Core | All `@RestController`, `@Service`, `@Component`, `@Configuration` classes | Constructor injection in `InterviewServiceImpl`, `@RequiredArgsConstructor` in `DataSeeder` | Decouples component construction and manages singleton bean lifecycles. | **Implemented** | **P0** |
| 3 | **Spring Boot Auto-Configuration & Custom `@Bean` Overrides** | Spring Boot | `InterviewIqApplication.java`, `config/*`, `application.yml` | `@SpringBootApplication`, `DataSourceConfig.dataSource()` (`@Primary`), `RestTemplateConfig` | Bootstraps Tomcat, JPA, Security, and overrides default `DataSource` to parse `mysql://` cloud URIs. | **Implemented** | **P0** |
| 4 | **REST API Design & HTTP Semantics** | Web / API | `controller/*.java` (8 controllers, 43 endpoints) | `@RestController`, `@GetMapping`, `@PostMapping`, `@PutMapping`, `@DeleteMapping`, `ResponseEntity` | Exposes resource-oriented JSON & multipart endpoints with HTTP status codes (`200`, `201`, `400`, `401`, `404`). | **Implemented** | **P0** |
| 5 | **DTO Pattern & Jackson JSON Serialization** | Data Transfer & Serialization | `dto/request/*`, `dto/response/*`, `UserController`, `ResumeServiceImpl` | `StartInterviewRequest`, `InterviewResultsResponse`, `ApiErrorResponse` (`@JsonInclude`), `ObjectMapper` | Decouples public API contracts from internal JPA database entities and serializes/deserializes JSON. | **Partially Implemented** (`AdminController` exposes raw entities) | **P0** |
| 6 | **Declarative Input Validation (Jakarta Bean Validation)** | Validation | `dto/request/*.java`, `AuthController`, `InterviewController` | `@Valid`, `@NotBlank`, `@Email`, `@Size`, `@Pattern`, `@NotNull` | Validates incoming JSON payloads before controller execution; enforces password complexity regex. | **Partially Implemented** (Missing on `UserController.updateProfile` & `AdminController`) | **P0** |
| 7 | **Centralized Exception Handling (`@RestControllerAdvice`)** | Error Handling | `exception/GlobalExceptionHandler.java`, `exception/*.java` | `GlobalExceptionHandler`, `ResourceNotFoundException`, `BadRequestException`, `UnauthorizedException` | Translates Java exceptions into structured `ApiErrorResponse` JSON payloads with appropriate HTTP codes. | **Implemented** | **P0** |
| 8 | **JPA Entity Mapping & Relational Schema Design** | ORM & Database | `entity/*.java` (20 entities) | `User`, `Interview`, `InterviewQuestion`, `Question`, `Answer`, `Feedback`, `Resume`, `Skill` | Maps Java domain objects to 22 MySQL tables (20 entities + 2 join tables) with `ddl-auto: update`. | **Implemented** | **P0** |
| 9 | **JPA Entity Relationships, Fetch Types & Cascading** | ORM & Database | `User.java`, `Interview.java`, `InterviewQuestion.java`, `Answer.java`, `Resume.java` | `@ManyToOne(LAZY)`, `@ManyToMany(EAGER)` on `User.roles`, `@OneToMany(cascade = ALL, orphanRemoval = true)` | Models 1:1, 1:N, and M:N associations; controls lazy proxy loading (`open-in-view: false`) and child deletion. | **Implemented** | **P0** |
| 10 | **Spring Data JPA Repositories & Derived Query Methods** | Data Access | `repository/*.java` (20 interfaces) | `JpaRepository`, `findByCategoryNameInAndDifficulty`, `findByTokenAndRevokedFalse` | Generates SQL queries automatically from method names and provides CRUD operations via JDK dynamic proxies. | **Implemented** | **P0** |
| 11 | **Custom JPQL Bulk Updates (`@Modifying` & `@Query`)** | Data Access | `repository/RefreshTokenRepository.java` | `RefreshTokenRepository.revokeAllByUserId(Long userId)` | Executes a single bulk `UPDATE refresh_tokens SET revoked = true` statement upon password change. | **Implemented** | **P1** |
| 12 | **Declarative Transaction Management (`@Transactional`)** | Transactions & Consistency | `service/impl/*.java`, `CustomUserDetailsService`, `DataSeeder`, `NotificationScheduler` | `@Transactional` on write methods, `@Transactional(readOnly = true)` on read queries | Guarantees atomic database operations and manages Hibernate persistence context lifecycles. | **Partially Implemented** (Missing in `AdminController`; wraps slow HTTP calls) | **P0** |
| 13 | **Connection Pooling (HikariCP)** | Database Performance | `application.yml:13-17`, `config/DataSourceConfig.java:100-105` | `HikariConfig` (`maximumPoolSize=20`, `minimumIdle=5`, `connectionTimeout=20000`) | Maintains a bounded pool of reusable TCP connections to MySQL to avoid per-request handshake overhead. | **Implemented** | **P0** |
| 14 | **Spring Security Filter Chain & Stateless Session Policy** | Security | `config/SecurityConfig.java`, `security/AuthEntryPoint.java` | `SecurityFilterChain`, `SessionCreationPolicy.STATELESS`, `CSRF disable`, `AuthEntryPoint` | Enforces stateless HTTP authentication, route-based authorization rules, and `401` JSON responses. | **Implemented** | **P0** |
| 15 | **Stateless JWT Authentication & JJWT Cryptographic Signing** | Security | `security/JwtAuthenticationFilter.java`, `security/JwtTokenProvider.java` | `OncePerRequestFilter`, `Jwts.builder().signWith(...)`, `Decoders.BASE64`, `Keys.hmacShaKeyFor` | Issues and validates signed Bearer access tokens (24h TTL) on every protected HTTP request. | **Implemented** | **P0** |
| 16 | **Stateful Opaque Refresh Tokens & Token Revocation** | Security | `entity/RefreshToken.java`, `service/impl/AuthServiceImpl.java` | `RefreshToken`, `AuthServiceImpl.refreshToken()`, `AuthServiceImpl.logout()`, `revokeAllByUserId()` | Persists 7-day UUID refresh tokens in MySQL to allow session revocation on logout or password change. | **Implemented** | **P1** |
| 17 | **Password Hashing with BCrypt (`BCryptPasswordEncoder`)** | Security | `config/SecurityConfig.java:59-61`, `AuthServiceImpl`, `AdminController`, `DataSeeder` | `PasswordEncoder` (`BCryptPasswordEncoder`) | Salted adaptive one-way hashing of user passwords before database storage. | **Implemented** | **P0** |
| 18 | **Method-Level Security (`@EnableMethodSecurity` & `@PreAuthorize`)** | Security | `config/SecurityConfig.java:22`, `controller/AdminController.java:20,60,183...` | `@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_MENTOR')")` | Restricts controller methods by authority (though conflicted by `SecurityConfig` filter rules). | **Partially Implemented** (Conflicted by `SecurityConfig.java:45`) | **P0** |
| 19 | **Account Lockout / Temporary Suspension (`bannedUntil`)** | Security / Domain | `User.java:65`, `CustomUserDetailsService.java:34`, `AuthServiceImpl.java:102`, `InterviewServiceImpl.java:97`, `UserController.java:51` | `isAccountNonLocked` check in `UserDetails` + explicit `bannedUntil.isAfter(now)` checks | Suspends accounts for 24 hours when proctoring penalties or admin bans are triggered. | **Implemented** | **P1** |
| 20 | **Synchronous Inter-Service HTTP Client (`RestTemplate`)** | External Integration | `config/RestTemplateConfig.java`, `service/impl/AIClientServiceImpl.java` | `RestTemplate.exchange(...)`, `ParameterizedTypeReference`, `SimpleClientHttpRequestFactory` | Connects the Spring Boot backend to the Python FastAPI AI microservice with 10s connect / 60s read timeouts. | **Implemented** | **P0** |
| 21 | **Multi-Tier Graceful Degradation / Fallback Pattern** | Resilience | `AIClientServiceImpl.java`, `InterviewServiceImpl.java:468-479`, `ResumeServiceImpl.java:190-200`, `ai-service/routers/*.py` | `catch (RestClientException)` returning empty collections + DB question fallback + Python heuristic scorers | Keeps interviews and resume uploads working even when Gemini API or the Python AI service fails. | **Implemented** | **P1** |
| 22 | **Multipart File Upload & Local Filesystem Storage** | I/O & Storage | `ResumeServiceImpl.java:62-92`, `UserController.java:88-150`, `AuthController.java:77-137` | `MultipartFile`, `Files.copy`, `UUID.randomUUID()`, `UrlResource` | Stores uploaded resumes, profile avatars, and student ID cards on local disk (`./uploads/`) and serves images. | **Implemented** | **P1** |
| 23 | **Java 21 Virtual Threads (Project Loom)** | Concurrency | `application.yml:43-45` | `spring.threads.virtual.enabled: true` | Configures Tomcat and Spring task executors to run each request on a lightweight virtual thread instead of an OS platform thread. | **Implemented / Configured** | **P1** |
| 24 | **Scheduled Background Tasks (`@EnableScheduling` & `@Scheduled`)** | Background Jobs | `InterviewIqApplication.java:12`, `config/NotificationScheduler.java:29-57` | `@Scheduled(cron = "0 * * * * *")`, `sendUpcomingInterviewAlerts()` | Polls MySQL every minute for `SCHEDULED` interviews starting within 30 minutes and creates `Notification` rows. | **Implemented** | **P1** |
| 25 | **JPA Entity Auditing (`@EnableJpaAuditing` & `@CreatedDate`)** | ORM & Observability | `InterviewIqApplication.java:11`, `User`, `Interview`, `Answer`, `Resume`, `Notification`, `Recommendation`, `RefreshToken` | `@EntityListeners(AuditingEntityListener.class)`, `@CreatedDate`, `@LastModifiedDate` | Automatically populates creation and modification timestamps during Hibernate `INSERT` and `UPDATE` lifecycle events. | **Implemented** | **P2** |
| 26 | **Cross-Origin Resource Sharing (CORS) & Reverse Proxy Routing** | Networking & Security | `config/CorsConfig.java`, `nginx/nginx.conf` | `WebMvcConfigurer.addCorsMappings`, `allowedOriginPatterns`, Nginx `location /api/`, `/ai/`, `/ws/` | Controls cross-origin browser access during standalone dev and unifies origins behind Nginx in Docker. | **Implemented** | **P1** |
| 27 | **Database Seeding (`CommandLineRunner` & `EntityManager`)** | Startup / Data | `config/DataSeeder.java` | `DataSeeder.run(String... args)` | Seeds 7 roles, 3 default users, 26 skills, 14 categories, 48 questions, 9 configs, 3 templates, and sample logs on startup. | **Implemented** | **P2** |
| 28 | **Redis Cache & STOMP WebSocket Brokers** | Infrastructure | `config/RedisConfig.java`, `config/WebSocketConfig.java`, `application.yml:29-36` | `RedisCacheManager`, `RedisTemplate`, `@EnableWebSocketMessageBroker` | Infrastructure beans wired for caching and real-time messaging, but not invoked by any service or controller. | **Configured Only** | **P2** |

---

## 5. Core Backend Concepts Explained

In this section, we dissect the 12 core architectural and engineering pillars of InterviewIQ using a rigorous production engineering framework: **Problem → Why This → Why Not Alternatives → What Breaks First → What Changes at 10× Scale → Actual Code → Practical Improvements → Testing/Debugging → Key Takeaways**.

---

### 5.1 Layered Architecture, Dependency Injection, and the Spring IoC Container

#### Problem Being Solved
When building a backend web application, a single HTTP request ("submit my interview answer") requires multiple distinct kinds of work:
1. **HTTP Transport**: Reading TCP bytes, parsing HTTP headers, deserializing a JSON body, and formatting an HTTP status code (`200 OK` or `400 Bad Request`).
2. **Business Rules**: Verifying that the user owns the interview, checking that the interview is not already `COMPLETED`, ensuring the question has not already been answered, calling the AI evaluator, and marking the question `ANSWERED`.
3. **Data Persistence**: Opening a database connection, executing `SELECT`, `INSERT`, and `UPDATE` SQL statements, and mapping result rows to Java objects.

If you write all three responsibilities inside a single class—or if every class manually constructs its collaborators using `new InterviewServiceImpl(new InterviewRepository(), ...)`—you create a **tightly coupled monolith**:
- Changing how files or AI calls work forces you to edit HTTP controller code.
- Business rules cannot be reused across different entry points (e.g., both `NotificationController` and the background `NotificationScheduler` need notification logic).
- Unit testing business logic becomes impossible without spinning up a live MySQL database and HTTP server, because `new` hardcodes the concrete dependencies.

*Real-World Analogy*: Think of a commercial restaurant. The **Waiter (Controller)** takes the customer's order, validates that the dish is on the menu, and delivers the plated meal. The **Chef (Service)** orchestrates the recipe and cooking steps. The **Pantry/Freezer Manager (Repository)** fetches raw ingredients from storage. If the waiter walks into the kitchen, opens the freezer, and cooks the meal while also taking orders at the front door, chaos ensues. Furthermore, the Chef shouldn't have to build their own stove (`new Stove()`); the restaurant kitchen (**Spring IoC Container**) provides a pre-configured stove to the Chef at startup (**Dependency Injection**).

#### Why This Approach?
InterviewIQ uses Spring's **Inversion of Control (IoC) Container** (`ApplicationContext`) combined with a **3-Layer Stereotype Architecture**:
1. **Presentation / Transport Layer (`@RestController`)**: Classes in `com.interviewiq.controller` handle HTTP routing, extract the authenticated principal, validate request DTOs (`@Valid`), and return `ResponseEntity<T>`.
2. **Business Logic Layer (`@Service`)**: Interfaces in `com.interviewiq.service` and implementations in `com.interviewiq.service.impl` define transactional boundaries (`@Transactional`), enforce ownership and state-machine rules, coordinate multiple repositories, and call external services (`AIClientService`).
3. **Data Access Layer (`@Repository`)**: Interfaces in `com.interviewiq.repository` extend `JpaRepository<Entity, ID>` to perform database CRUD operations.

**How Spring Dependency Injection Works Internally Here:**
1. At startup (`SpringApplication.run(InterviewIqApplication.class, args)` in [`InterviewIqApplication.java:16`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/InterviewIqApplication.java#L16)), `@SpringBootApplication` triggers `@ComponentScan` across `com.interviewiq.**`.
2. Spring discovers all classes annotated with `@Component`, `@Service`, `@Repository`, `@RestController`, and `@Configuration`, plus `@Bean` methods.
3. Spring builds a **Directed Acyclic Graph (DAG)** of bean dependencies. For example, `InterviewController` requires `InterviewService` and `UserRepository`. `InterviewServiceImpl` (the sole implementation of `InterviewService`) requires 8 repositories and `AIClientService`. `AIClientServiceImpl` requires `RestTemplate` (from `RestTemplateConfig`).
4. Spring instantiates the leaf beans first (`RestTemplate`, JPA repository proxies), then passes them into the constructors of dependent beans (**Constructor Injection**). Notice that since Spring 4.3, a class with a single constructor (like [`InterviewServiceImpl.java:70-88`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/service/impl/InterviewServiceImpl.java#L70-L88)) does not even need an explicit `@Autowired` annotation! In [`DataSeeder.java:31`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/config/DataSeeder.java#L31), Lombok's `@RequiredArgsConstructor` generates that single constructor at compile time for all `private final` fields.
5. By default, every Spring bean is a **Singleton** scoped to the `ApplicationContext`: one instance of `InterviewController` and one instance of `InterviewServiceImpl` serve all concurrent HTTP requests. Because singletons are shared across all threads, they must be **stateless** (holding only `private final` references to other thread-safe beans or immutable constants like `JOB_ROLE_CATEGORIES`).

#### Why Not the Alternatives?

| Architectural / DI Approach | Complexity | Maintainability | Testability | Why Chosen / Why Not Used Here |
| :--- | :--- | :--- | :--- | :--- |
| **Constructor Injection + 3-Layer (Used in Core Domains)** | Low–Medium | High (explicit immutable `final` dependencies) | High (easy to pass mock objects into constructor in JUnit) | **Chosen for core domains** (`Auth`, `Interview`, `Resume`, `Question`, `Recommendation`, `Notification`). Fails fast at compile/startup time if a dependency is missing or circular. |
| **Field Injection (`@Autowired private Foo foo;`)** | Low | Low (hides dependencies, allows `null` in unit tests without reflection) | Poor | Avoided throughout the codebase in favor of constructor injection. |
| **Transaction Script in Controller (Used in `AdminController` & `UserController`)** | Very Low initially | Poor as logic grows (couples HTTP to DB and business rules) | Poor (must mock 10 repositories to test `AdminController`) | **Used in `AdminController` and `UserController`**, likely for rapid prototyping of admin/profile screens, at the cost of missing `@Transactional` boundaries and bloated controllers. |
| **Hexagonal / Clean / Ports-and-Adapters Architecture** | High (separate domain, application, and infrastructure models/mappers) | Very High for complex enterprise domains | Very High | Overkill for a CRUD + AI-orchestration application of this size (~20 entities); would triple the number of mapping classes. |

#### What Breaks First?

1. **Confirmed Architectural Flaw: Missing Service Layer & Missing `@Transactional` in `AdminController.deleteUser()`**
   - **Failure Scenario**: An admin calls `DELETE /api/admin/users/{id}` ([`AdminController.java:269-294`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/controller/AdminController.java#L269-L294)).
   - **Root Cause**: Because `AdminController` bypasses the service layer and has no `@Transactional` annotation, each repository call (`violationRepository.deleteAll(userViolations)`, `userRepository.delete(user)`, `auditLogRepository.save(...)`) runs in its own independent auto-committed database transaction! Worse, if a `Question` or other table has a foreign key without cascade, or if `userRepository.delete(user)` fails mid-flight after `violationRepository.deleteAll(...)` has already committed, the user's violation records are permanently deleted even though the user still exists!
2. **Confirmed Code Duplication: `getCurrentUserId(Authentication)` Repeated Across 4 Controllers**
   - **Failure Scenario**: Every request to `InterviewController`, `ResumeController`, `RecommendationController`, and `NotificationController` calls a private `getCurrentUserId(Authentication)` helper that queries `userRepository.findByEmail(email)`.
   - **Root Cause**: Because `JwtAuthenticationFilter` already calls `userDetailsService.loadUserByUsername(email)` (executing `SELECT * FROM users WHERE email = ?`) during filter execution, and then the controller immediately calls `userRepository.findByEmail(email)` again outside a shared transaction (`open-in-view: false`), **every authenticated API request executes two identical `SELECT` queries against the `users` table**!

#### What Changes at 10× Scale?
- *Workload Assumption*: Scaling from 50 concurrent users (~5 req/s) to 500 concurrent users (~50 req/s).
- **Singleton Statelessness Remains Adequate**: Because Spring controllers and services are singletons with zero per-request mutable fields, memory overhead from the beans themselves is negligible (< 5 MB).
- **Double `users` Lookup Overhead**: At 50 req/s, executing 2 `SELECT` queries on `users` (plus 1 on `user_roles`) per request generates 150 SQL queries/sec purely to identify who is making the request, before any business logic runs. Embedding the `userId` claim inside the JWT payload and storing a custom `UserPrincipal(Long id, String email, Collection<GrantedAuthority> authorities)` in `SecurityContextHolder` eliminates **100% of these database queries** on JWT-authenticated requests.

#### Actual Code References
Compare the clean Service-mediated design in [`InterviewController.java:30-37`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/controller/InterviewController.java#L30-L37) with the duplicated `getCurrentUserId` lookup at lines 102–107:

```java
// Actual Code: backend/src/main/java/com/interviewiq/controller/InterviewController.java (Lines 20-37, 102-107)
@RestController
@RequestMapping("/api/interviews")
public class InterviewController {

    private final InterviewService interviewService;
    private final UserRepository userRepository;

    public InterviewController(InterviewService interviewService, UserRepository userRepository) {
        this.interviewService = interviewService;
        this.userRepository = userRepository;
    }

    @PostMapping("/start")
    public ResponseEntity<InterviewResponse> startInterview(
            @Valid @RequestBody StartInterviewRequest request,
            Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        InterviewResponse response = interviewService.startInterview(request, userId);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
    // ...
    private Long getCurrentUserId(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return user.getId();
    }
}
```

#### Practical Example: Eliminating the Controller Repository Leak
If we store a custom `CustomUserPrincipal` in `CustomUserDetailsService` (or extract `userId` from the JWT), the controller no longer needs `UserRepository` at all:

```java
// Proposed Improvement (Illustrative): Custom principal holding the User ID
public record AppUserPrincipal(
        Long id,
        String email,
        String password,
        boolean enabled,
        boolean accountNonLocked,
        Collection<? extends GrantedAuthority> authorities
) implements UserDetails {
    @Override public String getUsername() { return email; }
    @Override public String getPassword() { return password; }
    @Override public boolean isEnabled() { return enabled; }
    @Override public boolean isAccountNonLocked() { return accountNonLocked; }
    @Override public Collection<? extends GrantedAuthority> getAuthorities() { return authorities; }
}

// In InterviewController: zero extra DB query!
@PostMapping("/start")
public ResponseEntity<InterviewResponse> startInterview(
        @Valid @RequestBody StartInterviewRequest request,
        @AuthenticationPrincipal AppUserPrincipal principal) {
    return ResponseEntity.status(HttpStatus.CREATED)
            .body(interviewService.startInterview(request, principal.id()));
}
```

#### Testing and Debugging
- **How to Verify Bean Wiring**: Enable debug logs for `org.springframework.beans.factory` or inspect startup failures (`UnsatisfiedDependencyException`, `BeanCurrentlyInCreationException`).
- **Unit Testing a Service**: Because `InterviewServiceImpl` uses constructor injection of interfaces (`InterviewRepository`, `AIClientService`), you can instantiate `new InterviewServiceImpl(...)` in a JUnit 5 test with `@Mock` dependencies using Mockito (`@ExtendWith(MockitoExtension.class)`) in < 50ms without starting Spring or MySQL.

#### Key Takeaways
- Always keep `@RestController` classes thin: HTTP routing + input validation + delegation to `@Service`.
- Never inject 10 repositories directly into a controller (`AdminController`), and never store per-request state in fields of a singleton `@Service` or `@Controller`.

---

### 5.2 Spring Boot Auto-Configuration, Externalized Properties, and Custom Bean Overrides

#### Problem Being Solved
In traditional Java Enterprise / classic Spring Framework applications, setting up a web server, database connection pool, JPA `EntityManagerFactory`, Jackson `ObjectMapper`, and transaction manager required hundreds of lines of XML or boilerplate Java `@Configuration` classes. Furthermore, hardcoding database URLs, ports, and secret keys inside Java code makes it impossible to run the same compiled `.jar` file across a developer's laptop (`localhost:3306`), a Docker Compose network (`mysql:3306`), and a cloud provider like Render or Aiven (`mysql://avnadmin:...`).

#### Why This Approach?
InterviewIQ uses three complementary Spring Boot mechanisms:
1. **`@SpringBootApplication` Auto-Configuration ([`InterviewIqApplication.java:9`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/InterviewIqApplication.java#L9))**:
   - Combines `@SpringBootConfiguration`, `@EnableAutoConfiguration`, and `@ComponentScan`.
   - At startup, Spring Boot reads `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports` from its starter jars and evaluates `@ConditionalOnClass`, `@ConditionalOnProperty`, and `@ConditionalOnMissingBean` rules.
   - Because `spring-boot-starter-web` is on the classpath, it auto-configures embedded Tomcat on `${server.port}` (`8080`). Because `spring-boot-starter-data-jpa` is present, it auto-configures Hibernate and `JpaTransactionManager`.
2. **Externalized Configuration with Environment Variable Fallbacks ([`application.yml`](file:///D:/antigravity/interview-iq/backend/src/main/resources/application.yml))**:
   - Uses Spring's property placeholder syntax `${ENV_VAR:default_value}`. For example, `url: ${SPRING_DATASOURCE_URL:jdbc:mysql://localhost:3306/interviewiq?...}` ([`application.yml:9`](file:///D:/antigravity/interview-iq/backend/src/main/resources/application.yml#L9)) means: if the OS environment variable `SPRING_DATASOURCE_URL` is defined (as in `docker-compose.yml` or Render), use it; otherwise fall back to `localhost:3306`.
   - Note nested fallbacks in [`application.yml:31`](file:///D:/antigravity/interview-iq/backend/src/main/resources/application.yml#L31): `host: ${SPRING_REDIS_HOST:${SPRING_DATA_REDIS_HOST:localhost}}`, checking `SPRING_REDIS_HOST` first, then `SPRING_DATA_REDIS_HOST`, then `localhost`.
3. **Custom `@Bean @Primary` Override ([`DataSourceConfig.java`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/config/DataSourceConfig.java#L15-L107))**:
   - Cloud database providers (such as Aiven, Railway, or Render) often provide connection strings in the non-JDBC URI format: `mysql://user:password@host:port/dbname?ssl-mode=REQUIRED`.
   - Standard MySQL JDBC (`com.mysql.cj.jdbc.Driver`) rejects `mysql://` (requiring `jdbc:mysql://`) and rejects `ssl-mode=REQUIRED` (requiring camelCase `sslMode=REQUIRED`).
   - Therefore, `DataSourceConfig.dataSource()` defines a custom `@Bean @Primary public DataSource dataSource()` that intercepts `spring.datasource.url`, parses `mysql://` via `java.net.URI`, extracts `user:password` from `uri.getUserInfo()`, performs a proactive DNS lookup (`InetAddress.getByName(host)`) to log a clear human-readable error if the cloud DB is paused/deleted, normalizes `ssl-mode` to `sslMode`, appends `allowPublicKeyRetrieval=true&serverTimezone=UTC`, and constructs a `HikariDataSource`.

#### Why Not the Alternatives?

| Configuration Strategy | Pros | Cons | Assessment for InterviewIQ |
| :--- | :--- | :--- | :--- |
| **`${ENV:default}` in single `application.yml` + `DataSourceConfig` (Current)** | Single file to inspect; works out-of-the-box locally while allowing full env-var override in Docker/Render; auto-normalizes cloud `mysql://` URIs. | Mixing dev defaults (like `root123` and default JWT secret) into the main `application.yml` risks running in production with insecure defaults if env vars are forgotten. | Convenient for student/dev onboarding, but dangerous in production without profile separation. |
| **Spring Profiles (`application-dev.yml`, `application-prod.yml`)** | Strictly isolates dev defaults (`ddl-auto: update`, default secrets, `DEBUG` logging) from production (`ddl-auto: validate`, mandatory env vars with no fallback). | Slightly more files to maintain; requires setting `SPRING_PROFILES_ACTIVE=prod`. | **Recommended improvement** for production safety. |
| **`@ConfigurationProperties(prefix = "app")`** | Type-safe, validated (`@Validated`) POJO/record binding for `app.jwt.*`, `app.upload.*`, `app.cors.*`, `app.ai-service.*`. | Requires creating a configuration class instead of scattered `@Value("${...}")`. | Better than scattering `@Value` across `CorsConfig`, `JwtTokenProvider`, `ResumeServiceImpl`, and `AIClientServiceImpl`. |

#### What Breaks First?
1. **Hardcoded File Upload Paths Ignoring `application.yml`**:
   - In [`application.yml:57-60`](file:///D:/antigravity/interview-iq/backend/src/main/resources/application.yml#L57-L60), `app.upload.dir`, `app.upload.resume-dir`, and `app.upload.audio-dir` are parameterized.
   - `ResumeServiceImpl` properly injects `@Value("${app.upload.resume-dir}")` ([`ResumeServiceImpl.java:51`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/service/impl/ResumeServiceImpl.java#L51)).
   - However, [`UserController.java:40`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/controller/UserController.java#L40) hardcodes `private final String avatarDir = "./uploads/avatars";` and [`AuthController.java:75`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/controller/AuthController.java#L75) hardcodes `private final String idCardDir = "./uploads/id_cards";`! If an operator sets `APP_UPLOAD_DIR=/var/data/uploads` in production, resumes go to `/var/data/uploads` while avatars and ID cards still write to `./uploads/` inside the ephemeral container working directory!
2. **Duplicate HikariCP Configuration**:
   - Because `DataSourceConfig.dataSource()` manually instantiates `new HikariConfig()` instead of binding `spring.datasource.hikari.*` via `@ConfigurationProperties("spring.datasource.hikari")`, any changes to `spring.datasource.hikari.*` in `application.yml` (lines 13–17) are **completely ignored** at runtime! Only the hardcoded values in `DataSourceConfig.java:100-103` (`setMaximumPoolSize(20)`, etc.) take effect.
3. **Startup DNS Check Latency**:
   - `DataSourceConfig.java:58` calls `InetAddress.getByName(host)` synchronously during bean creation when `rawUrl.startsWith("mysql://")`. If DNS is slow, startup blocks; if DNS fails, it logs an error banner and still proceeds to `new HikariDataSource(config)`, which will immediately fail again during Hikari pool initialization.

#### What Changes at 10× Scale?
- At 10× scale (multiple backend container instances deployed behind a load balancer), local relative paths (`./uploads`) break immediately because Container A cannot read files uploaded to Container B's local disk, and container restarts wipe `./uploads` (note that `docker-compose.yml` mounts volumes for `mysql_data` and `redis_data`, **but mounts no volume for `./uploads` on `backend`**!). External object storage (AWS S3, Cloudflare R2, or GCS) becomes mandatory.

#### Actual Code References
Inspect [`DataSourceConfig.java:41-94`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/config/DataSourceConfig.java#L41-L94) to see how `mysql://` cloud URLs are normalized into JDBC URLs:

```java
// Actual Code: backend/src/main/java/com/interviewiq/config/DataSourceConfig.java (Lines 41-55, 88-105)
if (rawUrl != null && rawUrl.startsWith("mysql://")) {
    logger.info("Detected raw 'mysql://' URI scheme. Normalizing into standard JDBC format...");
    try {
        URI uri = URI.create(rawUrl);
        String userInfo = uri.getUserInfo();
        if (userInfo != null && userInfo.contains(":")) {
            String[] userParts = userInfo.split(":", 2);
            finalUser = userParts[0];
            finalPass = userParts[1];
        }
        String host = uri.getHost();
        int port = uri.getPort() != -1 ? uri.getPort() : 3306;
        String path = uri.getPath() != null ? uri.getPath() : "/defaultdb";
        String query = uri.getQuery();
        // ... normalizes ssl-mode -> sslMode, appends allowPublicKeyRetrieval=true & serverTimezone=UTC
        finalUrl = "jdbc:mysql://" + host + ":" + port + path + "?" + queryBuilder.toString();
    } catch (Exception e) {
        finalUrl = "jdbc:" + rawUrl;
    }
}
config.setJdbcUrl(finalUrl);
config.setUsername(finalUser);
config.setPassword(finalPass);
config.setDriverClassName(driverClassName);
config.setMaximumPoolSize(20);
```

#### Testing and Debugging
- Run the backend with `--debug` or `LOGGING_LEVEL_ORG_SPRINGFRAMEWORK_BOOT_AUTOCONFIGURE=DEBUG` to print the **Conditions Evaluation Report**, which shows exactly which auto-configurations matched (e.g., `DataSourceAutoConfiguration` backed off because `DataSourceConfig.dataSource` matched `@ConditionalOnMissingBean`).

#### Key Takeaways
- Custom `@Bean` definitions cause Spring Boot's default `@ConditionalOnMissingBean` auto-configurations to back off—when you manually construct `new HikariConfig()`, `spring.datasource.hikari.*` properties in `application.yml` stop working unless you explicitly bind them.
- Never hardcode fallback secrets (`APP_JWT_SECRET`, `SPRING_DATASOURCE_PASSWORD`) in production profiles.

---

### 5.3 REST API Design, HTTP Semantics, and Multipart File Handling

#### Problem Being Solved
A modern Single-Page Application (React 19) and mobile or third-party clients need a standardized, language-agnostic contract over HTTP to trigger actions, query state, and upload binary files (PDF/DOCX resumes, PNG/JPG avatars, ID cards). Without consistent URI conventions, HTTP methods, content-type negotiation, and status codes, frontend developers must guess whether an error is returned as `200 OK` with `{"success": false}` or as an HTTP `4xx`/`5xx`, and proxies/browsers cannot properly handle caching, preflight checks, or file downloads.

#### Why This Approach?
InterviewIQ uses **Spring Web MVC (`@RestController`)** to expose 43 endpoints across 8 controllers under the `/api` namespace:
1. **HTTP Method Semantics**:
   - `GET`: Safe, idempotent reads (e.g., `GET /api/interviews/{id}`, `GET /api/questions?category=Java&difficulty=MEDIUM`, `GET /api/resumes/latest`).
   - `POST`: Resource creation and state-transition commands (e.g., `POST /api/auth/register` → `201 Created`, `POST /api/interviews/start` → `201 Created`, `POST /api/interviews/{id}/submit-answer` → `200 OK`).
   - `PUT`: Full/idempotent updates (`PUT /api/users/profile`, `PUT /api/auth/change-password`, `PUT /api/notifications/{id}/read`).
   - `DELETE`: Resource removal (`DELETE /api/admin/users/{id}`).
2. **Parameter Binding Annotations**:
   - `@PathVariable`: Extracts URI template variables like `{id}` in `GET /api/interviews/{id}` ([`InterviewController.java:51`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/controller/InterviewController.java#L51)) or `{filename:.+}` (regex preserving file extension dots) in `GET /api/users/profile/avatar/view/{filename:.+}` ([`UserController.java:127`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/controller/UserController.java#L127)).
   - `@RequestParam`: Extracts query string parameters (`?category=Java&difficulty=EASY` in [`QuestionController.java:23-24`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/controller/QuestionController.java#L23-L24) or `@DateTimeFormat(iso = ISO.DATE_TIME)` in [`InterviewController.java:42`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/controller/InterviewController.java#L42)) and multipart form parts (`@RequestParam("file") MultipartFile file`).
   - `@RequestBody`: Deserializes JSON request bodies via Jackson's `MappingJackson2HttpMessageConverter`.
3. **Multipart Binary Upload & Resource Streaming**:
   - Configured in [`application.yml:38-41`](file:///D:/antigravity/interview-iq/backend/src/main/resources/application.yml#L38-L41) (`max-file-size: 10MB`, `max-request-size: 10MB`) and [`nginx/nginx.conf:22`](file:///D:/antigravity/interview-iq/nginx/nginx.conf#L22) (`client_max_body_size 10M`).
   - Uploaded files are written to disk with `UUID.randomUUID()` filenames via `Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING)` and streamed back via `UrlResource` with explicit `MediaType` headers (`image/png`, `image/webp`, `application/pdf`).

#### Why Not the Alternatives?

| API Paradigm / Storage | Pros | Cons | When to Choose |
| :--- | :--- | :--- | :--- |
| **REST over JSON + Multipart (Current)** | Native browser support (`fetch`/Axios, `FormData`), human-readable, easy debugging in DevTools/Swagger UI. | Over-fetching/under-fetching on nested views; Base64 re-encoding to FastAPI inflates file size by ~33%. | Best default for CRUD + SPA web applications like InterviewIQ. |
| **GraphQL (Spring for GraphQL)** | Client specifies exact fields needed. | Harder to handle file uploads, HTTP caching, and rate limiting; unnecessary when a single React SPA controls all views. | Multi-client ecosystems with deeply nested, variable graph queries. |
| **gRPC (Protobuf)** | Compact binary serialization, strict `.proto` contract between Java and Python (`ai-service`). | Requires gRPC-Web proxy for browsers; harder to inspect manually with `curl`. | High-throughput internal microservice calls (e.g., if `backend` ↔ `ai-service` ran thousands of RPCs/sec). |
| **Pre-Signed S3 URLs for File Uploads** | Browser uploads directly to S3; zero file bytes pass through Tomcat memory or local container disk. | Requires cloud bucket setup and IAM credentials during local development. | **Mandatory in multi-instance cloud production** (Render/AWS). |

#### What Breaks First?
1. **Path Traversal / Security Check on File Serving (`getAvatar` & `getIdCard`)**:
   - Look closely at [`UserController.java:130`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/controller/UserController.java#L130):
     ```java
     Path filePath = Paths.get(avatarDir).resolve(filename).normalize();
     ```
   - While `{filename:.+}` is a single URL path segment (so literal `/` is not matched by default unless URL-encoded and allowed by the servlet container), `filePath.normalize()` resolves `..` segments **without verifying that the resulting path still starts with `Paths.get(avatarDir).toAbsolutePath().normalize()`**! Always add `if (!filePath.startsWith(uploadDir)) throw new BadRequestException("Invalid path");`.
2. **File Extension Spoofing (No MIME Magic-Byte Verification)**:
   - `ResumeServiceImpl.java:70`, `UserController.java:104`, and `AuthController.java:87` only check the filename suffix (`.pdf`, `.png`, etc.). If a user uploads an executable or corrupted file renamed to `resume.pdf`, `ResumeServiceImpl` writes it to disk and sends it to `ai-service`, where `fitz.open(stream=file_bytes, filetype="pdf")` throws an exception caught by the heuristic fallback.
   - Additionally, in [`UserController.java:104`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/controller/UserController.java#L104):
     ```java
     String extension = originalFilename.substring(originalFilename.lastIndexOf('.') + 1).toLowerCase();
     ```
     If `originalFilename` has **no dot** (e.g., `"myavatar"`), `lastIndexOf('.')` returns `-1`, `-1 + 1 = 0`, and `extension` becomes `"myavatar"`, which cleanly fails `allowedExtensions.contains(extension)`. Compare that with `ResumeServiceImpl.getFileExtension()` ([`ResumeServiceImpl.java:299-305`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/service/impl/ResumeServiceImpl.java#L299-L305)), which explicitly checks `if (dotIndex < 0) throw new BadRequestException("File has no extension");`.
3. **Incorrect HTTP Status Code for Authorization Failures (`400 Bad Request` Instead of `403 Forbidden`)**:
   - When User A attempts to view User B's interview (`InterviewServiceImpl.java:372-374`), notification (`NotificationServiceImpl.java:47-49`), or resume (`ResumeServiceImpl.java:222-224`), the services throw `new BadRequestException("You do not have access to this ...")`, returning **`400 Bad Request`** instead of **`403 Forbidden`**!
4. **Orphaned Avatar & Resume Files on Disk**:
   - When a user uploads a new avatar (`UserController.java:114-119`), a new file `avatar_{id}_{uuid}.png` is written to `./uploads/avatars`, and `user.setAvatarUrl(...)` overwrites the database column. The old avatar file is never deleted from disk!

#### What Changes at 10× Scale?
- **Unbounded List Endpoints**: None of the collection endpoints (`GET /api/interviews/history`, `GET /api/questions`, `GET /api/notifications`, `GET /api/admin/users`, `GET /api/admin/audit-logs`, `GET /api/admin/violations`) implement **pagination (`Pageable` / `Page<T>`)**!
- With 10× data growth (e.g., 10,000 users, 50,000 audit logs, 5,000 AI-generated questions in the `questions` table because every resume-based interview saves 5 new `Question` rows to the global `questions` table at [`InterviewServiceImpl.java:463`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/service/impl/InterviewServiceImpl.java#L463)!), `GET /api/questions` (which calls `questionRepository.findAll()`) will serialize megabytes of JSON including every `idealAnswer` in a single response!

#### Actual Code References
See [`ResumeController.java:30-37`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/controller/ResumeController.java#L30-L37) and [`AuthController.java:112-137`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/controller/AuthController.java#L112-L137).

#### Key Takeaways
- Distinguish HTTP status codes accurately: `400 Bad Request` (malformed syntax/validation), `401 Unauthorized` (unauthenticated/invalid token), `403 Forbidden` (authenticated user lacks permission/ownership), `404 Not Found` (resource does not exist).
- Always paginate collection endpoints using Spring Data's `Pageable` (`?page=0&size=20&sort=createdAt,desc`).

---

### 5.4 DTO Pattern, Jackson Serialization, and Jakarta Bean Validation

#### Problem Being Solved
If a backend directly accepts JPA `@Entity` classes as `@RequestBody` inputs and returns `@Entity` classes as JSON responses, three severe problems occur:
1. **Mass Assignment Vulnerabilities**: If `POST /api/auth/register` accepted the `User` entity directly, an attacker could send `{"email": "hacker@test.com", "roles": [{"id": 2, "name": "ROLE_ADMIN"}]}` in the JSON body to grant themselves admin privileges.
2. **Sensitive Data Leakage & Infinite Recursion**: Returning a `User` entity serializes every getter—including `user.getPassword()` (the BCrypt hash) and `user.getRefreshTokens()`—and triggers either `LazyInitializationException` (because `open-in-view: false` closes the Hibernate session before Jackson runs) or `StackOverflowError` from bidirectional links (`User` → `Interview` → `User`).
3. **Invalid State Entering Business Logic**: Without boundary validation, `null` strings, empty passwords, malformed emails, or negative numbers penetrate deep into the service and database layers, causing cryptic `NullPointerException` or `DataIntegrityViolationException` errors.

#### Why This Approach?
InterviewIQ defines 7 Request DTOs (`com.interviewiq.dto.request`) and 15 Response DTOs (`com.interviewiq.dto.response`):
1. **Inbound Request Validation (`jakarta.validation.constraints.*`)**:
   - When a controller parameter is annotated with `@Valid @RequestBody` (e.g., `AuthController.register(@Valid @RequestBody RegisterRequest request)` at [`AuthController.java:44`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/controller/AuthController.java#L44)), Spring MVC's `RequestResponseBodyMethodProcessor` invokes **Jackson** to deserialize the JSON into `RegisterRequest`, and then immediately invokes **Hibernate Validator** (`LocalValidatorFactoryBean`) before entering the controller method body.
   - If any constraint (`@NotBlank`, `@Email`, `@Size`, `@Pattern`) fails, Spring throws `MethodArgumentNotValidException`, which [`GlobalExceptionHandler.handleValidation()`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/exception/GlobalExceptionHandler.java#L45-L64) catches and formats into a clean `400 Bad Request` with a field-by-field `validationErrors` map.
2. **Outbound Response Shaping**:
   - Services manually map entities into response DTOs using Lombok `@Builder` (e.g., `InterviewServiceImpl.mapToInterviewResponse()`, `UserController.mapToProfileResponse()`).
   - Notice how [`InterviewQuestionResponse.java`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/dto/response/InterviewQuestionResponse.java#L6-L12) (returned during an active exam by `GET /api/interviews/{id}/next-question`) deliberately **omits `idealAnswer`** so a candidate cannot open browser DevTools Network tab to read the answer key during the test, whereas [`QuestionResponse.java`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/dto/response/QuestionResponse.java#L6-L13) (returned in the practice question bank `GET /api/questions`) includes `idealAnswer`!
3. **Null-Field Suppression (`@JsonInclude`)**:
   - [`ApiErrorResponse.java:16`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/dto/response/ApiErrorResponse.java#L16) uses `@JsonInclude(JsonInclude.Include.NON_NULL)` so that `validationErrors` is omitted from the JSON output on non-validation errors (like `404 Not Found`).

#### Why Not the Alternatives?

| Mapping / DTO Approach | Pros | Cons | Comparison to Current Implementation |
| :--- | :--- | :--- | :--- |
| **Lombok `@Data @Builder` Classes + Manual Mapping (Current)** | Explicit, easy to step through in a debugger, zero reflection/magic during mapping. | Verbose `@Data @Builder @NoArgsConstructor @AllArgsConstructor` on 22 classes; manual `.builder()...build()` methods in services. | Works well, though Java 21 `record` types would eliminate Lombok boilerplate on all 22 DTOs. |
| **Java 21 `record` DTOs** | Immutable by default, concise 1-line declarations, native Jackson support since Jackson 2.12, supports `@Valid` annotations on record components. | No mutable setters (which DTOs shouldn't need anyway). | Ideal modern Java 21 replacement for Lombok `@Data` DTOs. |
| **MapStruct (Compile-Time Code Generator)** | Generates fast, type-safe mapper implementations at compile time. | Adds another annotation processor alongside Lombok in `pom.xml`. | Useful when a project has 50+ complex DTOs; manual mapping is fine for 15 DTOs. |
| **Exposing JPA Entities Directly (Used in `AdminController`)** | Zero DTO code to write. | **Leaks BCrypt password hashes** (`AdminController.createUser`), tightly couples DB schema to API response. | **Anti-pattern** currently present in `AdminController.java`. |

#### What Breaks First?
1. **Confirmed Security Bug: `AdminController.createUser()` Returns Raw `User` Entity Including Password Hash**:
   - In [`AdminController.java:61-98`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/controller/AdminController.java#L61-L98), `POST /api/admin/users` returns `ResponseEntity<User>`. Because [`User.java:33`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/entity/User.java#L33) does not have `@JsonIgnore` on `private String password;`, the HTTP response body contains `"password": "$2a$10$..."` as well as all 6 collection fields (`interviews`, `resumes`, `notifications`, `recommendations`, `refreshTokens`, `studentSkills`)!
2. **Confirmed Validation Gap: Missing `@Max` / `@Min` on `StartInterviewRequest.questionCount`**:
   - Look at [`StartInterviewRequest.java:14-15`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/dto/request/StartInterviewRequest.java#L14-L15):
     ```java
     @Builder.Default
     private int questionCount = 5;
     ```
   - And in [`InterviewServiceImpl.java:422`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/service/impl/InterviewServiceImpl.java#L422):
     ```java
     int questionCount = Math.max(1, request.getQuestionCount());
     ```
   - There is a lower bound (`Math.max(1, ...)`), **but no upper bound (`@Max(20)`)**! If a client sends `{"jobRole": "RESUME", "difficulty": "HARD", "mode": "TECHNICAL", "questionCount": 10000}`, `InterviewServiceImpl` passes `count = 10000` to FastAPI/Gemini and attempts to persist up to 10,000 `Question` and `InterviewQuestion` rows in a single transaction!
3. **Missing `@Valid` and Constraints on `UserController.updateProfile()`**:
   - In [`UserController.java:70-72`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/controller/UserController.java#L70-L72), `updateProfile(@RequestBody UpdateProfileRequest request, ...)` is **missing the `@Valid` annotation**! Even though [`UpdateProfileRequest.java:14`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/dto/request/UpdateProfileRequest.java#L14) declares `@NotBlank(message = "Full name is required")`, Spring never runs the validator because `@Valid` was omitted on the controller parameter! If a user sends `{"fullName": null}`, it bypasses validation and throws an unhandled `DataIntegrityViolationException` (`500 Internal Server Error`) when Hibernate tries to `UPDATE users SET full_name = NULL` (since `full_name` is `nullable = false` in `User.java:35`)!

#### What Changes at 10× Scale?
- Notice how [`Resume.java:55-59`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/entity/Resume.java#L55-L59) stores `extractedData` and `improvementSuggestions` as `String` fields mapped to MySQL `JSON` columns, and [`ResumeServiceImpl.java:275-297`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/service/impl/ResumeServiceImpl.java#L275-L297) parses `improvementSuggestions` from a JSON `String` into `List<SuggestionDto>` via `objectMapper.readValue(...)`, while **also** returning the raw JSON string in `ResumeDetailResponse.improvementSuggestions` and `ResumeDetailResponse.extractedData`! At 10× scale, double-serializing JSON (storing JSON strings inside JSON strings and re-parsing them on every read) wastes CPU and bandwidth.

#### Actual Code References
Examine [`RegisterRequest.java:18-32`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/dto/request/RegisterRequest.java#L18-L32):

```java
// Actual Code: backend/src/main/java/com/interviewiq/dto/request/RegisterRequest.java (Lines 16-33)
public class RegisterRequest {

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 50, message = "Password must be between 8 and 50 characters")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^a-zA-Z\\d\\s]).{8,50}$",
        message = "Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    )
    private String password;
```

#### Practical Example: Fixing `StartInterviewRequest` and `UserController.updateProfile`
```java
// Proposed Improvement: Bounded Java 21 Record DTO
public record StartInterviewRequest(
    @NotBlank(message = "Job role is required")
    @Size(max = 100)
    String jobRole,

    @NotBlank(message = "Difficulty is required")
    @Pattern(regexp = "(?i)EASY|MEDIUM|HARD|MIXED", message = "Difficulty must be EASY, MEDIUM, HARD, or MIXED")
    String difficulty,

    @NotBlank(message = "Mode is required")
    @Size(max = 20)
    String mode,

    @Min(value = 1, message = "At least 1 question is required")
    @Max(value = 20, message = "Maximum 20 questions per interview")
    int questionCount
) {}
```

#### Key Takeaways
- Putting `@NotBlank` or `@NotNull` on a DTO field does **nothing** unless the controller method parameter is annotated with `@Valid` (or `@Validated`)!
- Never return JPA `@Entity` objects directly from a `@RestController`.

---

### 5.5 Centralized Exception Handling (`@RestControllerAdvice`) vs. Filter-Level Error Handling

#### Problem Being Solved
During request processing, failures can happen at many layers:
- A JWT token might be missing or expired (Security Filter layer).
- A JSON request body might fail `@Valid` validation (Spring MVC Argument Resolver layer).
- An uploaded file might exceed 10MB (Multipart Resolver layer).
- An interview ID might not exist in MySQL, or a question might already be answered (Service layer).
- A database constraint or unexpected `NullPointerException` might occur (Repository/Runtime layer).

If each controller used `try/catch` blocks, error formatting would be duplicated across all 43 endpoints. If exceptions went uncaught without a handler, Spring Boot's default `BasicErrorController` (`/error`) would return inconsistent error shapes or expose internal details.

#### Why This Approach?
InterviewIQ uses a **two-tier error handling architecture**:
1. **Controller/Service Layer Exceptions (`@RestControllerAdvice` in [`GlobalExceptionHandler.java`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/exception/GlobalExceptionHandler.java#L20-L87))**:
   - Intercepts exceptions thrown **inside or after `DispatcherServlet`** using `@ExceptionHandler` methods:
     - `ResourceNotFoundException` → `404 Not Found`
     - `BadRequestException` → `400 Bad Request`
     - `UnauthorizedException` → `401 Unauthorized`
     - `BadCredentialsException` (thrown by `AuthenticationManager.authenticate()` inside `AuthServiceImpl.login()`) → `401 Unauthorized` (`"Invalid email or password"`)
     - `MethodArgumentNotValidException` → `400 Bad Request` with `Map<String, String> validationErrors`
     - `MaxUploadSizeExceededException` → `400 Bad Request` (`"File size exceeds maximum limit of 10MB"`)
     - `Exception` (catch-all fallback) → logs full stack trace via `logger.error("Unhandled exception: ", ex)` and returns a safe generic `500 Internal Server Error` (`"An unexpected error occurred"`), preventing stack-trace leakage to clients.
2. **Servlet Filter Layer Authentication Failures ([`AuthEntryPoint.java`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/security/AuthEntryPoint.java#L16-L35))**:
   - Why do we need `AuthEntryPoint` if we already have `GlobalExceptionHandler`?
   - **Crucial Spring Architecture Concept**: `Spring Security` filters run in the **Servlet Filter Chain BEFORE `DispatcherServlet`**! When an unauthenticated request hits a protected endpoint (like `GET /api/interviews/history` without a JWT), `AuthorizationFilter` throws an `AuthenticationException` **before `DispatcherServlet` is ever invoked**. Because `@RestControllerAdvice` only advises controllers managed by `DispatcherServlet`, it **cannot catch exceptions thrown by servlet filters**!
   - Therefore, `SecurityConfig.java:37` registers `AuthEntryPoint` (`implements AuthenticationEntryPoint`), which writes a `401 Unauthorized` JSON response directly to `HttpServletResponse.getOutputStream()`.

```mermaid
flowchart LR
    Req["HTTP Request"] --> SecFilter["Spring Security Filter Chain<br/>(JwtAuthenticationFilter -> AuthorizationFilter)"]
    SecFilter -->|"Unauthenticated<br/>(Before DispatcherServlet)"| AEP["AuthEntryPoint.commence()<br/>Writes 401 JSON directly to OutputStream"]
    SecFilter -->|"Authenticated"| DS["DispatcherServlet"]
    DS --> Ctrl["@RestController<br/>(@Valid / Service Call)"]
    Ctrl -->|"Throws RuntimeException /<br/>MethodArgumentNotValidException"| GEH["GlobalExceptionHandler<br/>(@RestControllerAdvice)<br/>Returns ApiErrorResponse"]
```

#### Why Not the Alternatives?
- **Spring Framework 6 `ProblemDetail` (RFC 9457 / RFC 7807)**: Spring Boot 3 natively supports `ProblemDetail` (`ResponseEntityExceptionHandler`), standardizing fields (`type`, `title`, `status`, `detail`, `instance`). InterviewIQ instead uses a custom `ApiErrorResponse` (`status`, `error`, `message`, `path`, `timestamp`, `validationErrors`), which is equally clear and matches the React frontend's Axios error interceptor expectations (`error.response.data.message`).

#### What Breaks First?
1. **Confirmed Bug: `@PreAuthorize` `AccessDeniedException` Caught by Catch-All `Exception.class` Handler Returning `500` Instead of `403`!**
   - Look closely at [`GlobalExceptionHandler.java:71-75`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/exception/GlobalExceptionHandler.java#L71-L75):
     ```java
     @ExceptionHandler(Exception.class)
     public ResponseEntity<ApiErrorResponse> handleGlobalException(Exception ex, WebRequest request) {
         logger.error("Unhandled exception: ", ex);
         return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred", request);
     }
     ```
   - What happens when a method annotated with `@PreAuthorize(...)` (method-level security via Spring AOP inside `DispatcherServlet`) throws `org.springframework.security.access.AccessDeniedException` or `AuthorizationDeniedException`?
   - Because `GlobalExceptionHandler` has **no `@ExceptionHandler(AccessDeniedException.class)`** and **does not rethrow `AccessDeniedException`**, its catch-all `@ExceptionHandler(Exception.class)` swallows `AccessDeniedException` before it can propagate back to Spring Security's `ExceptionTranslationFilter`! As a result, any `@PreAuthorize` denial returns **`500 Internal Server Error` ("An unexpected error occurred")** instead of **`403 Forbidden`**!
2. **Confirmed Bug: Locked Account (`LockedException`) on Login Returns `500` if `CustomUserDetailsService` Lock Triggers**:
   - In [`AuthServiceImpl.java:102-104`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/service/impl/AuthServiceImpl.java#L102-L104), `login()` manually checks `user.getBannedUntil()` before calling `authenticationManager.authenticate(...)`, throwing `BadRequestException` (`400`). However, for a disabled user (`enabled = false`), `authenticationManager.authenticate()` throws `DisabledException`, which is **not** a subclass of `BadCredentialsException`—so `GlobalExceptionHandler` catches it in `handleGlobalException(Exception.class)` and returns **`500 Internal Server Error`**!
3. **`new ObjectMapper()` Allocated on Every `401` in `AuthEntryPoint`**:
   - [`AuthEntryPoint.java:33`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/security/AuthEntryPoint.java#L33) calls `new ObjectMapper().writeValue(...)` on every `401` response. `ObjectMapper` is thread-safe and expensive to instantiate (scanning classpaths/introspectors); the Spring-managed `ObjectMapper` bean should be injected instead.

#### Practical Example: Hardening `GlobalExceptionHandler`
```java
// Proposed Addition to GlobalExceptionHandler.java
@ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
public ResponseEntity<ApiErrorResponse> handleAccessDenied(
        org.springframework.security.access.AccessDeniedException ex, WebRequest request) {
    return buildResponse(HttpStatus.FORBIDDEN, "You do not have permission to perform this action", request);
}

@ExceptionHandler(org.springframework.security.core.AuthenticationException.class)
public ResponseEntity<ApiErrorResponse> handleAuthenticationException(
        org.springframework.security.core.AuthenticationException ex, WebRequest request) {
    return buildResponse(HttpStatus.UNAUTHORIZED, ex.getMessage(), request);
}
```

#### Key Takeaways
- Filter exceptions happen **outside** `DispatcherServlet` (`AuthenticationEntryPoint` / `AccessDeniedHandler`), whereas controller and `@PreAuthorize` AOP exceptions happen **inside** `DispatcherServlet` (`@RestControllerAdvice`).
- Whenever you write a catch-all `@ExceptionHandler(Exception.class)`, you **must** explicitly handle `AccessDeniedException` (→ `403`), `AuthenticationException` (→ `401`), and `HttpMessageNotReadableException` (→ `400`), or else they will all be converted into `500 Internal Server Error`!

---

### 5.6 Relational Data Modeling, JPA/Hibernate ORM, Fetch Strategies, and Auditing

#### Problem Being Solved
In an object-oriented language like Java, domain concepts are modeled as object graphs with references, collections, and inheritance (`Interview` has a `User` and a `List<InterviewQuestion>`). In a relational database like MySQL, data is stored in normalized two-dimensional tables connected by foreign keys (`interviews.user_id = users.id`). Bridging this **Object-Relational Impedance Mismatch** manually with raw JDBC `ResultSet` loops requires thousands of lines of error-prone SQL string concatenation and manual column mapping.

#### Why This Approach?
InterviewIQ uses **Jakarta Persistence (JPA 3.1)** backed by **Hibernate ORM 6.5** across 20 `@Entity` classes:
1. **Primary Key Generation (`GenerationType.IDENTITY`)**:
   - 19 of the 20 entities use `@Id @GeneratedValue(strategy = GenerationType.IDENTITY)` (`BIGINT AUTO_INCREMENT` in MySQL).
   - 1 entity ([`SystemConfig.java:13-15`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/entity/SystemConfig.java#L13-L15)) uses a natural `String` primary key (`@Id @Column(name = "config_key") private String configKey;`).
2. **Association Mappings & Owning Sides**:
   - **`@ManyToOne(fetch = FetchType.LAZY)`**: Used on child entities that hold the foreign key column (`@JoinColumn`), such as `Interview.user`, `InterviewQuestion.interview`, `InterviewQuestion.question`, `Question.category`, `Notification.user`, `Recommendation.user`, `RefreshToken.user`, and `Resume.user`. Why explicitly specify `fetch = FetchType.LAZY` on `@ManyToOne`? Because the JPA specification defaults `@ManyToOne` and `@OneToOne` to `EAGER`! Setting `LAZY` tells Hibernate to inject a lightweight ByteBuddy proxy instead of joining the parent table on every query.
   - **`@OneToOne`**: Used for `InterviewQuestion` ↔ `Answer` (`interview_question_id` `UNIQUE NOT NULL` in `answers`) and `Answer` ↔ `Feedback` (`answer_id` `UNIQUE NOT NULL` in `feedback`).
   - **`@ManyToMany`**:
     - `User.roles` ([`User.java:48-55`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/entity/User.java#L48-L55)) maps the `user_roles` join table with `fetch = FetchType.EAGER` because roles are required on almost every security check (`CustomUserDetailsService`).
     - `Resume.skills` ([`Resume.java:61-68`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/entity/Resume.java#L61-L68)) maps the `resume_skills` join table with `fetch = FetchType.LAZY`.
3. **Disabling Open-Session-In-View (`spring.jpa.open-in-view: false` in [`application.yml:27`](file:///D:/antigravity/interview-iq/backend/src/main/resources/application.yml#L27))**:
   - By default in Spring Boot, `open-in-view` is `true`, keeping the Hibernate `Session` open through the entire HTTP view/JSON-rendering phase. Disabling it (`open-in-view: false`) is a **production best practice**: the Hibernate persistence context closes as soon as the `@Transactional` service method returns, ensuring controllers and Jackson serializers cannot accidentally trigger hidden lazy-loading SQL queries during JSON serialization.
4. **Automatic Entity Auditing (`@EnableJpaAuditing`)**:
   - Activated on [`InterviewIqApplication.java:11`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/InterviewIqApplication.java#L11) and attached to 7 entities via `@EntityListeners(AuditingEntityListener.class)`. Fields annotated with `@CreatedDate` (`User.createdAt`, `Interview.startedAt`, `Answer.submittedAt`, `Resume.uploadedAt`, `Notification.createdAt`, `Recommendation.generatedAt`, `RefreshToken.createdAt`) and `@LastModifiedDate` (`User.updatedAt`) are automatically stamped by Spring Data before Hibernate executes `INSERT` or `UPDATE`.

#### Why Not the Alternatives?

| Persistence Technology | Pros | Cons | When Better Than JPA/Hibernate |
| :--- | :--- | :--- | :--- |
| **Spring Data JPA / Hibernate (Current)** | Rapid CRUD development, automatic schema evolution in dev (`ddl-auto: update`), entity state tracking (dirty checking), database-portable JPQL. | Easy to accidentally write N+1 queries; bidirectional `@OneToOne` lazy loading caveats; `GenerationType.IDENTITY` disables JDBC batch inserts. | Best for domain-rich CRUD applications with standard relational lifecycles. |
| **Spring Data JDBC / `JdbcClient`** | No lazy-loading proxies, no dirty-checking surprises, explicit SQL control. | Requires writing manual SQL for joins and managing aggregate roots manually. | High-performance services where ORM proxy magic causes unpredictable query plans. |
| **jOOQ / MyBatis** | Compile-time type-safe SQL generation (jOOQ); full control over complex analytical queries. | Requires code generation step against a live schema (`jOOQ`). | Analytics-heavy or reporting-heavy backends. |

#### What Breaks First?
1. **Hibernate `@OneToOne(mappedBy = ...)` Lazy-Loading Trap on `InterviewQuestion.answer` and `Answer.feedback`**:
   - Look at [`InterviewQuestion.java:32-33`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/entity/InterviewQuestion.java#L32-L33):
     ```java
     @OneToOne(mappedBy = "interviewQuestion", cascade = CascadeType.ALL, orphanRemoval = true)
     private Answer answer;
     ```
   - And [`Answer.java:44-45`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/entity/Answer.java#L44-L45):
     ```java
     @OneToOne(mappedBy = "answer", cascade = CascadeType.ALL, orphanRemoval = true)
     private Feedback feedback;
     ```
   - **Deep Hibernate Internals Lesson**: On the **inverse (`mappedBy`) side** of a bidirectional `@OneToOne` association, the table (`interview_questions`) does **not** have the foreign key column (`answers.interview_question_id` has it). Therefore, when Hibernate loads an `InterviewQuestion` row, how can it know whether `iq.answer` is `null` or should be a ByteBuddy proxy without querying the `answers` table? **It cannot!** Consequently, Hibernate **cannot lazy-load the inverse side of an optional `@OneToOne`** without bytecode enhancement—it either eagerly queries `answers` for every `InterviewQuestion` loaded, or requires querying from the owning side (`answerRepository.findByInterviewQuestion(iq)`).
2. **`ddl-auto: update` in Production ([`application.yml:21`](file:///D:/antigravity/interview-iq/backend/src/main/resources/application.yml#L21))**:
   - `ddl-auto: update` compares JPA annotations against MySQL's `INFORMATION_SCHEMA` at startup and runs `ALTER TABLE ADD COLUMN`. It **never drops columns**, cannot safely rename columns or migrate existing data, and can lock large tables at startup in production. Production systems should use **Flyway** or **Liquibase** with `ddl-auto: validate`.
3. **Lombok `@Builder` vs. Default Field Initialization**:
   - When using Lombok `@Builder` on an `@Entity`, any field initializer (like `private Boolean enabled = true;` or `private List<Interview> interviews = new ArrayList<>();`) is **ignored by `.builder().build()`** (setting the field to `null`!) **unless** annotated with `@Builder.Default`!
   - The author of InterviewIQ correctly added `@Builder.Default` to `User.enabled`, `User.roles`, `Interview.status`, `Interview.notified30m`, `InterviewQuestion.status`, `Notification.isRead`, `Question.aiGenerated`, `RefreshToken.revoked`, and `Resume.skills`. That is great attention to detail!

#### Actual Code References
See [`User.java:15-109`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/entity/User.java#L15-L109), [`Interview.java:12-66`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/entity/Interview.java#L12-L66), and [`Answer.java:10-46`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/entity/Answer.java#L10-L46).

#### Key Takeaways
- Always set `spring.jpa.open-in-view: false` so lazy-loading bugs fail fast inside tests/services rather than leaking DB connections into the HTTP response phase.
- Always specify `fetch = FetchType.LAZY` on `@ManyToOne` and `@OneToOne` owning sides, and avoid bidirectional `@OneToOne(mappedBy = ...)` unless necessary for cascading.

---

### 5.7 Spring Data JPA Repositories, Derived Queries, JPQL `@Modifying`, and the N+1 Problem

#### 1. Understand the Problem
How do we query MySQL without writing repetitive JDBC `PreparedStatement` boilerplate, while also ensuring we don't accidentally execute hundreds of individual SQL queries in a single HTTP request?
- **Analogy**: Imagine going to a grocery store with a shopping list of 10 items. A single `JOIN` query is putting all 10 items into your cart in one trip. The **N+1 Query Problem** is driving to the grocery store once to read your list (1 query), and then driving back and forth to the store 10 separate times—once for each item ($N$ queries).

#### 2. Why This?
InterviewIQ defines **20 repository interfaces** in `com.interviewiq.repository`, each extending `JpaRepository<Entity, Long>`. At startup, Spring Data JPA generates dynamic JDK proxies (`SimpleJpaRepository`) implementing each interface using three query mechanisms:
1. **Derived Query Methods**: Spring parses the method name AST at startup and compiles it to JPQL:
   - [`InterviewRepository.java:14`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/repository/InterviewRepository.java#L14): `findByUserIdOrderByCreatedAtDesc(Long userId)`
   - [`NotificationRepository.java:14`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/repository/NotificationRepository.java#L14): `countByUserIdAndIsReadFalse(Long userId)`
   - [`ResumeRepository.java:15`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/repository/ResumeRepository.java#L15): `findFirstByUserIdOrderByUploadedAtDesc(Long userId)`
2. **Custom JPQL Queries (`@Query`)**:
   - [`InterviewRepository.java:18-24`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/repository/InterviewRepository.java#L18-L24) computes aggregate analytics directly in MySQL:
     ```java
     @Query("SELECT AVG(i.overallScore) FROM Interview i WHERE i.user.id = :userId AND i.status = 'COMPLETED'")
     Double findAverageScoreByUserId(@Param("userId") Long userId);
     ```
3. **Bulk Update Queries (`@Modifying` + `@Query`)**:
   - [`RefreshTokenRepository.java:14-15`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/repository/RefreshTokenRepository.java#L14-L15):
     ```java
     @Modifying
     @Query("UPDATE RefreshToken rt SET rt.revoked = true WHERE rt.user.id = :userId")
     void revokeAllByUserId(Long userId);
     ```
   - Why `@Modifying`? By default, `@Query` expects a `SELECT` (`executeQuery()`). `@Modifying` tells Spring Data JPA to call `executeUpdate()` instead, issuing a single `UPDATE refresh_tokens SET revoked = 1 WHERE user_id = ?` statement rather than fetching all tokens into Java memory and updating them one by one.

#### 3. Why Not Something Else?
| Approach | Boilerplate | Compile-Time Type Safety | Complex Dynamic Queries | N+1 Visibility |
| :--- | :--- | :--- | :--- | :--- |
| **Spring Data JPA (`JpaRepository` + `@Query`) (Chosen)** | Ultra-low | Validated at app startup | Moderate (JPQL strings) | Hidden unless inspected |
| **QueryDSL / JOOQ** | Low (code-generated metamodel) | 100% compile-time safe | Excellent | Explicit joins in fluent API |
| **Spring Data `JpaSpecificationExecutor`** | Medium | Moderate | Good for dynamic filters | Moderate |
| **MyBatis / JdbcClient** | Medium (explicit SQL) | Runtime unless mapped | Full native SQL power | 100% explicit |

#### 4. What Breaks First?
1. **Severe Cascading N+1 Queries Across `InterviewServiceImpl` and `RecommendationServiceImpl` (Confirmed Bottleneck)**:
   - Look at [`InterviewServiceImpl.java:355-366`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/service/impl/InterviewServiceImpl.java#L355-L366) (`getHistory(Long userId)`):
     ```java
     return interviewRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
             .map(i -> {
                 int qCount = interviewQuestionRepository.findByInterviewIdOrderByOrderNumberAsc(i.getId()).size();
                 return mapToResponse(i, qCount);
             }).collect(Collectors.toList());
     ```
     - **Failure Scenario**: A student has 50 historical interviews, each with 10 questions. Calling `GET /api/interviews/history` runs **1 query** to fetch 50 interviews, and then inside `.map(...)` runs **50 separate `SELECT * FROM interview_questions WHERE interview_id = ?`** queries—solely to call `.size()`!
   - Even worse, look at [`InterviewServiceImpl.java:313-351`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/service/impl/InterviewServiceImpl.java#L313-L351) (`getResults`) and [`RecommendationServiceImpl.java:77-94`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/service/impl/RecommendationServiceImpl.java#L77-L94) (`generateRecommendations`):
     ```java
     List<InterviewQuestion> iqs = interviewQuestionRepository.findByInterviewIdOrderByOrderNumberAsc(interview.getId());
     for (InterviewQuestion iq : iqs) {
         answerRepository.findByInterviewQuestion(iq).ifPresent(answer -> {
             feedbackRepository.findByAnswer(answer).ifPresent(feedback -> {
                 if (feedback.getOverallScore() != null && feedback.getOverallScore() < 60) {
                     if (iq.getQuestion().getCategory() != null) {
                         weakTopics.add(iq.getQuestion().getCategory().getName());
                     }
                 }
             });
         });
     }
     ```
     - **Query Multiplication**: For a user with $I$ completed interviews and $Q$ questions per interview, `generateRecommendations` runs:
       - $1$ query for interviews
       - $+ I$ queries for `interview_questions`
       - $+ (I \times Q)$ queries for `answers`
       - $+ (I \times Q)$ queries for `feedbacks`
       - $+ (I \times Q)$ lazy loads for `Question` + `QuestionCategory`
       - For $I = 20, Q = 10$, a single POST to `/api/recommendations/generate` executes **$1 + 20 + 200 + 200 + 200 = 621$ SQL queries**!
   - **Recommended Fix**: Add a `@Query` with `JOIN FETCH` on `InterviewQuestionRepository`:
     ```java
     @Query("SELECT iq FROM InterviewQuestion iq " +
            "JOIN FETCH iq.question q " +
            "LEFT JOIN FETCH q.category " +
            "LEFT JOIN FETCH iq.answer a " +
            "LEFT JOIN FETCH a.feedback " +
            "WHERE iq.interview.id = :interviewId ORDER BY iq.orderNumber ASC")
     List<InterviewQuestion> findFullDetailsByInterviewId(@Param("interviewId") Long interviewId);
     ```
     And for `getHistory`, either use `countByInterviewId(Long interviewId)` or a single projection query grouping by `interview.id`.
2. **In-Memory Full-Table Filtering (`findAll().stream().filter(...)`) (Confirmed Anti-Pattern)**:
   - [`QuestionServiceImpl.java:49-53`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/service/impl/QuestionServiceImpl.java#L49-L53): When filtering questions by `difficulty` alone (`categoryId == null`), the service calls `questionRepository.findAll().stream().filter(...)` instead of adding `findByDifficulty(String difficulty, Pageable pageable)` to `QuestionRepository`!
   - [`AdminController.java:126, 141, 281`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/controller/AdminController.java#L126): Loads the entire `interviews`, `users`, and `proctoring_violations` tables into the JVM heap via `.findAll()` and filters them with Java streams.
3. **`@Modifying` Without `clearAutomatically = true` ([`RefreshTokenRepository.java:14`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/repository/RefreshTokenRepository.java#L14))**:
   - `@Modifying` bulk updates execute directly against MySQL, bypassing Hibernate's 1st-level persistence context (`EntityManager`). If a `RefreshToken` entity was already loaded in the same transaction before `revokeAllByUserId(userId)`, its in-memory `revoked` field remains `false` unless `@Modifying(clearAutomatically = true)` is set.

#### 5. What Changes at 10× Scale?
- At 10× scale (50,000 users, 500,000 interviews, 5,000,000 answers), calling `interviewRepository.findAll()` in `AdminController.getDetailedStats()` (`line 126`) will pull 500,000 `Interview` objects into heap memory on a single admin dashboard refresh, causing immediate GC thrashing and `java.lang.OutOfMemoryError: Java heap space`.
- All analytics must be pushed down to SQL (`COUNT`, `AVG`, `GROUP BY`) and paginated at the database level (`Pageable`).

#### Key Takeaways
- Never call repository methods inside a `.stream().map(...)` or `for` loop. Use `JOIN FETCH`, `@EntityGraph`, or batch queries (`WHERE id IN (:ids)`).
- Never call `.findAll().stream().filter(...)` when a SQL `WHERE` clause can filter rows using a B-Tree index in MySQL.

---

### 5.8 Transaction Management (`@Transactional`), ACID Guarantees, and Connection Pool Starvation

#### 1. Understand the Problem
When an operation modifies multiple database rows (such as saving a student's `Answer`, saving the AI's `Feedback`, updating `InterviewQuestion.status = "ANSWERED"`, and inserting a new adaptive follow-up `InterviewQuestion`), what happens if the server crashes or throws an exception halfway through?
- Without an **atomic transaction**, the database is left in a corrupted, half-written state (e.g., an `Answer` exists with no `Feedback`, and the question is still marked `PENDING`).
- However, database transactions require holding a physical TCP connection to MySQL. What happens if you keep that transaction open while waiting 15–60 seconds for an external AI API to respond?

#### 2. Why This?
Spring's declarative transaction management (`@Transactional`) uses **AOP (Aspect-Oriented Programming) CGLIB proxies** around `@Service` beans:
1. When a controller calls `interviewService.submitAnswer(...)`, it actually invokes a Spring `TransactionInterceptor` proxy.
2. The proxy asks `JpaTransactionManager` to borrow a physical JDBC connection from **HikariCP** (configured with `maximum-pool-size: 20` in [`DataSourceConfig.java:100`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/config/DataSourceConfig.java#L100)), disables `autoCommit` (`SET autocommit=0`), and binds the connection to `ThreadLocal`.
3. If the method returns normally, the proxy flushes Hibernate's persistence context (`Session.flush()`), executes `COMMIT`, and returns the connection to HikariCP.
4. If an unchecked exception (`RuntimeException` or `Error`) escapes the method, the proxy executes `ROLLBACK`.
5. For read-only queries—such as [`DashboardServiceImpl.java:32`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/service/impl/DashboardServiceImpl.java#L32) and [`LeaderboardServiceImpl.java:24`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/service/impl/LeaderboardServiceImpl.java#L24)—the project uses `@Transactional(readOnly = true)`, which tells Hibernate to skip dirty-checking snapshots (saving CPU and memory).

#### 3. Why Not Something Else?
| Approach | Granularity | Risk of Holding DB Connection During External I/O | Code Verbosity |
| :--- | :--- | :--- | :--- |
| **Method-Level `@Transactional` (Chosen)** | Coarse (entire service method) | **High** if method calls `RestTemplate` | Minimal (1 annotation) |
| **`TransactionTemplate` (Programmatic)** | Fine-grained (exact DB block only) | **Zero** (wrap only the DB reads/writes, not the HTTP call) | Low (lambda block) |
| **Split Helper Bean / Self-Injected `@Transactional` Methods** | Fine-grained | **Zero** | Medium |

#### 4. What Breaks First?
1. **Catastrophic HikariCP Connection Pool Starvation Under AI Latency (Confirmed Critical Architectural Bug)**:
   - Inspect these four methods:
     - [`InterviewServiceImpl.java:91`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/service/impl/InterviewServiceImpl.java#L91): `@Transactional public InterviewResponse startInterview(...)` — calls `aiClientService.generateQuestions(...)` (`line 125`) over HTTP while holding an open DB transaction!
     - [`InterviewServiceImpl.java:216`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/service/impl/InterviewServiceImpl.java#L216): `@Transactional public FeedbackResponse submitAnswer(...)` — calls `aiClientService.evaluateAnswer(...)` (`line 239`) AND `aiClientService.generateFollowUpQuestion(...)` (`line 436`)—**two sequential LLM HTTP calls** inside a single open DB transaction!
     - [`ResumeServiceImpl.java:61`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/service/impl/ResumeServiceImpl.java#L61): `@Transactional public ResumeResponse uploadResume(...)` — writes file to disk and calls `aiClientService.analyzeResume(...)` (`line 78`) inside an open DB transaction!
     - [`RecommendationServiceImpl.java:58`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/service/impl/RecommendationServiceImpl.java#L58): `@Transactional public List<Recommendation> generateRecommendations(...)` — calls `aiClientService.generateRecommendations(...)` (`line 99`) inside an open DB transaction!
   - **Root Cause & Conditions**:
     - HikariCP has `maximum-pool-size: 20` and `connection-timeout: 30000` (30s) ([`DataSourceConfig.java:100-102`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/config/DataSourceConfig.java#L100-L102)).
     - `RestTemplate` has a `readTimeout` of **60 seconds** ([`RestTemplateConfig.java:15`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/config/RestTemplateConfig.java#L15)).
     - Even though Java 21 Virtual Threads (`spring.threads.virtual.enabled: true`) allow Tomcat to handle 10,000 concurrent HTTP requests without running out of OS threads, **each virtual thread entering `@Transactional` still pins a scarce physical MySQL connection from HikariCP**!
   - **Observable Symptoms**:
     - If just **20 students** simultaneously submit an answer or start an interview and Gemini takes 15–35 seconds to respond, **all 20 HikariCP connections are checked out and idle**, waiting for Python/Gemini HTTP responses.
     - Meanwhile, **every other endpoint in the entire application** (`POST /api/auth/login`, `GET /api/dashboard`, `GET /api/questions`) blocks waiting for a DB connection and fails after 30 seconds with:
       `org.springframework.transaction.CannotCreateTransactionException: Could not open JPA EntityManager for transaction; SQLTransientConnectionException: HikariPool-1 - Connection is not available, request timed out after 30000ms.`
   - **Recommended Fix**:
     - **Never hold a `@Transactional` DB connection across an external network call (`RestTemplate`)!**
     - Either remove `@Transactional` from the outer method and use `TransactionTemplate` (or separate transactional helper methods) strictly around the fast (<5ms) database read and database write phases, leaving the slow (5,000–60,000ms) `aiClientService` call outside any transaction.
2. **Missing `@Transactional` on Multi-Table Delete in `AdminController.deleteUser` ([`AdminController.java:244-292`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/controller/AdminController.java#L244-L292))**:
   - `AdminController.deleteUser(@PathVariable Long id)` manually deletes records across **9 repositories** (`refreshTokenRepository`, `notificationRepository`, `leaderboardRepository`, `recommendationRepository`, `resumeRepository`, `feedbackRepository`, `answerRepository`, `interviewQuestionRepository`, `interviewRepository`, `violationRepository`, `userRepository`), and even calls `refreshTokenRepository.revokeAllByUserId(id)` (`@Modifying` query!).
   - Because `deleteUser` is **not** annotated with `@Transactional`:
     1. Calling `refreshTokenRepository.revokeAllByUserId(id)` (`line 251`) throws `jakarta.persistence.TransactionRequiredException: Executing an update/delete query` at runtime whenever an admin tries to delete a user!
     2. Even if `revokeAllByUserId` were removed, each `.delete(...)` runs in its own auto-committed mini-transaction; a failure on step 7 leaves the user's data half-deleted.

#### 5. What Changes at 10× Scale?
- At 10× scale (200 concurrent active interviews), keeping `@Transactional` around `aiClientService` calls guarantees 100% downtime during peak hours. Separating external I/O from database transactions reduces average transaction duration from **~8,000 ms** to **~4 ms**—increasing HikariCP's effective throughput capacity by **2,000×** on the exact same 20-connection pool!

#### Key Takeaways
- Database connections are one of the scarcest resources in a backend system. Keep transactions as short as humanly possible: read state $\rightarrow$ close transaction $\rightarrow$ call slow external API $\rightarrow$ open transaction $\rightarrow$ write state & commit.
- Every `@Modifying` repository method requires an active `@Transactional` context.

---

### 5.9 Stateless Authentication, Spring Security Filter Chain, and Dual-Token JWT Architecture

#### 1. Understand the Problem
HTTP is stateless: each request arrives independently over TCP. How does the backend know *who* is calling `GET /api/dashboard` and *what roles* (`ROLE_STUDENT` vs. `ROLE_ADMIN`) they possess, without forcing the user to send their email and password on every click? And if we issue a signed token, how do we balance **convenience** (staying logged in for 7 days) with **revocability** (logging out or banning a compromised user immediately)?

#### 2. Why This?
InterviewIQ implements a **hybrid Dual-Token Architecture** combining **Stateless Short-Lived JWT Access Tokens** (24 hours, configured via `app.jwt.expiration-ms: 86400000` in [`application.yml:51`](file:///D:/antigravity/interview-iq/backend/src/main/resources/application.yml#L51)) with **Stateful Long-Lived Database Refresh Tokens** (7 days, `app.jwt.refresh-expiration-ms: 604800000` in [`application.yml:52`](file:///D:/antigravity/interview-iq/backend/src/main/resources/application.yml#L52)):
1. **`SecurityConfig.java`** ([`lines 32-55`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/config/SecurityConfig.java#L32-L55)):
   - Disables CSRF (`AbstractHttpConfigurer::disable` — safe because authentication relies on `Authorization: Bearer <token>` headers rather than auto-sent browser cookies).
   - Configures `SessionCreationPolicy.STATELESS` (Tomcat never creates an `HttpSession` or `JSESSIONID`).
   - Registers `JwtAuthenticationFilter` **before** `UsernamePasswordAuthenticationFilter`.
2. **`JwtTokenProvider.java`** ([`lines 18-76`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/security/JwtTokenProvider.java#L18-L76)):
   - Uses `io.jsonwebtoken` (`jjwt 0.12.3`) with HMAC-SHA (`Keys.hmacShaKeyFor(...)`) to sign and verify JWTs where `sub` (Subject) is the user's `email`.
3. **`JwtAuthenticationFilter.java`** ([`lines 27-53`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/security/JwtAuthenticationFilter.java#L27-L53)):
   - Extends `OncePerRequestFilter`. Extracts the `Bearer ` token from the `Authorization` header, validates its HMAC signature and `exp` timestamp via `jwtTokenProvider.validateToken(jwt)`, loads `UserDetails` from MySQL via `CustomUserDetailsService.loadUserByUsername(username)`, and populates `SecurityContextHolder.getContext().setAuthentication(...)`.
4. **`RefreshToken` Entity & Rotation** ([`AuthServiceImpl.java:103-128, 179-192`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/service/impl/AuthServiceImpl.java#L103-L128)):
   - Refresh tokens are random `UUID.randomUUID().toString()` values persisted in the `refresh_tokens` table with `expiryDate` and `revoked` flags.
   - When `POST /api/auth/refresh` is called, `AuthServiceImpl.refreshToken` verifies the token exists, is not `revoked`, and has not expired—and if expired, deletes it and throws `BadRequestException("Refresh token expired")`.
   - When `POST /api/auth/logout` is called (`lines 131-137`), `refreshTokenRepository.revokeAllByUserId(user.getId())` invalidates all refresh tokens for that user.

#### 3. Why Not Something Else?
| Approach | DB Lookup Per Request | Instant Revocation | Horizontal Scaling |
| :--- | :--- | :--- | :--- |
| **Pure Stateless JWT (claims include userId + roles)** | **0 queries** | Impossible until JWT expires | Trivial (any node verifies HMAC) |
| **InterviewIQ Hybrid (JWT + DB lookup in Filter + DB Refresh Token) (Chosen)** | **2 queries** (1 in filter + 1 in controller) | Partial (Refresh token revoked immediately; `User.enabled` checked if enforced) | Easy (shared MySQL) |
| **Opaque Session Tokens in Redis (`Spring Session Data Redis`)** | 1 fast Redis `GET` (<0.5ms) | 100% immediate on logout/ban | Easy (shared Redis) |

#### 4. What Breaks First?
1. **Redundant Double Database Lookup on Every Authenticated Request (Confirmed Performance Anti-Pattern)**:
   - Look at what happens on every single authenticated API call (e.g., `GET /api/dashboard`):
     1. [`JwtAuthenticationFilter.java:40-41`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/security/JwtAuthenticationFilter.java#L40-L41) extracts `email` from the JWT and calls `userDetailsService.loadUserByUsername(username)` $\rightarrow$ executes `SELECT * FROM users u LEFT JOIN user_roles r ... WHERE u.email = ?`.
     2. Seconds later inside the controller (e.g., [`DashboardController.java:24-27`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/controller/DashboardController.java#L24-L27), [`InterviewController.java:102-104`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/controller/InterviewController.java#L102-L104), [`ResumeController.java:63-65`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/controller/ResumeController.java#L63-L65)), the controller helper `getCurrentUserId(Authentication auth)` calls `userRepository.findByEmail(auth.getName())` $\rightarrow$ executes the **exact same `SELECT * FROM users WHERE email = ?` query a second time**!
   - **Recommended Fix**: Either embed `userId` and `roles` as claims inside the JWT (0 DB queries per request), or have `CustomUserDetailsService` return a custom `UserPrincipal` object containing `Long id` so controllers can read `((UserPrincipal) auth.getPrincipal()).getId()` with zero extra DB queries.
2. **Filter Chain `hasAuthority("ROLE_ADMIN")` vs. Controller `@PreAuthorize` Conflict + Broken Student Proctoring Endpoints (Confirmed Bug)**:
   - Compare [`SecurityConfig.java:45`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/config/SecurityConfig.java#L45) with [`AdminController.java:19-20`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/controller/AdminController.java#L19-L20):
     ```java
     // SecurityConfig.java:45
     .requestMatchers("/api/admin/**").hasAuthority("ROLE_ADMIN")
     ```
     ```java
     // AdminController.java:19-20
     @RequestMapping("/api/admin")
     @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_MENTOR')")
     ```
   - **Bug 1**: Spring Security evaluates HTTP filter chain `requestMatchers` **before** method-level `@PreAuthorize` AOP interceptors. Therefore, a user with `ROLE_MENTOR` or `ROLE_SUPER_ADMIN` (without `ROLE_ADMIN`) is rejected with `403 Forbidden` at the filter gate before ever reaching `AdminController`!
   - **Bug 2**: Look at [`AdminController.java:361-383`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/controller/AdminController.java#L361-L383):
     - `POST /api/admin/violations` (`reportViolation`, line 361 — called by the frontend during an interview when a student switches tabs or loses webcam focus)
     - `POST /api/admin/feedback` (`submitFeedback`, line 374 — called by a student to submit platform feedback)
     - Both endpoints live inside `AdminController` under `/api/admin/**` and inherit `@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', ...)")`! When a regular `ROLE_STUDENT` triggers a proctoring violation or submits platform feedback, the backend rejects the request with `403 Forbidden`!
3. **Refresh Token Not Rotated on `/api/auth/refresh` ([`AuthServiceImpl.java:103-128`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/service/impl/AuthServiceImpl.java#L103-L128))**:
   - `refreshToken(String requestRefreshToken)` issues a new JWT access token and returns the **same** `requestRefreshToken` without rotating it or extending/revoking the old token. Furthermore, `createRefreshToken` (`lines 179-192`) inserts a new row on every login without revoking previous active tokens for that user.
4. **Hex String Decoded as Base64 in `JwtTokenProvider.getSigningKey()` ([`JwtTokenProvider.java:30-33`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/security/JwtTokenProvider.java#L30-L33))**:
   - The default secret in [`application.yml:50`](file:///D:/antigravity/interview-iq/backend/src/main/resources/application.yml#L50) is `404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970` (which happens to contain `/`, `+`, and alphanumeric characters valid in Base64, so `Decoders.BASE64.decode(jwtSecret)` succeeds), **but** if an operator sets `JWT_SECRET` in `.env` to a string containing `-`, `_`, or non-multiple-of-4 length, `Decoders.BASE64.decode` throws `DecodingException` at runtime.

#### 5. What Changes at 10× Scale?
- Eliminating the 2 redundant `SELECT` queries on `users` + `user_roles` per authenticated request removes **20,000 SQL queries per minute** at 10,000 req/min.
- Adding a scheduled cleanup job (`DELETE FROM refresh_tokens WHERE revoked = true OR expiry_date < NOW()`) prevents unbounded growth of the `refresh_tokens` table.

#### Key Takeaways
- Keep URL-level authorization (`SecurityConfig`) and method-level authorization (`@PreAuthorize`) aligned, and never place student-callable endpoints (`/violations`, `/feedback`) inside `/api/admin/**`.
- Store `userId` and `roles` in a custom `UserDetails` principal (or JWT claims) so controllers never need to re-query `userRepository.findByEmail(auth.getName())`.

---

### 5.10 Synchronous Microservice Integration (`RestTemplate`) and Graceful Degradation

#### 1. Understand the Problem
Java/Spring Boot excels at enterprise security, relational persistence, and transactional orchestration, while Python dominates the AI/LLM ecosystem (`google-generativeai`, `pdfplumber`, `python-docx`). How should the Java backend communicate with the Python `ai-service` (`http://ai-service:8000`), and what should happen when the Python container is down, Gemini rate-limits requests (`429 ResourceExhausted`), or the LLM returns malformed JSON?

#### 2. Why This?
InterviewIQ uses a **Synchronous HTTP Client with Multi-Tier Graceful Degradation**:
1. **`RestTemplateConfig.java`** ([`lines 10-18`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/config/RestTemplateConfig.java#L10-L18)):
   - Configures a singleton `RestTemplate` bean with `SimpleClientHttpRequestFactory`:
     - `connectTimeout = 10_000` ms (10 seconds to establish TCP handshake with `ai-service:8000`)
     - `readTimeout = 60_000` ms (60 seconds waiting for Gemini LLM inference to finish)
2. **`AIClientServiceImpl.java`** ([`lines 18-174`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/service/impl/AIClientServiceImpl.java#L18-L174)):
   - Wraps every `restTemplate.postForEntity(...)` call in a `try / catch (Exception e)` block that logs the failure (`log.error(...)`) and returns a safe fallback map instead of crashing the user's HTTP request.
3. **Two-Level Fallback Chain**:
   - **Level 1 (Python `ai-service` Fallback)**: In [`resume_router.py:130-169`](file:///D:/antigravity/interview-iq/ai-service/routers/resume_router.py#L130-L169), [`question_router.py:140-175`](file:///D:/antigravity/interview-iq/ai-service/routers/question_router.py#L140-L175), [`evaluation_router.py:193-286`](file:///D:/antigravity/interview-iq/ai-service/routers/evaluation_router.py#L193-L286), and [`recommendation_router.py:75-103`](file:///D:/antigravity/interview-iq/ai-service/routers/recommendation_router.py#L75-L103), if `GEMINI_API_KEY` is missing or Gemini throws a `429`/`500` error, Python catches the exception and runs deterministic keyword/heuristic fallback logic (e.g., matching against 65 known tech skills in `COMMON_SKILLS` or scoring answer word count and technical vocabulary).
   - **Level 2 (Java Backend Fallback)**: If the Python container itself is unreachable (`ConnectionRefused`), `AIClientServiceImpl` returns a fallback dictionary, and [`InterviewServiceImpl.java:460-497`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/service/impl/InterviewServiceImpl.java#L460-L497) (`useFallbackQuestions`) queries MySQL's seeded `questions` bank (`questionRepository.findRandomByCategoryAndDifficulty(...)`), falling back to dynamically seeded default questions (`ensureDefaultQuestionsExist`, lines 517–569) so an interview **never fails to start**!

#### 3. Why Not Something Else?
| HTTP Client / Pattern | Programming Model | Spring Boot 3 Status | Resilience Features |
| :--- | :--- | :--- | :--- |
| **`RestTemplate` + Manual `try/catch` (Chosen)** | Synchronous / Blocking (Virtual-thread friendly in Java 21) | Maintenance mode | Manual fallback maps; no circuit breaker |
| **Spring `RestClient` (Spring 6.1+)** | Synchronous fluent API | **Recommended modern replacement** for `RestTemplate` | Clean interceptors + Resilience4j integration |
| **Spring `WebClient` (Reactive)** | Non-blocking event loop (Netty) | Active (requires `spring-boot-starter-webflux`) | Built-in retry/timeout operators |
| **Async Queue (RabbitMQ / Kafka)** | Event-driven asynchronous | Active | Decouples HTTP latency + automatic dead-letter retries |

#### 4. What Breaks First?
1. **Broken JSON Schema Contract Between `RecommendationServiceImpl.java` and Python `recommendation_router.py` (Confirmed Bug — 100% Fallback Rate)**:
   - Let's compare the exact code on both sides of `POST /ai/recommendations/generate`:
   - **Python (`ai-service/models/schemas.py:94-98` & `routers/recommendation_router.py:66-70`) returns**:
     ```python
     return RecommendationResponse(
         dsa_topics=data.get("dsa_topics", []),
         interview_topics=data.get("interview_topics", []),
         weekly_roadmap=data.get("weekly_roadmap", []),
     )
     ```
   - **Java ([`RecommendationServiceImpl.java:99-115`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/service/impl/RecommendationServiceImpl.java#L99-L115)) reads**:
     ```java
     Map<String, Object> aiResult = aiClientService.generateRecommendations(
             userId, new ArrayList<>(weakTopics), skillNames);

     if (aiResult != null) {
         String type = (String) aiResult.getOrDefault("type", "GENERAL");
         String content = (String) aiResult.getOrDefault("content",
                 "Based on your interview performance, focus on strengthening your core concepts.");
         String roadmap = aiResult.get("roadmap") != null ? aiResult.get("roadmap").toString() : null;
     ```
   - **Root Cause**: Python returns keys `dsa_topics`, `interview_topics`, and `weekly_roadmap`. Java looks for keys `type`, `content`, and `roadmap`!
   - **Observable Symptoms**: Even when Gemini succeeds and returns a rich 4-week study roadmap, `aiResult.get("type")`, `aiResult.get("content")`, and `aiResult.get("roadmap")` **always evaluate to `null`** in Java! Every recommendation saved to MySQL gets `type = "GENERAL"`, the hardcoded fallback string `"Based on your interview performance..."`, and `roadmap = null`!
   - **Bonus Bug on Line 106**: Even if the key name were fixed to `weekly_roadmap`, calling `aiResult.get("weekly_roadmap").toString()` on a `java.util.ArrayList<Map<String, Object>>` produces Java's `[{week=1, focus=...}]` string—which is **invalid JSON** and causes MySQL 8.0 to throw `Data truncation: Invalid JSON text` because `Recommendation.roadmap` is typed as `columnDefinition = "JSON"` ([`Recommendation.java:32`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/entity/Recommendation.java#L32))! You must serialize it with Jackson's `objectMapper.writeValueAsString(...)`.
2. **Scale Mismatch Bug in Weak Topic Detection ([`RecommendationServiceImpl.java:87`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/service/impl/RecommendationServiceImpl.java#L87))**:
   - Line 87 checks: `if (feedback.getOverallScore() != null && feedback.getOverallScore() < 60)`
   - However, [`evaluation_router.py:167, 274`](file:///D:/antigravity/interview-iq/ai-service/routers/evaluation_router.py#L167) and [`InterviewServiceImpl.java:257`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/service/impl/InterviewServiceImpl.java#L257) score `Feedback.overallScore` on a **1.0 to 10.0 scale** (whereas `Interview.overallScore` is scaled to 0–100 in `completeInterview` at [`InterviewServiceImpl.java:295`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/service/impl/InterviewServiceImpl.java#L295) via `(totalScore / answeredCount) * 10`).
   - Because `Feedback.overallScore` is at most `10.0`, `feedback.getOverallScore() < 60` is **always `true`**! Even a student who scores `10.0 / 10.0` on every question has 100% of their topics flagged as `weakTopics`.
3. **Untyped `Map<String, Object>` Deserialization (`AIClientServiceImpl.java`)**:
   - `AIClientServiceImpl` uses raw `Map.class` responses instead of strongly typed Java record DTOs. That lack of compile-time schema enforcement is the direct reason the `RecommendationServiceImpl` key mismatch went unnoticed.
4. **No Circuit Breaker (Resilience4j)**:
   - If `ai-service` hangs (e.g., network partition), every request waits the full 60-second `readTimeout` before falling back. A Resilience4j `@CircuitBreaker` would trip open after 5 consecutive timeouts and trigger the fallback in **0 ms**.

#### 5. What Changes at 10× Scale?
- At 10× scale, encoding 10 MB PDFs into Base64 strings inside Java heap memory (`Base64.getEncoder().encodeToString(fileContent)` in [`AIClientServiceImpl.java:32`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/service/impl/AIClientServiceImpl.java#L32)) inflates payload sizes by ~33% and allocates multiple copies (`byte[]` + `char[]` + Jackson JSON buffer $\approx 35\text{ MB}$ per concurrent upload). Streaming `multipart/form-data` or passing a shared object-storage key (S3/MinIO) eliminates this memory spike.

#### Key Takeaways
- Never use untyped `Map<String, Object>` for inter-service contracts; define explicit request/response Java `record` DTOs matching Python's Pydantic `BaseModel` schemas.
- Always serialize JSON columns with `ObjectMapper.writeValueAsString(...)`, never `.toString()`.

---

### 5.11 Java 21 Virtual Threads, Scheduled Background Jobs (`@Scheduled`), and Concurrency

#### 1. Understand the Problem
How does the backend handle concurrent blocking I/O (like waiting for Gemini or MySQL) without exhausting OS threads, and how does it run periodic background tasks (like sending 30-minute interview reminders) without a human clicking a button?

#### 2. Why This?
1. **Java 21 Virtual Threads ([`application.yml:43-45`](file:///D:/antigravity/interview-iq/backend/src/main/resources/application.yml#L43-L45))**:
   ```yaml
   spring:
     threads:
       virtual:
         enabled: true
   ```
   - In traditional Spring Boot, Tomcat uses a fixed pool of 200 OS platform threads (~1 MB stack each). If 200 requests block on `RestTemplate`, Tomcat rejects the 201st request.
   - With `spring.threads.virtual.enabled: true` on Java 21 (Project Loom), Spring Boot configures Tomcat and `@Scheduled` executors to spawn lightweight **Virtual Threads** managed by the JVM on a small pool of carrier OS threads (`ForkJoinPool`). When a virtual thread blocks on socket I/O (`RestTemplate` or JDBC), the JVM **unmounts** the virtual thread from the OS carrier thread, freeing the CPU to serve other requests!
2. **Scheduled Reminders ([`NotificationScheduler.java:21-60`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/service/NotificationScheduler.java#L21-L60))**:
   - Enabled via `@EnableScheduling` on [`InterviewIqApplication.java:11`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/InterviewIqApplication.java#L11).
   - `@Scheduled(cron = "0 * * * * *")` runs `checkUpcomingInterviews()` at the top of every minute (`00` seconds).
   - Queries `interviewRepository.findByStatus("SCHEDULED")`, checks if `scheduledAt` is within `[now, now + 31 minutes]` and `!Boolean.TRUE.equals(interview.getNotified30m())`, creates an in-app `Notification`, sends an HTML email via `emailService.sendInterviewReminder(...)`, and sets `interview.setNotified30m(true)`.

#### 3. Why Not Something Else?
| Scheduling / Concurrency Mechanism | Multi-Instance Safe? | Persistence Across Restarts | Operational Complexity |
| :--- | :--- | :--- | :--- |
| **Spring `@Scheduled` + DB Flag `notified30m` (Chosen)** | **No** (race condition if >1 backend container runs at `:00`) | Yes (stored in `interviews` table) | Zero extra infra |
| **Spring `@Scheduled` + ShedLock** | **Yes** (atomic DB/Redis lock) | Yes | Very low (1 library + 1 lock table) |
| **Quartz Scheduler / JobRunr** | **Yes** | Yes (clustered job store) | Medium |

#### 4. What Breaks First?
1. **Race Condition & Double-Submission on `submitAnswer` ([`InterviewServiceImpl.java:216-276`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/service/impl/InterviewServiceImpl.java#L216-L276))**:
   - **Failure Scenario**: A student double-clicks "Submit Answer" (or retries after a brief network glitch), sending two concurrent `POST /api/interviews/answer` requests for the same `interviewQuestionId`.
   - **Root Cause**:
     - Request A and Request B both read `InterviewQuestion` while its status is `"PENDING"` (`line 220`).
     - Neither checks `if ("ANSWERED".equals(iq.getStatus()))` nor uses `@Version` optimistic locking or `SELECT ... FOR UPDATE` (`@Lock(LockModeType.PESSIMISTIC_WRITE)`).
     - Both call Python `ai-service` (~5 seconds).
     - Request A inserts an `Answer` row into `answers` (`interview_question_id` has a `UNIQUE` constraint because of `@OneToOne`).
     - When Request B tries to commit its `Answer` row for the same `interview_question_id`, MySQL throws `SQLIntegrityConstraintViolationException: Duplicate entry for key 'answers.UK_...'`, which `GlobalExceptionHandler` catches and returns as an unhandled `500 Internal Server Error`!
   - **Recommended Fix**: Check `if ("ANSWERED".equals(iq.getStatus())) throw new BadRequestException("Question already answered");` and either add `@Version private Long version;` to `InterviewQuestion` or acquire a pessimistic lock (`findByIdWithLock`).
2. **Unindexed Query + Synchronous SMTP Blocking in `NotificationScheduler` ([`NotificationScheduler.java:30-56`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/service/NotificationScheduler.java#L30-L56))**:
   - `interviewRepository.findByStatus("SCHEDULED")` scans `interviews` by `status`. Look at [`Interview.java:14`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/entity/Interview.java#L14): the index is `@Index(name = "idx_interview_user_status", columnList = "user_id, status")`. Because `user_id` is the leading column of the composite B-Tree index, a query filtering **only** by `status = 'SCHEDULED'` **cannot use `idx_interview_user_status`** and performs a full table scan every 60 seconds!
   - Furthermore, `NotificationScheduler` filters the time window (`scheduledAt.isAfter(now) && scheduledAt.isBefore(thirtyMinsFromNow)`) in Java memory instead of SQL (`findByStatusAndNotified30mFalseAndScheduledAtBetween(...)`), and calls `emailService.sendInterviewReminder(...)` synchronously inside the loop (where 50 slow SMTP handshakes can take >60 seconds, overlapping the next cron tick).

#### 5. What Changes at 10× Scale?
- If you horizontally scale the `backend` container to 3 replicas behind Nginx, all 3 replicas will execute `@Scheduled(cron = "0 * * * * *")` at the exact same millisecond (`XX:XX:00.000`), read `notified30m = false`, and send **3 duplicate reminder emails** to every student! Adding **ShedLock** (`@SchedulerLock(name = "checkUpcomingInterviews", lockAtLeastFor = "PT30S", lockAtMostFor = "PT55S")`) solves this immediately.

#### Key Takeaways
- Virtual threads (`spring.threads.virtual.enabled: true`) make blocking I/O cheap in terms of OS threads, **not** in terms of database connections or downstream rate limits.
- A composite index `(A, B)` cannot accelerate queries that filter only by `B`.

---

### 5.12 Configured-Only Infrastructure: Redis Caching, STOMP WebSockets, and Startup Seeding

#### 1. Understand the Problem
During code reviews, one of the most important skills is distinguishing **what is wired in configuration files** from **what actually executes in production request paths**. Let's examine three infrastructure components in InterviewIQ where configuration exists, and see how they actually behave.

#### 2. Why This & Reality Audit
1. **Redis Caching ([`RedisConfig.java:18-52`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/config/RedisConfig.java#L18-L52) vs. [`application.yml:35-36`](file:///D:/antigravity/interview-iq/backend/src/main/resources/application.yml#L35-L36)) — Configured Only, Not Used**:
   - `RedisConfig.java` defines a `RedisTemplate<String, Object>` bean and a `RedisCacheManager` bean with custom per-cache TTLs:
     - `dashboard`: 5 minutes (`Duration.ofMinutes(5)`)
     - `questions`: 30 minutes (`Duration.ofMinutes(30)`)
     - `leaderboard`: 10 minutes (`Duration.ofMinutes(10)`)
   - **Why It Never Runs**:
     1. Zero methods anywhere in `com.interviewiq` have `@Cacheable`, `@CachePut`, or `@CacheEvict`, and zero classes inject `RedisTemplate` or `CacheManager`!
     2. Even if `@Cacheable("dashboard")` were added tomorrow, `application.yml:35-36` sets `spring.cache.type: simple`, and because `RedisConfig` defines a custom `RedisCacheManager` bean, `RedisCacheManager` actually takes precedence over `spring.cache.type: simple`—meaning Spring **will try to connect to Redis (`localhost:6379`)** the moment `@Cacheable` is added, failing if Redis is not running!
2. **STOMP WebSockets ([`WebSocketConfig.java:9-25`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/config/WebSocketConfig.java#L9-L25)) — Configured Only, Not Used**:
   - Registers `/ws/interview` with SockJS fallback and enables an in-memory SimpleBroker on `/topic` and `/queue`.
   - However, zero `@MessageMapping` methods or `SimpMessagingTemplate` injections exist in the backend. All interview question delivery, timers, and proctoring violations currently use standard REST polling/POSTs.
3. **Database Startup Seeding ([`DataSeeder.java:19-484`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/config/DataSeeder.java#L19-L484)) — Fully Implemented**:
   - Implements `CommandLineRunner`, executing automatically after the Spring `ApplicationContext` starts.
   - Seeds 4 roles (`ROLE_STUDENT`, `ROLE_ADMIN`, `ROLE_SUPER_ADMIN`, `ROLE_MENTOR`), default admin and student accounts, 5 question categories, 40+ curated interview questions across Java/Python/React/SQL/HR, 4 `InterviewTemplate` rows, 8 `SystemConfig` keys, 3 `AdminPrompt` rows, and demo interview history + notifications.

#### 3. What Breaks First?
1. **`DataSeeder` Startup Time & Non-Transactional Batch Inserts**:
   - `DataSeeder.run()` checks `findByName` / `findByEmail` / `count()` before inserting, making it idempotent across restarts. However, it inserts questions one by one via `questionRepository.save(q)` (`line 346`) rather than `saveAll(...)`, adding ~40 round-trips on initial cold boot.
2. **Hardcoded Default Admin Credentials in `DataSeeder.java` (`lines 58-92`)**:
   - Seeds `admin@interviewiq.com` (`Admin@123`), `superadmin@interviewiq.com` (`Super@123`), `mentor@interviewiq.com` (`Mentor@123`), and `student@interviewiq.com` (`Student@123`) unconditionally into every environment (including production!) because `@Profile("dev")` is not used on `DataSeeder`.

#### Key Takeaways
- Restrict demo user/password seeding in `DataSeeder` using `@Profile({"dev", "local"})` or environment variables so production deployments never start with well-known admin passwords (`Admin@123`).
- To activate the already-configured `RedisCacheManager`, annotate `DashboardServiceImpl.getStudentDashboard`, `LeaderboardServiceImpl.getLeaderboard`, and `QuestionServiceImpl.getQuestions` with `@Cacheable`, and evict caches on interview completion (`@CacheEvict`).

---

## 6. End-to-End Request Flows

Let's trace the **four core end-to-end backend workflows** from the incoming HTTP packet all the way through Tomcat filters, controllers, `@Transactional` proxies, Hibernate/MySQL queries, external FastAPI/Gemini calls, and JSON serialization.

---

### 6.1 Workflow 1: Authentication, JWT Issuance, Token Refresh & Logout

```mermaid
sequenceDiagram
    autonumber
    actor Client as React Client
    participant Filter as JwtAuthenticationFilter
    participant Ctrl as AuthController
    participant AuthMgr as AuthenticationManager (DaoAuthenticationProvider)
    participant Svc as AuthServiceImpl
    participant DB as MySQL 8.0

    Note over Client,DB: Flow A: User Login (POST /api/auth/login)
    Client->>Filter: POST /api/auth/login {email, password}
    Filter->>Ctrl: No Bearer header -> pass through (/api/auth/** is permitAll)
    Ctrl->>Svc: login(LoginRequest) [@Transactional]
    Svc->>AuthMgr: authenticate(UsernamePasswordAuthenticationToken)
    AuthMgr->>DB: SELECT u.*, r.* FROM users u JOIN user_roles ur ... WHERE u.email = ?
    AuthMgr->>AuthMgr: BCryptPasswordEncoder.matches(rawPassword, user.password)
    Svc->>DB: SELECT * FROM users WHERE email = ?
    Svc->>Svc: jwtTokenProvider.generateToken(authentication) [HMAC-SHA256, 24h]
    Svc->>DB: INSERT INTO refresh_tokens (token, user_id, expiry_date, revoked) VALUES (UUID, ?, +7d, false)
    Svc-->>Ctrl: AuthResponse {accessToken, refreshToken, tokenType="Bearer", user}
    Ctrl-->>Client: 200 OK ApiResponse<AuthResponse>

    Note over Client,DB: Flow B: Token Refresh (POST /api/auth/refresh)
    Client->>Ctrl: POST /api/auth/refresh {"refreshToken": "<uuid>"}
    Ctrl->>Svc: refreshToken(uuid) [@Transactional]
    Svc->>DB: SELECT * FROM refresh_tokens WHERE token = ? AND revoked = false
    Alt Token Expired (expiryDate < Instant.now())
        Svc->>DB: DELETE FROM refresh_tokens WHERE id = ?
        Svc-->>Client: 400 Bad Request ("Refresh token expired")
    Else Token Valid
        Svc->>Svc: jwtTokenProvider.generateTokenFromUsername(user.email)
        Svc-->>Client: 200 OK ApiResponse<AuthResponse> (new accessToken, same refreshToken)
    End
```

#### Step-by-Step Execution Trace (`POST /api/auth/login`)
1. **Incoming Request & Filter Chain**:
   - `POST /api/auth/login` enters `JwtAuthenticationFilter.doFilterInternal` ([`JwtAuthenticationFilter.java:27-53`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/security/JwtAuthenticationFilter.java#L27-L53)). Because there is no `Authorization: Bearer` header, `StringUtils.hasText(jwt)` is `false`, and the request passes down the chain.
   - `SecurityConfig` ([`line 40`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/config/SecurityConfig.java#L40)) matches `.requestMatchers("/api/auth/**").permitAll()`.
2. **Deserialization & Validation**:
   - `RequestResponseBodyMethodProcessor` deserializes the JSON body into [`LoginRequest`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/dto/request/LoginRequest.java#L8-L16) and validates `@NotBlank @Email email` and `@NotBlank password` (`@Valid` at [`AuthController.java:40`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/controller/AuthController.java#L40)).
3. **Service & Transaction Boundary**:
   - Enters [`AuthServiceImpl.login`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/service/impl/AuthServiceImpl.java#L78-L100) (`@Transactional` — borrows 1 HikariCP connection).
   - Calls `authenticationManager.authenticate(...)`, which delegates to `DaoAuthenticationProvider` $\rightarrow$ [`CustomUserDetailsService.loadUserByUsername(email)`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/security/CustomUserDetailsService.java#L21-L39).
   - Hibernate executes `SELECT` on `users` and eagerly fetches `user_roles` + `roles` (`@ManyToMany(fetch = FetchType.EAGER)` on [`User.java:53`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/entity/User.java#L53)).
   - `BCryptPasswordEncoder.matches` verifies the plaintext password against the stored `$2a$10$...` hash. If invalid, throws `BadCredentialsException` $\rightarrow$ caught by [`GlobalExceptionHandler.java:46-50`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/exception/GlobalExceptionHandler.java#L46-L50) $\rightarrow$ returns `401 Unauthorized` (`{"success":false,"message":"Invalid email or password"}`).
4. **Token Generation & Persistence**:
   - Calls `jwtTokenProvider.generateToken(authentication)` ([`JwtTokenProvider.java:35-46`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/security/JwtTokenProvider.java#L35-L46)) to create a 24-hour signed JWT.
   - Calls `createRefreshToken(user)` ([`AuthServiceImpl.java:179-192`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/service/impl/AuthServiceImpl.java#L179-L192)) which persists a `RefreshToken` entity (`INSERT INTO refresh_tokens ...`).
   - Transaction commits on method return; controller wraps `AuthResponse` in `ApiResponse.success("Login successful", response)` with HTTP `200 OK`.

---

### 6.2 Workflow 2: Resume Upload, Disk Storage, Base64 AI Parsing & Skill Mapping

```mermaid
sequenceDiagram
    autonumber
    actor Student as Student Browser
    participant Ctrl as ResumeController
    participant Svc as ResumeServiceImpl
    participant FS as Local Disk (/app/uploads/resumes)
    participant AI as AIClientServiceImpl
    participant Py as FastAPI (/ai/resume/analyze)
    participant Gem as Google Gemini API
    participant DB as MySQL 8.0

    Student->>Ctrl: POST /api/resumes/upload (multipart/form-data: file)
    Ctrl->>DB: getCurrentUserId() -> SELECT * FROM users WHERE email = ?
    Ctrl->>Svc: uploadResume(userId, MultipartFile) [@Transactional]
    Svc->>Svc: Validate !isEmpty(), size <= 10MB, contentType in [PDF, DOCX, DOC]
    Svc->>DB: SELECT * FROM users WHERE id = ?
    Svc->>FS: Files.write(/app/uploads/resumes/{userId}_{UUID}_{filename}, bytes)
    Svc->>AI: analyzeResume(file.getBytes(), filename)
    AI->>AI: Base64.getEncoder().encodeToString(bytes)
    AI->>Py: POST /ai/resume/analyze {file_content: base64, filename}
    Py->>Py: Base64 decode -> pdfplumber / python-docx text extraction
    Py->>Gem: generate_content(RESUME_ANALYSIS_PROMPT + text[:6000])
    Alt Gemini Succeeds
        Gem-->>Py: JSON {skills, projects, experience, education}
    Else Gemini Fails / No API Key
        Py->>Py: fallback_resume_analysis(text) [65 COMMON_SKILLS regex match]
    End
    Py-->>AI: 200 OK ResumeAnalyzeResponse
    AI-->>Svc: Map<String, Object> aiResult
    Loop For each skillName in aiResult.get("skills")
        Svc->>DB: SELECT * FROM skills WHERE LOWER(name) = LOWER(?)
        Opt Skill not in DB
            Svc->>DB: INSERT INTO skills (name, category) VALUES (?, 'Technical')
        End
    End
    Svc->>DB: INSERT INTO resumes (user_id, file_name, file_path, parsed_data, extracted_text, ...)
    Svc->>DB: INSERT INTO resume_skills (resume_id, skill_id) VALUES (?, ?)
    Svc-->>Ctrl: ResumeResponse DTO
    Ctrl-->>Student: 200 OK ApiResponse<ResumeResponse>
```

#### Critical Observations in Workflow 2
- **Orphaned Disk Files on Rollback**: In [`ResumeServiceImpl.java:68-74`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/service/impl/ResumeServiceImpl.java#L68-L74), `Files.write(filePath, file.getBytes())` writes the physical PDF to disk *before* the database `INSERT` commits. If the subsequent MySQL write fails and `@Transactional` rolls back the database transaction, the file on disk is **not deleted** (because local filesystem I/O is not transactional).
- **JSON Column Serialization**: Unlike `RecommendationServiceImpl`, [`ResumeServiceImpl.java:81`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/service/impl/ResumeServiceImpl.java#L81) **correctly** uses `objectMapper.writeValueAsString(aiResult)` before saving to `Resume.parsedData` (`columnDefinition = "JSON"`).

---

### 6.3 Workflow 3: Adaptive Interview Lifecycle (`start` $\rightarrow$ `submitAnswer` $\rightarrow$ `complete`)

```mermaid
sequenceDiagram
    autonumber
    actor Student as Student Browser
    participant Ctrl as InterviewController
    participant Svc as InterviewServiceImpl
    participant AI as AIClientServiceImpl
    participant Py as FastAPI (ai-service:8000)
    participant LB as LeaderboardServiceImpl
    participant DB as MySQL 8.0

    Note over Student,DB: Phase 1: Start Interview (POST /api/interviews/start)
    Student->>Ctrl: POST /api/interviews/start {interviewType, difficulty, questionCount, durationMinutes}
    Ctrl->>Svc: startInterview(userId, request) [@Transactional]
    Svc->>DB: INSERT INTO interviews (user_id, status='IN_PROGRESS', started_at=NOW(), ...)
    Svc->>DB: SELECT * FROM resumes WHERE user_id = ? ORDER BY uploaded_at DESC LIMIT 1
    Svc->>AI: generateQuestions(skills, projects, experience, type, difficulty, count)
    AI->>Py: POST /ai/questions/generate
    Py-->>AI: {questions: [{question_text, category, difficulty, expected_answer}]}
    Loop For each generated question (or fallback DB question)
        Svc->>DB: INSERT INTO questions (ai_generated=true, ...)
        Svc->>DB: INSERT INTO interview_questions (interview_id, question_id, order_number, status='PENDING')
    End
    Svc-->>Student: 200 OK InterviewResponse (with list of QuestionSummary)

    Note over Student,DB: Phase 2: Submit Answer + Adaptive Follow-Up (POST /api/interviews/answer)
    Student->>Ctrl: POST /api/interviews/answer {interviewQuestionId, answerText, timeTakenSeconds}
    Ctrl->>Svc: submitAnswer(userId, request) [@Transactional]
    Svc->>DB: SELECT * FROM interview_questions WHERE id = ? (verify userId ownership)
    Svc->>DB: INSERT INTO answers (interview_question_id, answer_text, time_taken_seconds)
    Svc->>DB: UPDATE interview_questions SET status = 'ANSWERED' WHERE id = ?
    Svc->>AI: evaluateAnswer(questionText, answerText, expectedAnswer, category, difficulty)
    AI->>Py: POST /ai/answers/evaluate
    Py-->>AI: {relevance_score, technical_score, communication_score, confidence_score, overall_score, strengths, weaknesses, suggestions}
    Svc->>DB: INSERT INTO feedbacks (answer_id, overall_score, strengths, weaknesses, ...)
    Opt Adaptive Follow-Up Triggered (answeredCount < 15 AND orderNumber <= 10)
        Svc->>AI: generateFollowUpQuestion(questionText, answerText, difficulty, category)
        AI->>Py: POST /ai/questions/AdaptiveFollowUp
        Py-->>AI: {question_text, category, difficulty, expected_answer}
        Svc->>DB: INSERT INTO questions (ai_generated=true, ...)
        Svc->>DB: INSERT INTO interview_questions (interview_id, question_id, order_number=max+1, status='PENDING')
    End
    Svc-->>Student: 200 OK FeedbackResponse (includes nextQuestion if follow-up generated!)

    Note over Student,DB: Phase 3: Complete Interview (POST /api/interviews/{id}/complete)
    Student->>Ctrl: POST /api/interviews/{id}/complete
    Ctrl->>Svc: completeInterview(userId, interviewId) [@Transactional]
    Svc->>DB: Load InterviewQuestions -> Answers -> Feedbacks, compute average * 10
    Svc->>DB: UPDATE interviews SET status='COMPLETED', completed_at=NOW(), overall_score=?
    Svc->>LB: updateLeaderboard(userId) [@Transactional]
    LB->>DB: Update user points (completed*100 + avgScore*10) and recalculate all ranks
    Svc-->>Student: 200 OK InterviewResultResponse
```

#### Deep Dive: How the Adaptive Follow-Up Algorithm Works ([`InterviewServiceImpl.java:416-458`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/service/impl/InterviewServiceImpl.java#L416-L458))
When a student submits an answer in `submitAnswer`:
1. After saving the `Feedback`, `InterviewServiceImpl` checks if the interview has fewer than 15 total questions (`existingIqs.size() >= 15`) and whether the current question's `orderNumber <= 10` (`lines 422-427`).
2. Look closely at **line 432** of [`InterviewServiceImpl.java:430-433`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/service/impl/InterviewServiceImpl.java#L430-L433):
   ```java
   // Only generate follow-up if the answer was reasonably long or if it's a core question
   if (answerText.trim().split("\\s+").length > 10 || currentIq.getOrderNumber() <= 3) {
       followUpStatus = true;
   }
   if (followUpStatus || true) { // Force for demo/feature completeness if within limits
   ```
   - Notice `if (followUpStatus || true)`! Because of `|| true`, the adaptive follow-up generator is **always invoked** for every answered question as long as `existingIqs.size() < 15` and `orderNumber <= 10`!
3. If Python's `/ai/questions/AdaptiveFollowUp` returns a follow-up question, Java saves a new `Question` (`aiGenerated = true`) and appends a new `InterviewQuestion` with `orderNumber = existingIqs.size() + 1` and `status = "PENDING"`, returning it inside `FeedbackResponse.nextQuestion` (`lines 268-274`) so the React frontend can dynamically insert it into the live interview queue!

---

### 6.4 Workflow 4: AI Study Recommendation Generation & Schema Mismatch Trace

```mermaid
sequenceDiagram
    autonumber
    actor Student as Student Browser
    participant Ctrl as RecommendationController
    participant Svc as RecommendationServiceImpl
    participant AI as AIClientServiceImpl
    participant Py as FastAPI (/ai/recommendations/generate)
    participant DB as MySQL 8.0

    Student->>Ctrl: POST /api/recommendations/generate
    Ctrl->>Svc: generateRecommendations(userId) [@Transactional]
    Svc->>DB: SELECT * FROM interviews WHERE user_id = ? AND status = 'COMPLETED'
    Loop Nested N+1 Loop over Interviews -> InterviewQuestions -> Answers -> Feedbacks
        Svc->>DB: SELECT * FROM interview_questions WHERE interview_id = ?
        Svc->>DB: SELECT * FROM answers WHERE interview_question_id = ?
        Svc->>DB: SELECT * FROM feedbacks WHERE answer_id = ?
        Note right of Svc: BUG 1 (Line 87): feedback.getOverallScore() < 60<br/>Score is 1..10, so < 60 is ALWAYS true!
    End
    Svc->>AI: generateRecommendations(userId, weakTopics, skillNames)
    AI->>Py: POST /ai/recommendations/generate {user_id, weak_topics, skills}
    Py-->>AI: 200 OK {"dsa_topics": [...], "interview_topics": [...], "weekly_roadmap": [...]}
    Note right of Svc: BUG 2 (Lines 103-106): Java reads aiResult.get("type"),<br/>aiResult.get("content"), aiResult.get("roadmap").<br/>All 3 keys are NULL!
    Svc->>DB: DELETE FROM recommendations WHERE user_id = ?
    Svc->>DB: INSERT INTO recommendations (user_id, type='GENERAL', content='Based on your...', roadmap=NULL)
    Svc-->>Student: 200 OK List<Recommendation> (always generic fallback!)
```

---

## 7. Database and Data Consistency Analysis

### 7.1 Complete Entity-Relationship Diagram (All 20 Entities + 2 Join Tables)

Every table below is verified directly from the `@Entity` classes in `com.interviewiq.entity`:

```mermaid
erDiagram
    USERS ||--o{ USER_ROLES : "has"
    ROLES ||--o{ USER_ROLES : "assigned_to"
    USERS ||--o{ RESUMES : "uploads"
    RESUMES ||--o{ RESUME_SKILLS : "contains"
    SKILLS ||--o{ RESUME_SKILLS : "mapped_in"
    USERS ||--o{ STUDENT_SKILLS : "unused_link"
    SKILLS ||--o{ STUDENT_SKILLS : "unused_link"
    USERS ||--o{ INTERVIEWS : "takes"
    INTERVIEWS ||--o{ INTERVIEW_QUESTIONS : "comprises"
    QUESTION_CATEGORIES ||--o{ QUESTIONS : "categorizes"
    QUESTIONS ||--o{ INTERVIEW_QUESTIONS : "asked_in"
    INTERVIEW_QUESTIONS ||--o| ANSWERS : "answered_by"
    ANSWERS ||--o| FEEDBACKS : "evaluated_by"
    USERS ||--o{ RECOMMENDATIONS : "receives"
    USERS ||--o| LEADERBOARD : "ranked_in"
    USERS ||--o{ NOTIFICATIONS : "notified_by"
    USERS ||--o{ REFRESH_TOKENS : "authenticates_with"
    USERS ||--o{ PASSWORD_RESET_TOKENS : "resets_password_with"

    USERS {
        bigint id PK
        varchar email UK "idx_user_email"
        varchar password
        varchar full_name
        varchar phone
        varchar profile_picture
        varchar branch
        int graduation_year
        varchar college
        varchar id_card_url
        boolean enabled
        datetime created_at
        datetime updated_at
    }
    ROLES {
        bigint id PK
        varchar name UK "ROLE_STUDENT, ROLE_ADMIN, etc."
    }
    RESUMES {
        bigint id PK
        bigint user_id FK "idx_resume_user"
        varchar file_name
        varchar file_path
        bigint file_size
        longtext extracted_text
        json parsed_data
        datetime uploaded_at
    }
    SKILLS {
        bigint id PK
        varchar name UK
        varchar category
    }
    INTERVIEWS {
        bigint id PK
        bigint user_id FK "idx_interview_user_status"
        varchar interview_type
        varchar status "SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED"
        varchar difficulty "EASY, MEDIUM, HARD"
        int duration_minutes
        double overall_score "0-100 scale"
        datetime scheduled_at
        boolean notified_30m
        datetime started_at
        datetime completed_at
        json communication_analysis "Unused"
        datetime created_at
    }
    INTERVIEW_QUESTIONS {
        bigint id PK
        bigint interview_id FK "idx_iq_interview"
        bigint question_id FK
        int order_number
        varchar status "PENDING, ANSWERED, SKIPPED"
    }
    QUESTIONS {
        bigint id PK
        bigint category_id FK "idx_question_category"
        text question_text
        varchar difficulty "idx_question_difficulty"
        text expected_answer
        boolean ai_generated
        datetime created_at
    }
    ANSWERS {
        bigint id PK
        bigint interview_question_id FK_UK
        longtext answer_text
        varchar audio_path "Unused"
        longtext transcript "Unused"
        int time_taken_seconds
        datetime submitted_at
    }
    FEEDBACKS {
        bigint id PK
        bigint answer_id FK_UK
        double relevance_score "1-10"
        double technical_score "1-10"
        double communication_score "1-10"
        double confidence_score "1-10"
        double overall_score "1-10"
        text strengths
        text weaknesses
        text suggestions
        datetime evaluated_at
    }
    LEADERBOARD {
        bigint id PK
        bigint user_id FK_UK
        int total_interviews
        double average_score
        double best_score
        int total_points "idx_leaderboard_points"
        int rank_position "idx_leaderboard_rank"
        datetime updated_at
    }
    PROCTORING_VIOLATIONS {
        bigint id PK
        bigint interview_id "No FK constraint!"
        bigint user_id "No FK constraint!"
        varchar type
        varchar description
        datetime timestamp
    }
```

### 7.2 Database Index Coverage vs. Missing Indexes Audit

| Table | Existing Indexes (Verified in `@Table(indexes = ...)` / `unique = true`) | Missing Indexes (Needed by Actual Repository Queries) | Impact of Missing Index |
| :--- | :--- | :--- | :--- |
| `users` | `idx_user_email (email)` (`UNIQUE`) | None | Optimal |
| `interviews` | `idx_interview_user_status (user_id, status)` | 1. `(status, notified_30m, scheduled_at)` for `NotificationScheduler`<br/>2. `(user_id, created_at DESC)` for `findByUserIdOrderByCreatedAtDesc` | Full table scan every 60s in `NotificationScheduler.checkUpcomingInterviews()`; filesort on user interview history |
| `interview_questions` | `idx_iq_interview (interview_id)` | `(interview_id, order_number)` | Filesort on every `findByInterviewIdOrderByOrderNumberAsc` |
| `questions` | `idx_question_category (category_id)`, `idx_question_difficulty (difficulty)` | `(category_id, difficulty)` composite index | `findRandomByCategoryAndDifficulty` (`ORDER BY RAND()`) scans entire category partition |
| `notifications` | `idx_notif_user (user_id)` | `(user_id, is_read)` and `(user_id, created_at DESC)` | Scans all notifications of a user to count unread (`countByUserIdAndIsReadFalse`) |
| `refresh_tokens` | `idx_rt_token (token)` (`UNIQUE`) | `(user_id)` FK index (created by Hibernate) | Good |
| `proctoring_violations` | Primary Key `(id)` only | `(interview_id)` and `(user_id)` | `findByInterviewId` and `deleteUser` perform full table scans on `proctoring_violations`! |

### 7.3 Foreign Keys, Orphan Entities, and Referential Integrity Gaps
1. **Unlinked Foreign Keys on Audit/Proctoring Entities**:
   - [`ProctoringViolation.java:21-22`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/entity/ProctoringViolation.java#L21-L22) stores raw `private Long interviewId;` and `private Long userId;` instead of `@ManyToOne` relationships. Consequently, MySQL creates **no foreign key constraints** and **no indexes** on those columns!
   - [`StudentFeedback.java:21-22`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/entity/StudentFeedback.java#L21-L22) similarly stores raw `private Long userId;` and `private Long interviewId;` without FK constraints or indexes.
2. **Dead Entity `StudentSkill`**:
   - [`StudentSkill.java`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/entity/StudentSkill.java) and [`User.java:108`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/entity/User.java#L108) (`@OneToMany(mappedBy = "user", cascade = CascadeType.ALL) private List<StudentSkill> skills`) create the `student_skills` table in MySQL, while [`Resume.java:61-68`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/entity/Resume.java#L61-L68) creates the `resume_skills` table. `ResumeServiceImpl` only writes to `resume_skills`; `student_skills` is permanently empty (0 rows).

---

## 8. Security Analysis

### 8.1 Comprehensive Endpoint & Threat Audit

| Security Domain | Implementation in Codebase | Status / Vulnerability Found | Severity |
| :--- | :--- | :--- | :--- |
| **Password Hashing** | `BCryptPasswordEncoder` (`SecurityConfig.java:64-66`) with random per-user salt | Implemented properly for storage, **but** [`AdminController.java:61-98`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/controller/AdminController.java#L61-L98) (`POST /api/admin/users`) returns the raw `User` entity in the HTTP response—leaking the `$2a$10$...` BCrypt hash! | **High** |
| **Unauthenticated ID Card Upload & Public Viewing** | [`AuthController.java:77-130`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/controller/AuthController.java#L77-L130) exposes `POST /api/auth/register/id-card` and `GET /api/auth/register/id-card/view/{filename:.+}` under `/api/auth/**`, which is `permitAll()` in `SecurityConfig.java:40`. | 1. **Unauthenticated Upload**: Anyone on the internet can upload arbitrary 10 MB files (`POST /api/auth/register/id-card`) without logging in or registering, filling up the server disk.<br/>2. **Unauthenticated PII Exposure**: Student college ID cards are served publicly without authentication via `/api/auth/register/id-card/view/{filename}`. | **High** |
| **Broken Role Hierarchy on `/api/admin/**`** | `SecurityConfig.java:45` requires `hasAuthority("ROLE_ADMIN")`, while `AdminController.java:20` declares `@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_MENTOR')")`. | `ROLE_MENTOR` and `ROLE_SUPER_ADMIN` are blocked by the filter chain before reaching `AdminController`. Worse, `POST /api/admin/violations` and `POST /api/admin/feedback` reject `ROLE_STUDENT` callers with `403 Forbidden`! | **Critical** |
| **IDOR (Insecure Direct Object Reference) Checks** | `InterviewServiceImpl` checks `!interview.getUser().getId().equals(userId)` (`lines 198, 224, 284, 317`). `NotificationController.markAsRead` checks `!n.getUser().getId().equals(userId)` (`line 37`). | Good ownership checks on `Interview` and `Notification`! However, `POST /api/admin/violations` (`AdminController.java:361`) accepts arbitrary `userId` and `interviewId` in the JSON body without verifying ownership against `Authentication`. | **Medium** |
| **File Upload Path Traversal & Content-Type Spoofing** | `ResumeServiceImpl.java:72` uses `file.getOriginalFilename().replaceAll("[^a-zA-Z0-9._-]", "_")`. `AuthController.java:97` extracts extension from `originalFilename`. | `ResumeServiceImpl` sanitizes filenames well, **but** `AuthController.uploadIdCard` (`line 77`) does **not** validate file content-type or extension—an attacker can upload `.html` or `.svg` with embedded XSS JavaScript and serve it via `/api/auth/register/id-card/view/{filename}`! | **High** |
| **Default Secrets & Seeded Accounts** | `application.yml:50` has a default `JWT_SECRET`. `DataSeeder.java:58-92` creates `admin@interviewiq.com` with password `Admin@123` on every boot. | If deployed without changing `admin@interviewiq.com`'s password, anyone who reads the repository has full `ROLE_ADMIN` + `ROLE_SUPER_ADMIN` access. | **Critical** |
| **Internal Service Authentication (`backend` $\leftrightarrow$ `ai-service`)** | `ai-service` (`main.py:16-22`) allows `allow_origins=["*"]` with zero API key or mTLS between `backend` and `ai-service`. | Acceptable only if `ai-service:8000` is isolated inside a private Docker network, **but** `docker-compose.yml:54` publishes `ports: - "8000:8000"` to the host machine! Anyone able to reach port 8000 can consume the organization's paid `GEMINI_API_KEY` quota directly. | **Medium** |
| **Password Reset Token Leakage in Logs** | [`AuthServiceImpl.java:155`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/service/impl/AuthServiceImpl.java#L155): `log.info("Generated password reset token for {}: {}", email, token);` | Logs plaintext password reset tokens to stdout/log aggregators (`INFO` level), allowing anyone with log read access to hijack accounts. | **Medium** |

---

## 9. Performance and Scalability Analysis

### 9.1 Quantitative Query & Latency Profile of Key Endpoints

Let's calculate the exact number of SQL queries executed per HTTP call based on the actual code paths we traced in Phase 1 (assuming a user has $I = 20$ completed interviews, $Q = 10$ questions per interview, $S = 12$ resume skills, and $U = 1,000$ users on the leaderboard):

| Endpoint | Controller & Service Method | SQL Queries Executed Today | SQL Queries After Optimization | Primary Bottleneck Today |
| :--- | :--- | :--- | :--- | :--- |
| `POST /api/auth/login` | `AuthController.login` $\rightarrow$ `AuthServiceImpl.login` | **4 queries** (`SELECT users` + `user_roles` in AuthMgr, `SELECT users` in service, `INSERT refresh_tokens`) | **2 queries** (1 `SELECT` + 1 `INSERT`) | Redundant `userRepository.findByEmail` after `authenticate()` already loaded user |
| `GET /api/dashboard` | `DashboardController.getDashboard` $\rightarrow$ `DashboardServiceImpl.getStudentDashboard` | **8 queries** (2 `SELECT users`, `COUNT interviews`, `COUNT completed`, `AVG score`, `SELECT recent 5`, `SELECT leaderboard`, `SELECT resume + skills`) | **1 query** (or **0 DB queries** when cached in Redis for 5 min) | Uncached dashboard aggregations + double `users` lookup |
| `GET /api/interviews/history` | `InterviewController.getHistory` $\rightarrow$ `InterviewServiceImpl.getHistory` | **$2 + I = 22$ queries** (2 `users` + 1 `interviews` + $20 \times$ `interview_questions`) | **1 query** (`SELECT i, COUNT(iq) ... GROUP BY i.id`) | N+1 query inside `.stream().map(...)` (`InterviewServiceImpl.java:359`) |
| `GET /api/interviews/{id}/results` | `InterviewController.getResults` $\rightarrow$ `InterviewServiceImpl.getResults` | **$3 + 3Q = 33$ queries** (2 `users` + 1 `interview` + 1 `iqs` + $10 \times$ `answers` + $10 \times$ `feedbacks` + $10 \times$ `questions`) | **1 query** (`JOIN FETCH` across `iq`, `question`, `answer`, `feedback`) | Triple nested N+1 lookup (`InterviewServiceImpl.java:320-340`) |
| `POST /api/interviews/{id}/complete` | `InterviewServiceImpl.completeInterview` $\rightarrow$ `LeaderboardServiceImpl.updateLeaderboard` | **$35 + U = 1,035$ queries!** (35 for interview score + **updates every row in `leaderboard`** at `LeaderboardServiceImpl.java:65-70`!) | **3 queries** (1 `JOIN FETCH`, 1 `UPDATE interviews`, 1 upsert `leaderboard` + SQL `RANK() OVER`) | `LeaderboardServiceImpl.java:65-70` loads **all** leaderboard rows and calls `saveAll` on every single completed interview! |
| `POST /api/recommendations/generate` | `RecommendationServiceImpl.generateRecommendations` | **$3 + I + 3(I \times Q) = 623$ queries!** | **2 queries** (1 aggregate query for weak categories + 1 batch insert) | Quadruple nested N+1 across *all* historical interviews (`RecommendationServiceImpl.java:77-94`) |
| `GET /api/admin/stats` | `AdminController.getDetailedStats` | **Full table dump** (`interviewRepository.findAll()` + `userRepository.findAll()` + lazy `getUser()` N+1) | **4 SQL `GROUP BY` / `COUNT` queries** | Loads 100% of `interviews` and `users` into JVM heap memory (`AdminController.java:126, 141`) |

### 9.2 Deep Dive: The Hidden $O(U)$ Leaderboard Rewrite Bottleneck

Inspect [`LeaderboardServiceImpl.java:64-70`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/service/impl/LeaderboardServiceImpl.java#L64-L70):
```java
// Recalculate ranks
List<Leaderboard> allEntries = leaderboardRepository.findAllByOrderByTotalPointsDesc();
for (int i = 0; i < allEntries.size(); i++) {
    allEntries.get(i).setRankPosition(i + 1);
}
leaderboardRepository.saveAll(allEntries);
```
- **What Happens Today**: Every time **any** student completes an interview (`completeInterview` $\rightarrow$ `updateLeaderboard`), Spring fetches the **entire `leaderboard` table** into memory, updates `rankPosition` on every row whose rank shifted, and executes individual `UPDATE leaderboard SET ... WHERE id = ?` statements (because `hibernate.jdbc.batch_size` is not configured)!
- **Why It Breaks Under Concurrency**: If Student A and Student B finish interviews at the same time, both transactions try to `UPDATE` overlapping sets of rows in `leaderboard`, causing MySQL InnoDB row-lock contention and `DeadlockLoserDataAccessException`!
- **How Production Systems Solve This**:
  - **Option A (SQL Window Function)**: Don't store `rank_position` as a mutable column updated on every write; compute it on read using MySQL 8.0's native `DENSE_RANK() OVER (ORDER BY total_points DESC)` window function (supported by `idx_leaderboard_points`)!
  - **Option B (Redis Sorted Set `ZADD` / `ZREVRANK`)**: Since Redis is already in `docker-compose.yml`, `ZADD leaderboard <totalPoints> <userId>` and `ZREVRANK leaderboard <userId>` compute global ranks in **$O(\log N)$ time (< 0.1 ms)** without touching MySQL!

### 9.3 What Changes at 10× Scale? (Hypothetical Workload Analysis)

**Assumptions for 10× Campus Recruitment Peak Load**:
- **Registered Students**: 50,000
- **Completed Interviews in DB**: 500,000 (`5,000,000` rows in `interview_questions` and `answers`)
- **Peak Concurrent Active Interviews**: 300 students simultaneously taking mock interviews during placement week (~50 `submitAnswer` requests/minute, ~300 dashboard/history requests/minute).

| Subsystem | Behavior at 10× Scale with Current Code | Evidence / Metric That Confirms Bottleneck | Exact Architectural Fix Required |
| :--- | :--- | :--- | :--- |
| **1. HikariCP Connection Pool (`max=20`)** | **Collapses first (within 30 seconds)**. 20 concurrent `submitAnswer` or `startInterview` calls hold all 20 DB connections during 10–30s Gemini HTTP calls. | `hikaricp_connections_active == 20`, `hikaricp_connections_pending > 0`, `SQLTransientConnectionException` in logs. | Move `aiClientService.*` HTTP calls **outside** `@Transactional` boundaries using `TransactionTemplate`. |
| **2. Python `ai-service` Uvicorn Workers** | [`ai-service/Dockerfile:22`](file:///D:/antigravity/interview-iq/ai-service/Dockerfile#L22) runs a **single Uvicorn worker** (`uvicorn main:app`), and all endpoints (`def analyze_resume`, `def evaluate_answer`) are synchronous `def` functions calling blocking `model.generate_content()`. | FastAPI request queue latency spikes to >45s as threadpool saturates; Gemini free-tier `429 ResourceExhausted` errors trigger fallback evaluation. | Run Uvicorn with `--workers 4`, use async `genai.GenerativeModel.generate_content_async()`, and add Resilience4j rate-limiter / circuit breaker. |
| **3. `LeaderboardServiceImpl.updateLeaderboard`** | Updating 50,000 leaderboard rows inside `completeInterview` takes ~15 seconds per completion and causes constant InnoDB deadlocks. | MySQL slow query log shows thousands of `UPDATE leaderboard` statements; `Deadlock found when trying to get lock` errors. | Replace stored `rank_position` loop with MySQL 8 `RANK() OVER (ORDER BY total_points DESC)` or Redis `ZSET`. |
| **4. `AdminController.getDetailedStats`** | Loading 500,000 `Interview` entities via `findAll()` consumes >1.5 GB heap per call $\rightarrow$ immediate `OutOfMemoryError` (`-Xmx512m` in [`backend/Dockerfile:18`](file:///D:/antigravity/interview-iq/backend/Dockerfile#L18)). | JVM GC pause time >5s; container killed with exit code `137` (`OOMKilled`) when admin opens Analytics page. | Replace Java stream aggregations with SQL `GROUP BY` projections in `InterviewRepository`. |
| **5. `QuestionRepository.findRandomByCategoryAndDifficulty`** | Uses `ORDER BY RAND() LIMIT :count` ([`QuestionRepository.java:24`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/repository/QuestionRepository.java#L24)), which copies matching rows into a temporary table and sorts them in $O(N \log N)$. | Acceptable up to ~5,000 questions; slow if question bank grows >100,000 rows. | Activate `@Cacheable("questions")` or sample random IDs in memory from cached category ID lists. |

---

## 10. Architectural Risks and Code Review Findings

Every finding below is verified directly against the repository source code and classified as a **Confirmed Bug**, **Security Vulnerability**, or **Architectural / Scalability Risk**.

| ID | Severity | Classification | Location (File & Lines) | Finding Summary & Root Cause | Concrete Fix |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **F-01** | **CRITICAL** | **Confirmed Bug** | [`RecommendationServiceImpl.java:103-106`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/service/impl/RecommendationServiceImpl.java#L103-L106) vs. [`ai-service/models/schemas.py:94-98`](file:///D:/antigravity/interview-iq/ai-service/models/schemas.py#L94-L98) | **Broken AI Recommendation Contract**: Python returns `dsa_topics`, `interview_topics`, `weekly_roadmap`, while Java looks up `type`, `content`, `roadmap`. Furthermore, `.toString()` on a `List` produces invalid JSON for MySQL's `JSON` column. 100% of recommendations save static fallback text and `roadmap = null`. | Parse `dsa_topics`, `interview_topics`, and serialize `weekly_roadmap` via `objectMapper.writeValueAsString(aiResult.get("weekly_roadmap"))`. |
| **F-02** | **CRITICAL** | **Confirmed Bug** | [`SecurityConfig.java:45`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/config/SecurityConfig.java#L45) vs. [`AdminController.java:20, 361, 374`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/controller/AdminController.java#L20) | **Broken Role Access & Student Proctoring 403s**: Filter chain restricts `/api/admin/**` to `ROLE_ADMIN` only (blocking `ROLE_MENTOR` and `ROLE_SUPER_ADMIN`), and student endpoints `POST /api/admin/violations` and `POST /api/admin/feedback` live inside `AdminController`, rejecting `ROLE_STUDENT` requests with `403 Forbidden`. | Update `SecurityConfig.java:45` to `.hasAnyAuthority("ROLE_ADMIN", "ROLE_SUPER_ADMIN", "ROLE_MENTOR")` and move `/violations` and `/feedback` to `InterviewController` (or permit `ROLE_STUDENT` on those two paths). |
| **F-03** | **CRITICAL** | **Confirmed Bug** | [`AdminController.java:244-292`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/controller/AdminController.java#L244-L292) | **`TransactionRequiredException` on `DELETE /api/admin/users/{id}`**: `deleteUser` calls `@Modifying` query `refreshTokenRepository.revokeAllByUserId(id)` (`line 251`) and deletes across 9 tables without `@Transactional`. Throws `TransactionRequiredException` at runtime. | Move `deleteUser` logic into `UserService` annotated with `@Transactional`. |
| **F-04** | **CRITICAL** | **Scalability Bug** | [`InterviewServiceImpl.java:91, 216`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/service/impl/InterviewServiceImpl.java#L91), [`ResumeServiceImpl.java:61`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/service/impl/ResumeServiceImpl.java#L61), [`RecommendationServiceImpl.java:58`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/service/impl/RecommendationServiceImpl.java#L58) | **HikariCP Connection Pool Starvation**: `@Transactional` wraps synchronous `RestTemplate` calls (up to 60s timeout) to `ai-service`. 20 concurrent AI requests exhaust all 20 DB connections and freeze the entire application. | Remove `@Transactional` from methods making external HTTP calls; wrap only the DB read/write blocks in `TransactionTemplate`. |
| **F-05** | **HIGH** | **Confirmed Bug** | [`RecommendationServiceImpl.java:87`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/service/impl/RecommendationServiceImpl.java#L87) | **Score Scale Mismatch (`< 60` on a `1–10` scale)**: `feedback.getOverallScore() < 60` compares a 1–10 score against 60, causing 100% of answered question categories to be classified as weak topics even when the student scored 10/10. | Change threshold to `feedback.getOverallScore() < 6.0`. |
| **F-06** | **HIGH** | **Confirmed Bug** | [`GlobalExceptionHandler.java:71-75`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/exception/GlobalExceptionHandler.java#L71-L75) | **Catch-All Exception Handler Swallows Security & Multipart Exceptions**: `@ExceptionHandler(Exception.class)` intercepts `AccessDeniedException`, `AccountStatusException` (`DisabledException`), and `MaxUploadSizeExceededException`, returning `500 Internal Server Error` instead of `403` / `401` / `413`. | Add explicit `@ExceptionHandler` methods for `AccessDeniedException` (403), `AccountStatusException` (401), and `MaxUploadSizeExceededException` (413). |
| **F-07** | **HIGH** | **Security Vulnerability** | [`AdminController.java:61-98`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/controller/AdminController.java#L61-L98) | **Password Hash Exposure & Unvalidated Entity Return**: `POST /api/admin/users` returns the raw `User` entity (exposing the BCrypt `password` hash in JSON) and accepts a `Map<String, String>` without `@Valid`. | Add `@JsonIgnore` on `User.password` and return `UserResponse` DTO via `mapUserToResponse(user)`. |
| **F-08** | **HIGH** | **Security Vulnerability** | [`AuthController.java:77-130`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/controller/AuthController.java#L77-L130) & [`SecurityConfig.java:40`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/config/SecurityConfig.java#L40) | **Unauthenticated File Upload, Stored XSS & Public PII Exposure**: `/api/auth/register/id-card` allows unauthenticated uploads without content-type validation (allowing `.html`/`.svg` XSS), and `/api/auth/register/id-card/view/{filename}` serves student ID cards publicly without authentication. | Restrict allowed MIME types to `image/jpeg`, `image/png`, `image/webp`; require admin/owner auth to view ID cards; rate-limit uploads. |
| **F-09** | **HIGH** | **Confirmed Bug** | [`InterviewServiceImpl.java:432`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/service/impl/InterviewServiceImpl.java#L432) | **Hardcoded `if (followUpStatus || true)` Debug Condition**: Line 432 forces adaptive follow-up generation on every question regardless of whether `followUpStatus` was set to `true` by the word-count heuristic on line 430. | Remove `|| true` so the word-count/core-question heuristic actually controls follow-up generation. |
| **F-10** | **HIGH** | **Scalability Risk** | [`AdminController.java:126, 141, 281`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/controller/AdminController.java#L126), [`LeaderboardServiceImpl.java:65-70`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/service/impl/LeaderboardServiceImpl.java#L65-L70), [`QuestionServiceImpl.java:50`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/service/impl/QuestionServiceImpl.java#L50) | **Full-Table Memory Dumps & $O(N)$ Table Rewrites**: `findAll().stream().filter(...)` in `AdminController` and `QuestionServiceImpl`; full `leaderboard` table rewrite on every `completeInterview`. | Replace with targeted SQL `WHERE` / `GROUP BY` queries and SQL `RANK() OVER` window functions. |
| **F-11** | **HIGH** | **Scalability Risk** | [`InterviewServiceImpl.java:313-366`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/service/impl/InterviewServiceImpl.java#L313-L366), [`RecommendationServiceImpl.java:77-94`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/service/impl/RecommendationServiceImpl.java#L77-L94) | **Severe N+1 Query Cascades**: Fetching interview history, interview results, and recommendations triggers 20 to 600+ individual SQL queries per request. | Add `JOIN FETCH` JPQL queries on `InterviewQuestionRepository` and `countByInterviewId`. |
| **F-12** | **MEDIUM** | **Concurrency Bug** | [`InterviewServiceImpl.java:216-276`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/service/impl/InterviewServiceImpl.java#L216-L276) | **Non-Idempotent Answer Submission**: Double-clicking "Submit Answer" causes two concurrent requests to pass the initial read, call Gemini twice, and crash with a `500` unique constraint violation on `answers.interview_question_id`. | Guard with `if ("ANSWERED".equals(iq.getStatus())) throw new BadRequestException(...)` and add `@Version` optimistic locking on `InterviewQuestion`. |
| **F-13** | **MEDIUM** | **Configuration Drift** | [`RedisConfig.java:18-52`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/config/RedisConfig.java#L18-L52), [`WebSocketConfig.java:9-25`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/config/WebSocketConfig.java#L9-L25) | **Configured-Only Redis & WebSockets**: Redis and WebSocket beans are initialized at startup, but zero `@Cacheable` or `@MessageMapping` annotations exist in the codebase. | Add `@Cacheable` / `@CacheEvict` to `DashboardServiceImpl`, `LeaderboardServiceImpl`, and `QuestionServiceImpl`. |
| **F-14** | **MEDIUM** | **Performance Waste** | [`JwtAuthenticationFilter.java:41`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/security/JwtAuthenticationFilter.java#L41) + Controller `getCurrentUserId` | **Duplicate User DB Lookup Per Request**: Every authenticated request queries `SELECT * FROM users WHERE email = ?` twice (once in the filter, once in the controller). | Return a custom `UserPrincipal` (holding `userId`, `email`, `roles`) from `CustomUserDetailsService` and read `userId` directly from `Authentication.getPrincipal()`. |
| **F-15** | **MEDIUM** | **Dead Code / Schema Drift** | [`AdminController.java:297-347`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/controller/AdminController.java#L297-L347), [`StudentSkill.java`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/entity/StudentSkill.java), [`Answer.java:31-35`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/entity/Answer.java#L31-L35) | **Disconnected Admin Governance & Unused Tables/Columns**: `SystemConfig`, `AdminPrompt`, and `InterviewTemplate` are managed via `AdminController` and seeded by `DataSeeder`, but never read by interview/AI services; `student_skills` table and `Answer.audioPath`/`transcript` are never written. | Wire `SystemConfig` (`AI_FOLLOWUP_ENABLED`, `MAX_QUESTIONS_PER_INTERVIEW`) and `AdminPrompt` into `InterviewServiceImpl` / `AIClientServiceImpl`, and remove dead `StudentSkill`. |
| **F-16** | **LOW** | **Quality / Ops Gap** | `backend/src/test` (missing), [`Dockerfile:7`](file:///D:/antigravity/interview-iq/backend/Dockerfile#L7), [`application.yml:21, 56`](file:///D:/antigravity/interview-iq/backend/src/main/resources/application.yml#L21) | **Zero Automated Tests, `ddl-auto: update`, & Open-in-View Warning**: No JUnit/MockMvc/Testcontainers tests exist; `ddl-auto: update` is used instead of Flyway; `spring.jpa.open-in-view` is left enabled (`true` by default). | Set `spring.jpa.open-in-view: false`, add Flyway migrations, and add unit/integration tests for core services. |

---

## 11. Recommended Improvements and Priorities

To evolve InterviewIQ from a functional prototype into a hardened production system without over-engineering, execute improvements in four prioritized phases:

### Priority 0 (P0): Immediate Correctness & Security Fixes (1–2 Days)
1. **Fix `RecommendationServiceImpl` AI Response Mapping & Weak-Topic Threshold (`F-01`, `F-05`)**:
   - Change `feedback.getOverallScore() < 60` to `< 6.0` at [`RecommendationServiceImpl.java:87`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/service/impl/RecommendationServiceImpl.java#L87).
   - Map `dsa_topics`, `interview_topics`, and `weekly_roadmap` properly from `aiResult`, and serialize `weekly_roadmap` with `objectMapper.writeValueAsString(...)` (`lines 103-114`).
2. **Fix `/api/admin/**` Authorization Mismatch & Proctoring/Feedback Endpoints (`F-02`)**:
   - Update [`SecurityConfig.java:45`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/config/SecurityConfig.java#L45) to `.requestMatchers("/api/admin/violations", "/api/admin/feedback").authenticated()` (placed **before** `/api/admin/**`) and `.requestMatchers("/api/admin/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_SUPER_ADMIN", "ROLE_MENTOR")`.
3. **Fix `GlobalExceptionHandler` & `AdminController.deleteUser` (`F-03`, `F-06`, `F-07`)**:
   - Add `@Transactional` to `deleteUser` (ideally moved into `UserService`), add `@JsonIgnore` to `User.password`, and add `@ExceptionHandler(AccessDeniedException.class)` returning `403 Forbidden`.
4. **Lock Down ID Card Upload & Viewing (`F-08`)**:
   - Validate image MIME types (`image/jpeg`, `image/png`, `image/webp`) in `AuthController.uploadIdCard` and require authentication to view uploaded ID cards.

### Priority 1 (P1): Database Connection Pool & Query Optimization (2–3 Days)
1. **Decouple `@Transactional` from `RestTemplate` Calls (`F-04`)**:
   - Refactor `startInterview`, `submitAnswer`, `uploadResume`, and `generateRecommendations` so `aiClientService` HTTP calls execute **outside** database transactions.
2. **Eliminate N+1 Queries & Full-Table Scans (`F-10`, `F-11`, `F-14`)**:
   - Add `JOIN FETCH` queries to `InterviewQuestionRepository`, replace `AdminController.getDetailedStats` in-memory stream filtering with SQL `GROUP BY` queries, and store `userId` inside a custom `UserPrincipal` so controllers stop querying `userRepository.findByEmail(auth.getName())`.

### Priority 2 (P2): Activate Existing Infrastructure & Admin Controls (2–3 Days)
1. **Activate Redis Caching (`F-13`)**:
   - Annotate `DashboardServiceImpl.getStudentDashboard`, `LeaderboardServiceImpl.getLeaderboard`, and `QuestionServiceImpl.getQuestions` with `@Cacheable` (`dashboard`, `leaderboard`, `questions`—matching the exact cache names already configured in [`RedisConfig.java:44-46`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/config/RedisConfig.java#L44-L46)!), and add `@CacheEvict(value = {"dashboard", "leaderboard"}, allEntries = true)` when an interview completes.
2. **Wire `SystemConfig` & `AdminPrompt` into Runtime Services (`F-15`)**:
   - Read `AI_FOLLOWUP_ENABLED` and `MAX_QUESTIONS_PER_INTERVIEW` from `SystemConfigRepository` inside `InterviewServiceImpl` instead of hardcoding `15` and `|| true`.

### Priority 3 (P3): Production Hardening & Observability (1 Week)
1. **Add Flyway Migrations & Disable `open-in-view` (`F-16`)**:
   - Set `spring.jpa.open-in-view: false` and `spring.jpa.hibernate.ddl-auto: validate` with a baseline `V1__init_schema.sql` migration.
2. **Add Automated Testing Suite**:
   - Write JUnit 5 + Mockito unit tests for `InterviewServiceImpl`, `AuthServiceImpl`, and `RecommendationServiceImpl`, plus `@WebMvcTest` security tests for `AdminController` and `AuthController`.

---

## 12. Learning Prerequisites and Study Roadmap

If you are studying this codebase to master backend engineering, follow this dependency-ordered learning path so every concept builds naturally on the previous one:

```mermaid
flowchart TD
    M1["Stage 1: HTTP, REST & Spring MVC<br/>(Controllers, ApiResponse, DTOs, @Valid, GlobalExceptionHandler)"]
    M2["Stage 2: IoC, DI & Configuration<br/>(@Service, @RequiredArgsConstructor, application.yml, DataSourceConfig)"]
    M3["Stage 3: Relational Modeling & JPA/Hibernate<br/>(Entities, @ManyToOne/@ManyToMany, Lazy vs Eager, Auditing)"]
    M4["Stage 4: Spring Data Repositories & SQL Tuning<br/>(Derived Queries, @Query JPQL, @Modifying, N+1 & JOIN FETCH, Indexes)"]
    M5["Stage 5: Transactions & Concurrency<br/>(@Transactional AOP Proxies, HikariCP Pool, Locking, Virtual Threads)"]
    M6["Stage 6: Spring Security & JWT Architecture<br/>(SecurityFilterChain, OncePerRequestFilter, BCrypt, Access vs Refresh Tokens)"]
    M7["Stage 7: Microservice Integration & Resilience<br/>(RestTemplate, Timeouts, Multi-Tier Fallbacks, Caching & Scheduling)"]

    M1 --> M2 --> M3 --> M4 --> M5 --> M6 --> M7
```

---

## 13. Hands-On Exercises

Use these **10 safe, concrete exercises** in your local development environment to turn passive reading into active backend engineering skill.

---

### Exercise 1: Observe and Eliminate the N+1 Query Cascade in `getHistory`
- **Objective**: See the N+1 query problem in live SQL logs and fix it down to a single query.
- **Files to Inspect**: [`InterviewServiceImpl.java:355-366`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/service/impl/InterviewServiceImpl.java#L355-L366), [`InterviewQuestionRepository.java`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/repository/InterviewQuestionRepository.java).
- **Task**:
  1. Ensure `spring.jpa.show-sql: true` is enabled in `application.yml`.
  2. Call `GET /api/interviews/history` as `student@interviewiq.com` and count how many `SELECT ... FROM interview_questions WHERE interview_id = ?` statements print in the console.
  3. Add `int countByInterviewId(Long interviewId);` (or a `GROUP BY` query) to `InterviewQuestionRepository`, update `InterviewServiceImpl.getHistory`, and verify that the full entity list of `interview_questions` is no longer loaded into memory.

### Exercise 2: Fix the Broken Recommendation Contract (`F-01` & `F-05`)
- **Objective**: Debug and repair a real microservice contract mismatch between Spring Boot and FastAPI.
- **Files to Inspect**: [`RecommendationServiceImpl.java:85-118`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/service/impl/RecommendationServiceImpl.java#L85-L118), [`ai-service/models/schemas.py:94-98`](file:///D:/antigravity/interview-iq/ai-service/models/schemas.py#L94-L98), [`ai-service/routers/recommendation_router.py:26-72`](file:///D:/antigravity/interview-iq/ai-service/routers/recommendation_router.py#L26-L72).
- **Task**:
  1. Call `POST /api/recommendations/generate` and inspect the returned JSON (`roadmap` will be `null`).
  2. Fix line 87 (`feedback.getOverallScore() < 6.0`).
  3. Inject `ObjectMapper` into `RecommendationServiceImpl`, extract `dsa_topics`, `interview_topics`, and serialize `weekly_roadmap` using `objectMapper.writeValueAsString(aiResult.get("weekly_roadmap"))`.
  4. Re-test `POST /api/recommendations/generate` and verify that the 4-week JSON roadmap is persisted and returned to the UI.

### Exercise 3: Repair the Role Authorization Conflict & Student Proctoring Endpoint (`F-02`)
- **Objective**: Understand how Spring Security's HTTP filter chain interacts with method-level `@PreAuthorize`.
- **Files to Inspect**: [`SecurityConfig.java:39-48`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/config/SecurityConfig.java#L39-L48), [`AdminController.java:19-20, 361-383`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/controller/AdminController.java#L19-L20), [`GlobalExceptionHandler.java`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/exception/GlobalExceptionHandler.java).
- **Task**:
  1. Log in as `mentor@interviewiq.com` (`Mentor@123`) and call `GET /api/admin/stats`. Observe the `403 Forbidden` response caused by `SecurityConfig.java:45`.
  2. Log in as `student@interviewiq.com` (`Student@123`) and call `POST /api/admin/violations`. Observe the failure.
  3. Update `SecurityConfig.java` and `AdminController.java` so `ROLE_MENTOR` can access read-only admin analytics, and `ROLE_STUDENT` can submit proctoring violations and platform feedback.

### Exercise 4: Eliminate the Double `SELECT * FROM users` Per Authenticated Request (`F-14`)
- **Objective**: Customize Spring Security's `UserDetails` to carry domain metadata (`userId`).
- **Files to Inspect**: [`CustomUserDetailsService.java`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/security/CustomUserDetailsService.java), [`DashboardController.java:24-27`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/controller/DashboardController.java#L24-L27).
- **Task**:
  1. Create a `CustomUserPrincipal` class implementing `UserDetails` that includes `private final Long id;`.
  2. Return `CustomUserPrincipal` from `CustomUserDetailsService.loadUserByUsername`.
  3. Update `getCurrentUserId(Authentication auth)` in controllers to cast `((CustomUserPrincipal) auth.getPrincipal()).getId()`, eliminating the redundant `userRepository.findByEmail(auth.getName())` query on every API call.

### Exercise 5: Decouple `@Transactional` from Slow AI Calls (`F-04`)
- **Objective**: Prevent HikariCP connection pool starvation during external HTTP calls.
- **Files to Inspect**: [`InterviewServiceImpl.java:216-276`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/service/impl/InterviewServiceImpl.java#L216-L276).
- **Task**:
  1. Inject `TransactionTemplate` into `InterviewServiceImpl`.
  2. Remove `@Transactional` from `submitAnswer`.
  3. Use `transactionTemplate.execute(...)` around Step 1 (reading `InterviewQuestion` and verifying ownership) and Step 3 (saving `Answer`, `Feedback`, and follow-up `InterviewQuestion`), while keeping Step 2 (`aiClientService.evaluateAnswer` and `aiClientService.generateFollowUpQuestion`) completely outside any database transaction!

### Exercise 6: Activate Redis Caching on Dashboard & Leaderboard (`F-13`)
- **Objective**: Connect the existing `RedisCacheManager` (`RedisConfig.java`) to actual service methods.
- **Files to Inspect**: [`RedisConfig.java:33-51`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/config/RedisConfig.java#L33-L51), [`DashboardServiceImpl.java:32`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/service/impl/DashboardServiceImpl.java#L32), [`LeaderboardServiceImpl.java:24, 34`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/service/impl/LeaderboardServiceImpl.java#L24).
- **Task**:
  1. Annotate `LeaderboardServiceImpl.getLeaderboard(int limit)` with `@Cacheable(value = "leaderboard", key = "#limit")`.
  2. Annotate `LeaderboardServiceImpl.updateLeaderboard(Long userId)` with `@CacheEvict(value = "leaderboard", allEntries = true)`.
  3. Call `GET /api/leaderboard` twice and verify in the console logs that the second request executes **zero** SQL queries against `leaderboard`!

### Exercise 7: Make Answer Submission Idempotent Against Double-Clicks (`F-12`)
- **Objective**: Protect stateful workflows against concurrent duplicate requests.
- **Files to Inspect**: [`InterviewQuestion.java`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/entity/InterviewQuestion.java), [`InterviewServiceImpl.java:216-235`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/service/impl/InterviewServiceImpl.java#L216-L235).
- **Task**:
  1. Add a check at the start of `submitAnswer`: `if ("ANSWERED".equals(iq.getStatus())) { throw new BadRequestException("This question has already been answered"); }`.
  2. Add `@Version private Long version;` to `InterviewQuestion.java` so concurrent race requests fail fast with `ObjectOptimisticLockingFailureException` (mapped to `409 Conflict` in `GlobalExceptionHandler`) *before* calling Gemini.

### Exercise 8: Wire Dynamic `SystemConfig` into `InterviewServiceImpl` (`F-15`)
- **Objective**: Turn a disconnected admin CRUD table into live runtime feature flags.
- **Files to Inspect**: [`DataSeeder.java:357-368`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/config/DataSeeder.java#L357-L368), [`SystemConfigRepository.java`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/repository/SystemConfigRepository.java), [`InterviewServiceImpl.java:416-435`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/service/impl/InterviewServiceImpl.java#L416-L435).
- **Task**:
  1. Inject `SystemConfigRepository` into `InterviewServiceImpl`.
  2. Read `"AI_FOLLOWUP_ENABLED"` and `"MAX_QUESTIONS_PER_INTERVIEW"` from `SystemConfigRepository.findByConfigKey(...)` inside `submitAnswer` instead of hardcoding `15` and `|| true`.

### Exercise 9: Optimize `NotificationScheduler` with a Targeted Composite Index
- **Objective**: Replace a full-table scan + Java loop filter with an index-backed SQL range query.
- **Files to Inspect**: [`NotificationScheduler.java:29-42`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/service/NotificationScheduler.java#L29-L42), [`Interview.java:13-15`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/entity/Interview.java#L13-L15), [`InterviewRepository.java`](file:///D:/antigravity/interview-iq/backend/src/main/java/com/interviewiq/repository/InterviewRepository.java).
- **Task**:
  1. Add `List<Interview> findByStatusAndNotified30mFalseAndScheduledAtBetween(String status, LocalDateTime start, LocalDateTime end);` to `InterviewRepository`.
  2. Add `@Index(name = "idx_interview_sched_reminder", columnList = "status, notified_30m, scheduled_at")` to `Interview.java`.
  3. Update `NotificationScheduler.checkUpcomingInterviews()` to use the new repository method.

### Exercise 10: Write Your First Unit Test for `InterviewServiceImpl`
- **Objective**: Add automated test coverage using JUnit 5 and Mockito.
- **Task**:
  1. Create `backend/src/test/java/com/interviewiq/service/InterviewServiceImplTest.java`.
  2. Use `@ExtendWith(MockitoExtension.class)` with `@Mock` repositories and `@InjectMocks InterviewServiceImpl`.
  3. Write tests verifying:
     - `startInterview` falls back to database questions (`useFallbackQuestions`) when `aiClientService.generateQuestions` returns an empty list.
     - `submitAnswer` throws `BadRequestException("Unauthorized")` when `iq.getInterview().getUser().getId()` does not match `userId`.

---

## 14. Project-Specific Interview Questions and Answer Outlines

If you present **InterviewIQ** on your resume in a technical interview, a Senior Backend Engineer or Hiring Manager will probe your understanding using questions like these. Study both the question and the senior-level answer outline:

1. **Q1 (Architecture): Why did you split InterviewIQ into a Java Spring Boot service and a Python FastAPI service instead of building a single monolith?**
   - *Answer Outline*: Explain the domain split: Spring Boot handles stateful, security-critical, transactional workloads (JWT/RBAC security, MySQL JPA persistence, user/admin workflows, scheduled reminders), whereas Python provides native access to `google-generativeai`, `pdfplumber`, and `python-docx`. Acknowledge the trade-off: network serialization overhead (e.g., Base64 encoding PDFs) and distributed failure modes, which we mitigated using a two-tier fallback chain (Python heuristic fallbacks + Java DB question bank fallback).
2. **Q2 (Database & Concurrency): You enabled Java 21 Virtual Threads (`spring.threads.virtual.enabled: true`). Does that mean your backend can handle 5,000 concurrent `submitAnswer` requests without any bottleneck?**
   - *Answer Outline*: **No!** Explain why: Virtual threads prevent OS thread starvation in Tomcat when blocking on `RestTemplate`, **but** `submitAnswer` is annotated with `@Transactional`. Every virtual thread entering `@Transactional` borrows a physical JDBC connection from HikariCP (`maximum-pool-size: 20`). Therefore, the 21st concurrent request still blocks waiting for a DB connection, and after 30s (`connection-timeout`) throws `SQLTransientConnectionException`. The fix is moving the blocking `RestTemplate` call to `ai-service` *outside* the `@Transactional` boundary using `TransactionTemplate`.
3. **Q3 (Spring Security): Walk me through what happens when a request with `Authorization: Bearer <jwt>` hits `GET /api/dashboard`, and what happens if the token is expired.**
   - *Answer Outline*: Trace `JwtAuthenticationFilter.doFilterInternal` $\rightarrow$ `jwtTokenProvider.validateToken(jwt)`. If valid, extracts email (`sub`), loads `UserDetails` via `CustomUserDetailsService`, and sets `UsernamePasswordAuthenticationToken` in `SecurityContextHolder`. If expired, `validateToken` catches `JwtException` and returns `false`, leaving `SecurityContextHolder` empty. Because `/api/dashboard` requires `.authenticated()`, Spring's `ExceptionTranslationFilter` invokes `JwtAuthenticationEntryPoint.commence()`, which writes a `401 Unauthorized` JSON response (`ApiResponse`).
4. **Q4 (Spring Security Pitfall): Why do you need both `JwtAuthenticationEntryPoint` and `@RestControllerAdvice` (`GlobalExceptionHandler`)?**
   - *Answer Outline*: `@RestControllerAdvice` only intercepts exceptions thrown *inside* `DispatcherServlet` (Controller/Service layers). `JwtAuthenticationFilter` and URL authorization checks run in the **Servlet Filter Chain** *before* `DispatcherServlet` is ever reached. Therefore, filter-level `AuthenticationException`s must be handled by `AuthenticationEntryPoint`.
5. **Q5 (Authentication Design): Why does InterviewIQ use both a JWT access token (24h) and a MySQL `RefreshToken` (7d)? What is the trade-off of looking up the user in `JwtAuthenticationFilter` on every request?**
   - *Answer Outline*: Stateless JWTs cannot be easily revoked before expiry if stolen, whereas `RefreshToken` is stored in MySQL (`refresh_tokens.revoked`) so `POST /api/auth/logout` can revoke session continuation immediately via `@Modifying revokeAllByUserId`. Note the current flaw: querying `users` in `JwtAuthenticationFilter` AND again in controller `getCurrentUserId()` causes 2 DB queries per request; storing `userId` and roles in a custom `UserPrincipal` or JWT claims eliminates this overhead.
6. **Q6 (Hibernate & JPA): Explain the difference between `@ManyToOne` default fetching and `@OneToMany` default fetching in JPA, and how `InterviewQuestion.java` customized it.**
   - *Answer Outline*: By JPA specification, `@ManyToOne` and `@OneToOne` default to `FetchType.EAGER`, while `@OneToMany` and `@ManyToMany` default to `FetchType.LAZY`. In `InterviewQuestion.java`, `@ManyToOne(fetch = FetchType.LAZY)` was explicitly set on `interview` and `question` so loading an `InterviewQuestion` does not automatically join `interviews` and `questions`.
7. **Q7 (Hibernate Internals): In `InterviewQuestion.java`, `@OneToOne(mappedBy = "interviewQuestion")` is on `answer`. Can Hibernate lazy-load the `mappedBy` side of an optional `@OneToOne`?**
   - *Answer Outline*: **No** (without bytecode enhancement). Because the foreign key column `interview_question_id` lives in the `answers` table (not `interview_questions`), Hibernate has no way of knowing while reading a row from `interview_questions` whether `iq.answer` is `null` or should be populated with a lazy proxy unless it queries the `answers` table!
8. **Q8 (SQL & N+1): Where does the worst N+1 query problem occur in InterviewIQ, and how would you fix it?**
   - *Answer Outline*: Point to `RecommendationServiceImpl.generateRecommendations` (and `InterviewServiceImpl.getResults`/`getHistory`), which loops over `interviews` $\rightarrow$ `interview_questions` $\rightarrow$ `answers` $\rightarrow$ `feedbacks` $\rightarrow$ `question.category`, executing $O(I \times Q)$ queries (600+ queries for 20 interviews). Fix it with a single JPQL `JOIN FETCH` query (`SELECT iq FROM InterviewQuestion iq JOIN FETCH iq.question q LEFT JOIN FETCH q.category LEFT JOIN FETCH iq.answer a LEFT JOIN FETCH a.feedback WHERE iq.interview.id = :id`) or an aggregate SQL query returning weak categories directly.
9. **Q9 (Database Indexing): `Interview.java` defines `@Index(name = "idx_interview_user_status", columnList = "user_id, status")`. Why does `NotificationScheduler`'s `findByStatus("SCHEDULED")` perform a full table scan despite `status` being in that index?**
   - *Answer Outline*: Explain the **B-Tree Leftmost Prefix Rule**: a composite index on `(user_id, status)` is sorted first by `user_id`, and only within the same `user_id` is it sorted by `status`. A query with `WHERE status = 'SCHEDULED'` (without `user_id = ?`) cannot traverse the B-Tree and must scan the entire table.
10. **Q10 (Data Consistency & Scalability): What happens in `LeaderboardServiceImpl.updateLeaderboard` when a student finishes an interview, and why will it fail when 10,000 students use the platform?**
    - *Answer Outline*: After updating the student's `Leaderboard` row, `updateLeaderboard` calls `findAllByOrderByTotalPointsDesc()`, iterates over every user in Java to set `rankPosition = i + 1`, and calls `saveAll(allEntries)`. At 10,000 users, every single completed interview executes 10,000 `UPDATE` statements inside a transaction, causing massive latency and InnoDB deadlocks. Replace it with MySQL 8's `DENSE_RANK() OVER (ORDER BY total_points DESC)` on read, or a Redis Sorted Set (`ZADD`/`ZREVRANK`).
11. **Q11 (Cloud Deployment): Walk through `DataSourceConfig.java`. Why was a custom `@Bean @Primary DataSource` written instead of relying on `spring.datasource.url`?**
    - *Answer Outline*: Cloud PaaS providers (Render, Railway, Heroku, Aiven) often provide `DATABASE_URL` in URI format (`mysql://user:pass@host:port/db`), whereas the MySQL JDBC driver (`Connector/J`) requires a `jdbc:mysql://host:port/db` prefix and separate `username`/`password` properties. `DataSourceConfig` parses `mysql://` URIs via `java.net.URI`, URL-decodes credentials, strips incompatible query parameters (`ssl-mode`), and appends `sslMode=REQUIRED` for cloud hosts.
12. **Q12 (Resilience & Fallbacks): What happens in InterviewIQ if the Google Gemini API key runs out of quota (`429 Too Many Requests`) or the Python `ai-service` container crashes in the middle of an interview?**
    - *Answer Outline*: Trace the two-tier fallback architecture:
      1. If Gemini fails (`429`/`500`), FastAPI catches the exception and runs deterministic Python fallbacks (`fallback_evaluation` using word-count/keyword heuristics, `get_fallback_questions`, `fallback_resume_analysis`).
      2. If the FastAPI container itself is unreachable (`ConnectionRefused`/`SocketTimeoutException`), `AIClientServiceImpl` catches `Exception` and returns fallback maps, and `InterviewServiceImpl.useFallbackQuestions` pulls random questions from MySQL (`findRandomByCategoryAndDifficulty`) or seeds default questions (`ensureDefaultQuestionsExist`).
13. **Q13 (Concurrency & Idempotency): What happens if a user double-clicks "Submit Answer" (`POST /api/interviews/answer`)?**
    - *Answer Outline*: Both requests read `InterviewQuestion` with `status = "PENDING"`, both invoke the AI evaluator (~5s), and both attempt to insert a row into `answers`. Because `answers.interview_question_id` has a `UNIQUE` constraint (`@OneToOne`), the second transaction fails at commit time with `DataIntegrityViolationException` (`500 Internal Server Error`). Fix: check `if ("ANSWERED".equals(iq.getStatus()))` and add `@Version` optimistic locking on `InterviewQuestion`.
14. **Q14 (Spring Transactions): Why does `DELETE /api/admin/users/{id}` (`AdminController.deleteUser`) throw `TransactionRequiredException` at runtime?**
    - *Answer Outline*: `AdminController.deleteUser` calls `refreshTokenRepository.revokeAllByUserId(id)`, which is a `@Modifying @Query("UPDATE ...")` method. JPA mandates an active transaction for any `UPDATE`/`DELETE` JPQL query, and neither `AdminController.deleteUser` nor `RefreshTokenRepository.revokeAllByUserId` is annotated with `@Transactional`.
15. **Q15 (Distributed Systems & Scheduling): `NotificationScheduler` uses `@Scheduled(cron = "0 * * * * *")` to send email reminders 30 minutes before scheduled interviews. What breaks if you scale the Spring Boot backend to 3 Docker containers behind Nginx?**
    - *Answer Outline*: `@Scheduled` runs in-memory inside each JVM. At `XX:XX:00`, all 3 containers query `interviews WHERE status = 'SCHEDULED'` simultaneously before any container sets `notified30m = true`, resulting in **3 duplicate emails and 3 duplicate in-app notifications** per student. Fix: use **ShedLock** (`@SchedulerLock`) backed by MySQL or Redis so only 1 instance executes the cron job per minute.
16. **Q16 (Caching): `RedisConfig.java` configures a `RedisCacheManager` with TTLs for `dashboard` (5m), `questions` (30m), and `leaderboard` (10m). Why is Redis currently receiving zero commands from the backend?**
    - *Answer Outline*: Configuring `RedisCacheManager` and `@EnableCaching` only registers the caching infrastructure and AOP interceptor. Because no service methods are annotated with `@Cacheable`, `@CachePut`, or `@CacheEvict`, the cache interceptor never intercepts any method calls.
17. **Q17 (Memory & Payload Design): When a student uploads a 10 MB PDF resume, trace how `ResumeServiceImpl` and `AIClientServiceImpl` pass that file to Python, and explain the memory footprint.**
    - *Answer Outline*: `ResumeServiceImpl` reads `file.getBytes()` (10 MB `byte[]`), writes it to disk, and passes the `byte[]` to `AIClientServiceImpl.analyzeResume`, which calls `Base64.getEncoder().encodeToString(fileContent)` (~13.3 MB String) and serializes it via Jackson into a JSON body (~13.3 MB buffer) sent over HTTP to FastAPI. A single 10 MB upload temporarily allocates ~35–40 MB of heap memory. Passing a shared volume path, presigned S3 URL, or streaming `multipart/form-data` avoids Base64 inflation.
18. **Q18 (Validation & Security): Compare how `AuthController.register` and `AdminController.createUser` accept request bodies and return responses. Why is `AuthController.register` good practice and `AdminController.createUser` a security flaw?**
    - *Answer Outline*: `AuthController.register` accepts `@Valid @RequestBody RegisterRequest` (enforcing `@NotBlank`, `@Email`, `@Size(min=6)`) and returns `ApiResponse<AuthResponse>` (which excludes the password field). `AdminController.createUser` accepts a raw `Map<String, String>` (bypassing Bean Validation) and returns the raw `User` JPA entity (which serializes the `password` BCrypt hash and all internal entity collections into the HTTP response).

---

## 15. Knowledge Verification Checklist

Use this self-assessment checklist to verify your mastery of the InterviewIQ backend before your next technical interview or code review:

- [ ] **Request Lifecycle**: I can trace an HTTP request from `JwtAuthenticationFilter` $\rightarrow$ `SecurityFilterChain` $\rightarrow$ `DispatcherServlet` $\rightarrow$ `@Valid` DTO binding $\rightarrow$ `@RestController` $\rightarrow$ `@Transactional` CGLIB proxy $\rightarrow$ `JpaRepository` $\rightarrow$ MySQL and back.
- [ ] **Spring Boot Config**: I can explain why `DataSourceConfig.java` exists, how `@Primary` resolves bean ambiguity, and why `spring.jpa.open-in-view` should be set to `false`.
- [ ] **JPA & Hibernate**: I can explain the difference between owning and inverse (`mappedBy`) sides of `@OneToOne`/`@OneToMany`, why `@OneToOne(mappedBy = ...)` cannot be lazily loaded without bytecode enhancement, and why `@Builder.Default` is required on Lombok `@Builder` entities.
- [ ] **SQL & N+1**: I can identify every N+1 query loop in `InterviewServiceImpl` and `RecommendationServiceImpl` and rewrite them using `JOIN FETCH` or SQL projections.
- [ ] **Indexing**: I can explain the B-Tree leftmost prefix rule and why `idx_interview_user_status (user_id, status)` does not help `findByStatus("SCHEDULED")`.
- [ ] **Transactions & Connection Pools**: I can explain why holding `@Transactional` open across a 60-second `RestTemplate` call starves HikariCP (`maximum-pool-size: 20`) even when Java 21 Virtual Threads are enabled.
- [ ] **Security & JWT**: I can explain the dual-token architecture (stateless 24h JWT + stateful 7d MySQL `RefreshToken`), why `SecurityConfig` URL rules run before `@PreAuthorize`, and why `GlobalExceptionHandler` vs. `JwtAuthenticationEntryPoint` handle different stages of the request pipeline.
- [ ] **Microservice Contracts**: I can explain the exact bug in `RecommendationServiceImpl` (`dsa_topics`/`weekly_roadmap` vs. `type`/`content`/`roadmap`) and why `ObjectMapper.writeValueAsString` is required for MySQL `JSON` columns.
- [ ] **Reality vs. Docs**: I can distinguish what is genuinely implemented in InterviewIQ from what is only configured (`RedisConfig`, `WebSocketConfig`) or partially wired (`SystemConfig`, `AdminPrompt`, `StudentSkill`).

---

## 16. Glossary of Important Terms

| Term | Plain-English Definition | Where It Appears in InterviewIQ |
| :--- | :--- | :--- |
| **AOP (Aspect-Oriented Programming)** | A mechanism where Spring wraps your bean in a runtime proxy (`CGLIB`) to run cross-cutting logic (like opening/committing a DB transaction or checking `@PreAuthorize`) before and after your method runs. | `@Transactional` on `InterviewServiceImpl`; `@PreAuthorize` on `AdminController`. |
| **BCrypt** | A slow, adaptive one-way password hashing function that automatically generates and embeds a random cryptographic salt into the 60-character `$2a$10$...` hash string. | `SecurityConfig.passwordEncoder()`, `AuthServiceImpl.register()`. |
| **B-Tree Leftmost Prefix Rule** | A composite database index on `(A, B, C)` can accelerate queries filtering by `A`, `(A, B)`, or `(A, B, C)`, but **cannot** be used if the query skips `A` (e.g., filtering only by `B`). | `Interview.java:14` (`idx_interview_user_status` on `user_id, status`). |
| **Connection Pool (HikariCP)** | A cache of pre-opened TCP/JDBC connections to MySQL maintained by the backend so requests don't pay the 30–100ms TCP+TLS handshake cost on every query. | `DataSourceConfig.java:100` (`maximum-pool-size: 20`). |
| **DTO (Data Transfer Object)** | A dedicated Java class (`Request`/`Response`) that defines the external JSON API contract, decoupling your public API from internal database `@Entity` tables. | `com.interviewiq.dto.request.*` and `com.interviewiq.dto.response.*`. |
| **Graceful Degradation** | Designing a system so that if a dependency (like Gemini or `ai-service`) fails, the system falls back to a simpler deterministic behavior rather than returning `500 Internal Server Error`. | `AIClientServiceImpl.java` + `InterviewServiceImpl.useFallbackQuestions()`. |
| **Idempotency** | The property where making the exact same request once or multiple times (e.g., double-clicking "Submit Answer") produces the same state without unintended side effects or errors. | Currently missing on `POST /api/interviews/answer` (`F-12`). |
| **IDOR (Insecure Direct Object Reference)** | A security vulnerability where User A can access or modify User B's private data simply by changing an ID parameter (`/api/interviews/42`) if the server fails to verify ownership (`interview.getUser().getId().equals(userId)`). | Prevented in `InterviewServiceImpl.java:198, 224`; vulnerable in `AdminController.reportViolation`. |
| **IoC / Dependency Injection** | Instead of a class instantiating its own dependencies (`new InterviewRepository()`), the framework (Spring `ApplicationContext`) constructs singletons and injects them via constructors. | `@RequiredArgsConstructor` + `private final` fields across all controllers/services. |
| **JWT (JSON Web Token)** | A compact, URL-safe token (`header.payload.signature`) cryptographically signed with HMAC-SHA256 so the server can verify identity without storing session state in memory. | `JwtTokenProvider.java`, `JwtAuthenticationFilter.java`. |
| **N+1 Query Problem** | An ORM anti-pattern where code executes $1$ query to fetch $N$ parent records and then executes $N$ additional queries inside a loop to fetch child records for each parent. | `InterviewServiceImpl.getHistory()`, `getResults()`, `RecommendationServiceImpl.generateRecommendations()`. |
| **Open Session in View (OSIV)** | A default Spring Boot setting (`spring.jpa.open-in-view: true`) that keeps the Hibernate `Session` open until the HTTP response finishes serializing, allowing lazy loading in controllers at the cost of holding DB connections longer. | Enabled by default (`application.yml` warning at startup). |
| **Optimistic Locking (`@Version`)** | A concurrency control strategy that uses a version counter column (`WHERE id = ? AND version = ?`) to detect if another transaction modified the row concurrently, without holding database locks during read time. | Recommended fix for `InterviewQuestion` in `submitAnswer`. |
| **Virtual Threads (Project Loom)** | Lightweight JVM-managed threads introduced in Java 21 that automatically unmount from OS carrier threads during blocking I/O (`RestTemplate`, JDBC), enabling high concurrency with simple synchronous code. | Enabled via `spring.threads.virtual.enabled: true` in `application.yml:43-45`. |

---

## 17. Final Engineering Assessment

### Architectural Strengths of InterviewIQ
1. **Clean Polyglot Separation of Concerns**: Pairing a strongly typed **Java 21 + Spring Boot 3.3.5** core backend (for authentication, RBAC, relational integrity, and workflow orchestration) with a **Python 3.12 + FastAPI** microservice (for PDF/DOCX extraction and Google Gemini LLM prompting) is a pragmatic, industry-standard architecture.
2. **Thoughtful Multi-Tier Resilience**: Both `AIClientServiceImpl.java` and the Python routers (`resume_router.py`, `question_router.py`, `evaluation_router.py`) implement deterministic fallbacks. Even if `GEMINI_API_KEY` is invalid or `ai-service` is down, a student can still upload a resume, start an interview from the seeded question bank, submit answers, and receive heuristic feedback without a single unhandled crash.
3. **Cloud-Native Deployment & Portable Configuration**: `DataSourceConfig.java`'s automatic `mysql://` URI parsing, multi-stage `Dockerfile` builds with non-root runtime users (`appuser`), and `docker-compose.yml` healthchecks make the system easy to spin up locally or on managed cloud platforms (Render/Railway/Aiven).
4. **Rich Domain Scope**: The 20-entity schema covers the full lifecycle of an AI interview preparation platform: resume skill extraction, adaptive follow-up question generation, multi-dimensional answer evaluation, proctoring telemetry, scheduled email reminders, and gamified leaderboards.

### Primary Engineering Growth Areas
To take this project from a strong portfolio prototype to true production readiness:
1. **Never Hold Database Transactions Across External Network Calls**: Separating `@Transactional` blocks from `RestTemplate` calls (`F-04`) is the single highest-leverage architectural lesson in this codebase.
2. **Enforce Compile-Time Contracts Between Microservices**: Replacing raw `Map<String, Object>` responses in `AIClientServiceImpl` with typed DTOs immediately prevents silent integration bugs like the `RecommendationServiceImpl` schema mismatch (`F-01`).
3. **Push Filtering and Ranking Down to SQL / Redis**: Replacing Java in-memory `.findAll().stream().filter(...)` loops and N+1 repository calls with SQL `JOIN FETCH`, `GROUP BY`, window functions (`RANK() OVER`), and activating the already-configured `RedisCacheManager` (`F-10`, `F-11`, `F-13`) will allow InterviewIQ to scale effortlessly from 50 campus users to 50,000+ concurrent users.
