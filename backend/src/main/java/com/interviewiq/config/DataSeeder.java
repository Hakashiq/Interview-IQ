package com.interviewiq.config;

import com.interviewiq.entity.Category;
import com.interviewiq.entity.Question;
import com.interviewiq.entity.Role;
import com.interviewiq.entity.Skill;
import com.interviewiq.entity.User;
import com.interviewiq.entity.SystemConfig;
import com.interviewiq.entity.AuditLog;
import com.interviewiq.entity.Violation;
import com.interviewiq.entity.InterviewTemplate;
import com.interviewiq.entity.AdminPrompt;
import com.interviewiq.entity.UserFeedback;
import com.interviewiq.repository.RoleRepository;
import com.interviewiq.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.security.crypto.password.PasswordEncoder;

import jakarta.persistence.EntityManager;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Set;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataSeeder.class);

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EntityManager entityManager;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
            // Seed Roles
            List<String> rolesToSeed = List.of(
                "ROLE_STUDENT", "ROLE_ADMIN", "ROLE_MENTOR",
                "ROLE_SUPER_ADMIN", "ROLE_MODERATOR",
                "ROLE_CONTENT_MANAGER", "ROLE_ANALYST"
            );
            for (String rName : rolesToSeed) {
                if (roleRepository.findByName(rName).isEmpty()) {
                    roleRepository.save(Role.builder().name(rName).build());
                }
            }
            logger.info("Roles seeded successfully");

            // Seed Admin User
            if (!userRepository.existsByEmail("admin@interviewiq.com")) {
                Role adminRole = roleRepository.findByName("ROLE_ADMIN").orElseThrow();

                User admin = User.builder()
                        .fullName("Admin User")
                        .email("admin@interviewiq.com")
                        .password(passwordEncoder.encode("Admin@123"))
                        .enabled(true)
                        .roles(Set.of(adminRole))
                        .build();
                userRepository.save(admin);
                logger.info("Admin user seeded: admin@interviewiq.com / Admin@123");
            }

            // Seed Mentor User
            if (!userRepository.existsByEmail("mentor@interviewiq.com")) {
                Role mentorRole = roleRepository.findByName("ROLE_MENTOR").orElseThrow();

                User mentor = User.builder()
                        .fullName("Mentor User")
                        .email("mentor@interviewiq.com")
                        .password(passwordEncoder.encode("Mentor@123"))
                        .enabled(true)
                        .roles(Set.of(mentorRole))
                        .build();
                userRepository.save(mentor);
                logger.info("Mentor user seeded: mentor@interviewiq.com / Mentor@123");
            }

            // Seed Student User
            if (!userRepository.existsByEmail("student@interviewiq.com")) {
                Role studentRole = roleRepository.findByName("ROLE_STUDENT").orElseThrow();

                User student = User.builder()
                        .fullName("Student User")
                        .email("student@interviewiq.com")
                        .password(passwordEncoder.encode("Student@123"))
                        .enabled(true)
                        .roles(Set.of(studentRole))
                        .build();
                userRepository.save(student);
                logger.info("Student user seeded: student@interviewiq.com / Student@123");
            }

            // Seed Skills
            List<String[]> skills = List.of(
                new String[]{"Java", "LANGUAGE"}, new String[]{"Python", "LANGUAGE"},
                new String[]{"JavaScript", "LANGUAGE"}, new String[]{"TypeScript", "LANGUAGE"},
                new String[]{"C++", "LANGUAGE"}, new String[]{"Go", "LANGUAGE"},
                new String[]{"Spring Boot", "FRAMEWORK"}, new String[]{"React", "FRAMEWORK"},
                new String[]{"Angular", "FRAMEWORK"}, new String[]{"Node.js", "FRAMEWORK"},
                new String[]{"Django", "FRAMEWORK"}, new String[]{"FastAPI", "FRAMEWORK"},
                new String[]{"MySQL", "DATABASE"}, new String[]{"PostgreSQL", "DATABASE"},
                new String[]{"MongoDB", "DATABASE"}, new String[]{"Redis", "DATABASE"},
                new String[]{"AWS", "CLOUD"}, new String[]{"Docker", "TOOL"},
                new String[]{"Kubernetes", "TOOL"}, new String[]{"Git", "TOOL"},
                new String[]{"Jenkins", "TOOL"}, new String[]{"Linux", "TOOL"},
                new String[]{"REST API", "CONCEPT"}, new String[]{"Microservices", "CONCEPT"},
                new String[]{"System Design", "CONCEPT"}, new String[]{"DSA", "CONCEPT"}
            );

            long skillCount = (long) entityManager.createQuery("SELECT COUNT(s) FROM Skill s").getSingleResult();
            if (skillCount == 0) {
                for (String[] s : skills) {
                    Skill skill = Skill.builder().name(s[0]).category(s[1]).build();
                    entityManager.persist(skill);
                }
                logger.info("Skills seeded: {} entries", skills.size());
            }

            // Seed Categories
            List<String[]> categories = List.of(
                new String[]{"Java", "TECHNICAL"}, new String[]{"OOP", "TECHNICAL"},
                new String[]{"Collections", "TECHNICAL"}, new String[]{"Spring Boot", "TECHNICAL"},
                new String[]{"SQL", "TECHNICAL"}, new String[]{"DBMS", "TECHNICAL"},
                new String[]{"Operating Systems", "TECHNICAL"}, new String[]{"Networking", "TECHNICAL"},
                new String[]{"REST API", "TECHNICAL"}, new String[]{"System Design", "TECHNICAL"},
                new String[]{"DSA", "TECHNICAL"}, new String[]{"React", "TECHNICAL"},
                new String[]{"HR Questions", "HR"}, new String[]{"Behavioral", "BEHAVIORAL"}
            );

            long catCount = (long) entityManager.createQuery("SELECT COUNT(c) FROM Category c").getSingleResult();
            if (catCount == 0) {
                for (String[] c : categories) {
                    Category cat = Category.builder().name(c[0]).type(c[1]).build();
                    entityManager.persist(cat);
                }
                logger.info("Categories seeded: {} entries", categories.size());
            }

            // Seed Questions
            long questionCount = (long) entityManager.createQuery("SELECT COUNT(q) FROM Question q").getSingleResult();
            if (questionCount == 0) {
                entityManager.flush();

                // Look up categories
                Category javaCategory = (Category) entityManager.createQuery("SELECT c FROM Category c WHERE c.name = 'Java'").getSingleResult();
                Category oopCategory = (Category) entityManager.createQuery("SELECT c FROM Category c WHERE c.name = 'OOP'").getSingleResult();
                Category springBootCategory = (Category) entityManager.createQuery("SELECT c FROM Category c WHERE c.name = 'Spring Boot'").getSingleResult();
                Category sqlCategory = (Category) entityManager.createQuery("SELECT c FROM Category c WHERE c.name = 'SQL'").getSingleResult();
                Category dsaCategory = (Category) entityManager.createQuery("SELECT c FROM Category c WHERE c.name = 'DSA'").getSingleResult();
                Category systemDesignCategory = (Category) entityManager.createQuery("SELECT c FROM Category c WHERE c.name = 'System Design'").getSingleResult();
                Category restApiCategory = (Category) entityManager.createQuery("SELECT c FROM Category c WHERE c.name = 'REST API'").getSingleResult();
                Category reactCategory = (Category) entityManager.createQuery("SELECT c FROM Category c WHERE c.name = 'React'").getSingleResult();
                Category hrCategory = (Category) entityManager.createQuery("SELECT c FROM Category c WHERE c.name = 'HR Questions'").getSingleResult();
                Category behavioralCategory = (Category) entityManager.createQuery("SELECT c FROM Category c WHERE c.name = 'Behavioral'").getSingleResult();

                int count = 0;

                // Java Questions
                entityManager.persist(Question.builder().questionText("What is the difference between == and .equals() in Java?")
                        .idealAnswer("The == operator compares object references (memory addresses), while .equals() compares the actual content/values of objects. For primitive types, == compares values directly. The .equals() method can be overridden to provide custom comparison logic.")
                        .difficulty("EASY").type("TECHNICAL").category(javaCategory).aiGenerated(false).build());
                entityManager.persist(Question.builder().questionText("Explain the concept of Java Memory Model - Stack vs Heap.")
                        .idealAnswer("Stack memory stores method frames, local variables, and references. It follows LIFO order and is thread-safe. Heap memory stores objects and class instances, shared across threads. Stack is faster but limited in size, while Heap is larger but requires garbage collection.")
                        .difficulty("MEDIUM").type("TECHNICAL").category(javaCategory).aiGenerated(false).build());
                entityManager.persist(Question.builder().questionText("What are the differences between HashMap, TreeMap, and LinkedHashMap?")
                        .idealAnswer("HashMap provides O(1) average time for get/put with no ordering guarantee. TreeMap maintains keys in sorted order using Red-Black tree with O(log n) operations. LinkedHashMap maintains insertion order with O(1) operations. HashMap allows one null key, TreeMap doesn't allow null keys.")
                        .difficulty("MEDIUM").type("TECHNICAL").category(javaCategory).aiGenerated(false).build());
                entityManager.persist(Question.builder().questionText("What is the Java Stream API and how does it differ from Collections?")
                        .idealAnswer("Stream API provides a functional approach to process collections of objects. Unlike Collections, Streams don't store data, are lazy (operations executed only when terminal operation is invoked), can be parallelized easily, and are consumed only once. They support operations like filter, map, reduce, collect.")
                        .difficulty("MEDIUM").type("TECHNICAL").category(javaCategory).aiGenerated(false).build());
                entityManager.persist(Question.builder().questionText("Explain the concept of Generics in Java and type erasure.")
                        .idealAnswer("Generics enable type-safe code by parameterizing types. Type erasure is the process where the compiler removes generic type information at compile time, replacing it with bounds or Object. This means generic type info is not available at runtime. Bounded types use extends/super keywords for constraints.")
                        .difficulty("HARD").type("TECHNICAL").category(javaCategory).aiGenerated(false).build());
                entityManager.persist(Question.builder().questionText("What is the volatile keyword in Java and when should it be used?")
                        .idealAnswer("The volatile keyword ensures that a variable's value is always read from and written to main memory, not from thread-local cache. It provides visibility guarantees but not atomicity. It should be used for flags or state variables accessed by multiple threads where only simple read/write operations are needed.")
                        .difficulty("HARD").type("TECHNICAL").category(javaCategory).aiGenerated(false).build());
                count += 6;

                // OOP Questions
                entityManager.persist(Question.builder().questionText("What are the four pillars of Object-Oriented Programming?")
                        .idealAnswer("The four pillars are: 1) Encapsulation - bundling data and methods, hiding internal state. 2) Abstraction - showing only essential features, hiding complexity. 3) Inheritance - creating new classes from existing ones, promoting code reuse. 4) Polymorphism - objects taking many forms, method overriding/overloading.")
                        .difficulty("EASY").type("TECHNICAL").category(oopCategory).aiGenerated(false).build());
                entityManager.persist(Question.builder().questionText("What is the difference between abstract class and interface in Java?")
                        .idealAnswer("Abstract classes can have constructors, instance variables, concrete methods, and abstract methods. A class can extend only one abstract class. Interfaces define contracts with abstract methods (default methods since Java 8). A class can implement multiple interfaces. Interfaces support multiple inheritance of type.")
                        .difficulty("EASY").type("TECHNICAL").category(oopCategory).aiGenerated(false).build());
                entityManager.persist(Question.builder().questionText("Explain SOLID principles with examples.")
                        .idealAnswer("S - Single Responsibility: A class should have one reason to change. O - Open/Closed: Open for extension, closed for modification. L - Liskov Substitution: Subtypes must be substitutable for base types. I - Interface Segregation: Prefer specific interfaces over general ones. D - Dependency Inversion: Depend on abstractions, not concretions.")
                        .difficulty("MEDIUM").type("TECHNICAL").category(oopCategory).aiGenerated(false).build());
                entityManager.persist(Question.builder().questionText("What is the difference between composition and inheritance? When to use each?")
                        .idealAnswer("Inheritance creates an is-a relationship (Dog is-a Animal), while composition creates a has-a relationship (Car has-a Engine). Composition is preferred for code reuse as it's more flexible, avoids fragile base class problem, and supports better encapsulation. Use inheritance for true subtype relationships.")
                        .difficulty("MEDIUM").type("TECHNICAL").category(oopCategory).aiGenerated(false).build());
                entityManager.persist(Question.builder().questionText("Explain the concept of design patterns. Describe Singleton, Factory, and Observer patterns.")
                        .idealAnswer("Design patterns are reusable solutions to common problems. Singleton ensures only one instance exists. Factory creates objects without exposing creation logic. Observer defines a one-to-many dependency where dependents are notified of state changes. Each pattern addresses specific design concerns and promotes loose coupling.")
                        .difficulty("HARD").type("TECHNICAL").category(oopCategory).aiGenerated(false).build());
                count += 5;

                // Spring Boot Questions
                entityManager.persist(Question.builder().questionText("What is Spring Boot and how does it differ from Spring Framework?")
                        .idealAnswer("Spring Boot is an opinionated framework built on top of Spring that simplifies configuration through auto-configuration, starter dependencies, and embedded servers. Unlike Spring Framework which requires extensive XML/Java configuration, Spring Boot provides sensible defaults and reduces boilerplate code.")
                        .difficulty("EASY").type("TECHNICAL").category(springBootCategory).aiGenerated(false).build());
                entityManager.persist(Question.builder().questionText("Explain Dependency Injection and IoC container in Spring.")
                        .idealAnswer("Dependency Injection is a design pattern where dependencies are provided to objects rather than created by them. The IoC (Inversion of Control) container manages object creation and lifecycle. Spring supports constructor, setter, and field injection. Constructor injection is preferred for mandatory dependencies.")
                        .difficulty("EASY").type("TECHNICAL").category(springBootCategory).aiGenerated(false).build());
                entityManager.persist(Question.builder().questionText("What are Spring Boot profiles and how do you manage configuration for different environments?")
                        .idealAnswer("Spring profiles allow defining different configurations for different environments (dev, test, prod). Activated via spring.profiles.active property. Each profile can have its own application-{profile}.yml file. Properties can be overridden per profile. @Profile annotation conditionally loads beans.")
                        .difficulty("MEDIUM").type("TECHNICAL").category(springBootCategory).aiGenerated(false).build());
                entityManager.persist(Question.builder().questionText("Explain the difference between @Component, @Service, @Repository, and @Controller annotations.")
                        .idealAnswer("All are stereotype annotations and specializations of @Component. @Service indicates business logic layer. @Repository indicates data access layer and enables exception translation. @Controller handles web requests in MVC. They help with component scanning, readability, and applying aspect-oriented features to specific layers.")
                        .difficulty("MEDIUM").type("TECHNICAL").category(springBootCategory).aiGenerated(false).build());
                entityManager.persist(Question.builder().questionText("How does Spring Security work? Explain the filter chain architecture.")
                        .idealAnswer("Spring Security uses a chain of servlet filters to intercept requests. Key filters include UsernamePasswordAuthenticationFilter, BasicAuthenticationFilter, and ExceptionTranslationFilter. The SecurityFilterChain processes requests through configured filters. Authentication is handled by AuthenticationManager with AuthenticationProviders.")
                        .difficulty("HARD").type("TECHNICAL").category(springBootCategory).aiGenerated(false).build());
                entityManager.persist(Question.builder().questionText("What is Spring AOP and how does it work internally?")
                        .idealAnswer("Spring AOP (Aspect-Oriented Programming) enables cross-cutting concerns like logging, security, and transactions. It uses proxy-based approach (JDK dynamic proxies or CGLIB). Key concepts: Aspect, Advice (Before, After, Around), Pointcut (expression matching join points), and JoinPoint. @Transactional is implemented using AOP.")
                        .difficulty("HARD").type("TECHNICAL").category(springBootCategory).aiGenerated(false).build());
                count += 6;

                // SQL Questions
                entityManager.persist(Question.builder().questionText("What is the difference between INNER JOIN, LEFT JOIN, RIGHT JOIN, and FULL OUTER JOIN?")
                        .idealAnswer("INNER JOIN returns matching rows from both tables. LEFT JOIN returns all rows from left table and matched rows from right (NULL for non-matches). RIGHT JOIN is the opposite. FULL OUTER JOIN returns all rows from both tables, with NULLs where no match exists.")
                        .difficulty("EASY").type("TECHNICAL").category(sqlCategory).aiGenerated(false).build());
                entityManager.persist(Question.builder().questionText("Explain the difference between WHERE and HAVING clauses.")
                        .idealAnswer("WHERE filters rows before grouping (works on individual rows). HAVING filters groups after GROUP BY is applied (works on aggregated results). WHERE cannot use aggregate functions, while HAVING can. Example: WHERE salary > 5000 vs HAVING COUNT(*) > 5.")
                        .difficulty("EASY").type("TECHNICAL").category(sqlCategory).aiGenerated(false).build());
                entityManager.persist(Question.builder().questionText("What are indexes in SQL? Explain clustered vs non-clustered indexes.")
                        .idealAnswer("Indexes improve query performance by creating sorted data structures. Clustered index determines physical order of data (one per table, usually primary key). Non-clustered index creates separate structure with pointers to data (multiple allowed). Indexes speed up reads but slow down writes due to maintenance overhead.")
                        .difficulty("MEDIUM").type("TECHNICAL").category(sqlCategory).aiGenerated(false).build());
                entityManager.persist(Question.builder().questionText("What is database normalization? Explain 1NF, 2NF, and 3NF.")
                        .idealAnswer("Normalization reduces data redundancy and improves integrity. 1NF: atomic values, no repeating groups. 2NF: meets 1NF + no partial dependencies (all non-key attributes depend on entire primary key). 3NF: meets 2NF + no transitive dependencies (non-key attributes don't depend on other non-key attributes).")
                        .difficulty("MEDIUM").type("TECHNICAL").category(sqlCategory).aiGenerated(false).build());
                entityManager.persist(Question.builder().questionText("Explain ACID properties in database transactions.")
                        .idealAnswer("Atomicity: Transaction is all-or-nothing. Consistency: Database moves from one valid state to another. Isolation: Concurrent transactions don't interfere (levels: Read Uncommitted, Read Committed, Repeatable Read, Serializable). Durability: Committed data persists even after system failure.")
                        .difficulty("MEDIUM").type("TECHNICAL").category(sqlCategory).aiGenerated(false).build());
                entityManager.persist(Question.builder().questionText("Write a SQL query to find the second highest salary from an Employee table.")
                        .idealAnswer("Multiple approaches: 1) SELECT MAX(salary) FROM employee WHERE salary < (SELECT MAX(salary) FROM employee); 2) SELECT salary FROM employee ORDER BY salary DESC LIMIT 1 OFFSET 1; 3) Using DENSE_RANK(): SELECT salary FROM (SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) as rank FROM employee) WHERE rank = 2;")
                        .difficulty("MEDIUM").type("TECHNICAL").category(sqlCategory).aiGenerated(false).build());
                count += 6;

                // DSA Questions
                entityManager.persist(Question.builder().questionText("What is the difference between Array and LinkedList?")
                        .idealAnswer("Arrays provide O(1) random access with contiguous memory but O(n) insertion/deletion. LinkedLists provide O(1) insertion/deletion at known positions but O(n) access. Arrays have better cache locality. LinkedLists use extra memory for pointers. Choose arrays for random access, LinkedLists for frequent insertions/deletions.")
                        .difficulty("EASY").type("TECHNICAL").category(dsaCategory).aiGenerated(false).build());
                entityManager.persist(Question.builder().questionText("Explain the time complexity of common sorting algorithms.")
                        .idealAnswer("Bubble Sort: O(n^2) average/worst. Selection Sort: O(n^2). Insertion Sort: O(n^2) worst, O(n) best. Merge Sort: O(n log n) always. Quick Sort: O(n log n) average, O(n^2) worst. Heap Sort: O(n log n). Counting/Radix Sort: O(n+k) for limited range integers.")
                        .difficulty("MEDIUM").type("TECHNICAL").category(dsaCategory).aiGenerated(false).build());
                entityManager.persist(Question.builder().questionText("What is a Binary Search Tree? Explain its operations and time complexities.")
                        .idealAnswer("BST is a binary tree where left child < parent < right child. Search, insert, delete are O(h) where h is height. For balanced BST, h = O(log n). Worst case (skewed): O(n). Balanced BSTs (AVL, Red-Black) maintain O(log n). In-order traversal gives sorted output.")
                        .difficulty("MEDIUM").type("TECHNICAL").category(dsaCategory).aiGenerated(false).build());
                entityManager.persist(Question.builder().questionText("Explain Dynamic Programming. How does it differ from recursion?")
                        .idealAnswer("Dynamic Programming solves problems by breaking them into overlapping subproblems and storing results (memoization/tabulation). Unlike plain recursion which may recompute, DP avoids redundant calculations. Two approaches: top-down (memoization with recursion) and bottom-up (tabulation with iteration). Examples: Fibonacci, Knapsack, LCS.")
                        .difficulty("HARD").type("TECHNICAL").category(dsaCategory).aiGenerated(false).build());
                entityManager.persist(Question.builder().questionText("Explain graph traversal algorithms: BFS and DFS.")
                        .idealAnswer("BFS (Breadth-First Search) uses a queue, explores level by level, finds shortest path in unweighted graphs. O(V+E) time. DFS (Depth-First Search) uses a stack/recursion, explores depth-first, useful for topological sort, cycle detection. O(V+E) time. BFS uses more memory for wide graphs, DFS for deep graphs.")
                        .difficulty("MEDIUM").type("TECHNICAL").category(dsaCategory).aiGenerated(false).build());
                count += 5;

                // System Design Questions
                entityManager.persist(Question.builder().questionText("What is the difference between monolithic and microservices architecture?")
                        .idealAnswer("Monolithic: single deployable unit, simpler to develop initially, harder to scale independently. Microservices: independently deployable services, better scalability, technology diversity, but adds complexity in communication, data consistency, and deployment. Choose based on team size, scale requirements, and domain complexity.")
                        .difficulty("EASY").type("TECHNICAL").category(systemDesignCategory).aiGenerated(false).build());
                entityManager.persist(Question.builder().questionText("Explain CAP theorem and its implications for distributed systems.")
                        .idealAnswer("CAP theorem states a distributed system can guarantee at most two of: Consistency (all nodes see same data), Availability (every request gets a response), Partition tolerance (system works despite network failures). Since partitions are inevitable, choose between CP (consistent but may be unavailable) or AP (available but eventually consistent).")
                        .difficulty("MEDIUM").type("TECHNICAL").category(systemDesignCategory).aiGenerated(false).build());
                entityManager.persist(Question.builder().questionText("How would you design a URL shortener like bit.ly?")
                        .idealAnswer("Requirements: shorten URLs, redirect, analytics. Architecture: Load balancer -> App servers -> DB + Cache. Key design: Base62 encoding of auto-increment ID or hash. Use NoSQL for scalability. Cache popular URLs in Redis. Handle collisions. Consider: custom aliases, expiration, rate limiting. Scale: horizontal scaling, CDN, database sharding.")
                        .difficulty("HARD").type("TECHNICAL").category(systemDesignCategory).aiGenerated(false).build());
                entityManager.persist(Question.builder().questionText("What is a load balancer and what are the different load balancing algorithms?")
                        .idealAnswer("A load balancer distributes incoming traffic across multiple servers. Algorithms: Round Robin (sequential), Weighted Round Robin (server capacity-based), Least Connections (fewest active connections), IP Hash (consistent routing), Random. L4 load balancers work at transport layer, L7 at application layer.")
                        .difficulty("MEDIUM").type("TECHNICAL").category(systemDesignCategory).aiGenerated(false).build());
                entityManager.persist(Question.builder().questionText("Explain caching strategies and cache invalidation patterns.")
                        .idealAnswer("Strategies: Cache-Aside (app manages cache), Read-Through (cache loads from DB), Write-Through (write to cache and DB), Write-Behind (async write to DB). Invalidation: TTL-based, event-driven, manual. Patterns: LRU, LFU eviction. Challenges: cache stampede, cold start, consistency. Tools: Redis, Memcached.")
                        .difficulty("HARD").type("TECHNICAL").category(systemDesignCategory).aiGenerated(false).build());
                count += 5;

                // REST API Questions
                entityManager.persist(Question.builder().questionText("What are the main HTTP methods and when should each be used?")
                        .idealAnswer("GET: retrieve resources (idempotent, safe). POST: create resources. PUT: full update/replace (idempotent). PATCH: partial update. DELETE: remove resources (idempotent). HEAD: like GET but no body. OPTIONS: describe communication options. Follow REST conventions for predictable APIs.")
                        .difficulty("EASY").type("TECHNICAL").category(restApiCategory).aiGenerated(false).build());
                entityManager.persist(Question.builder().questionText("What is REST and what are its architectural constraints?")
                        .idealAnswer("REST (Representational State Transfer) has six constraints: 1) Client-Server separation. 2) Stateless - no session state on server. 3) Cacheable - responses must define cacheability. 4) Uniform Interface - standardized resource identification and manipulation. 5) Layered System. 6) Code on Demand (optional).")
                        .difficulty("MEDIUM").type("TECHNICAL").category(restApiCategory).aiGenerated(false).build());
                entityManager.persist(Question.builder().questionText("Explain HTTP status codes and their categories.")
                        .idealAnswer("1xx: Informational. 2xx: Success (200 OK, 201 Created, 204 No Content). 3xx: Redirection (301 Moved, 304 Not Modified). 4xx: Client errors (400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 422 Unprocessable). 5xx: Server errors (500 Internal, 502 Bad Gateway, 503 Unavailable).")
                        .difficulty("EASY").type("TECHNICAL").category(restApiCategory).aiGenerated(false).build());
                entityManager.persist(Question.builder().questionText("How do you handle API versioning? What are the different strategies?")
                        .idealAnswer("Strategies: 1) URI versioning (/api/v1/users). 2) Query parameter (?version=1). 3) Header versioning (Accept: application/vnd.api.v1+json). 4) Content negotiation. URI versioning is most common and explicit. Consider backward compatibility, deprecation policies, and documentation for each version.")
                        .difficulty("MEDIUM").type("TECHNICAL").category(restApiCategory).aiGenerated(false).build());
                entityManager.persist(Question.builder().questionText("What is the difference between authentication and authorization in REST APIs?")
                        .idealAnswer("Authentication verifies identity (who you are) - e.g., JWT, OAuth, API keys. Authorization determines permissions (what you can do) - e.g., RBAC, ABAC. Authentication comes first. Common implementations: JWT tokens for auth, role-based middleware for authorization. OAuth 2.0 handles both with scopes.")
                        .difficulty("MEDIUM").type("TECHNICAL").category(restApiCategory).aiGenerated(false).build());
                count += 5;

                // React Questions
                entityManager.persist(Question.builder().questionText("What is the Virtual DOM and how does React use it?")
                        .idealAnswer("Virtual DOM is a lightweight JavaScript representation of the real DOM. When state changes, React creates a new Virtual DOM tree, diffs it with the previous one (reconciliation), and updates only changed parts in the real DOM (batch updates). This minimizes expensive DOM operations and improves performance.")
                        .difficulty("EASY").type("TECHNICAL").category(reactCategory).aiGenerated(false).build());
                entityManager.persist(Question.builder().questionText("Explain React hooks: useState, useEffect, and useContext.")
                        .idealAnswer("useState: manages state in functional components, returns [state, setState]. useEffect: handles side effects (API calls, subscriptions), runs after render, cleanup function for unmount. useContext: consumes context values without prop drilling. Hooks follow rules: only at top level, only in React functions.")
                        .difficulty("EASY").type("TECHNICAL").category(reactCategory).aiGenerated(false).build());
                entityManager.persist(Question.builder().questionText("What is the difference between controlled and uncontrolled components?")
                        .idealAnswer("Controlled components: form data handled by React state, value prop + onChange handler, React is single source of truth. Uncontrolled components: form data handled by DOM itself, use refs to access values. Controlled is preferred for validation and dynamic forms. Uncontrolled is simpler for basic forms or file inputs.")
                        .difficulty("MEDIUM").type("TECHNICAL").category(reactCategory).aiGenerated(false).build());
                entityManager.persist(Question.builder().questionText("Explain React component lifecycle and how it maps to hooks.")
                        .idealAnswer("Class lifecycle: constructor, render, componentDidMount, componentDidUpdate, componentWillUnmount. With hooks: useState replaces constructor state, useEffect with empty deps = componentDidMount, useEffect with deps = componentDidUpdate, useEffect cleanup = componentWillUnmount. useMemo and useCallback for optimization.")
                        .difficulty("MEDIUM").type("TECHNICAL").category(reactCategory).aiGenerated(false).build());
                entityManager.persist(Question.builder().questionText("What is state management in React? Compare Context API, Redux, and Zustand.")
                        .idealAnswer("Context API: built-in, good for simple global state, can cause re-renders. Redux: predictable state container, actions/reducers pattern, middleware support, devtools, best for complex state. Zustand: minimal boilerplate, hook-based, selective re-renders, simpler than Redux. Choose based on app complexity.")
                        .difficulty("HARD").type("TECHNICAL").category(reactCategory).aiGenerated(false).build());
                count += 5;

                // HR Questions
                entityManager.persist(Question.builder().questionText("Tell me about yourself.")
                        .idealAnswer("Structure: Present (current role/studies), Past (relevant experience), Future (career goals aligned with position). Keep it 2-3 minutes. Focus on professional aspects, key achievements, and how your background makes you a great fit for this role. Be concise and confident.")
                        .difficulty("EASY").type("HR").category(hrCategory).aiGenerated(false).build());
                entityManager.persist(Question.builder().questionText("What are your strengths and weaknesses?")
                        .idealAnswer("Strengths: Choose relevant ones with examples (e.g., problem-solving - describe a complex bug you solved). Weaknesses: Be honest but show self-awareness and improvement efforts (e.g., public speaking - joined Toastmasters). Avoid cliches like 'perfectionist'. Show growth mindset.")
                        .difficulty("EASY").type("HR").category(hrCategory).aiGenerated(false).build());
                entityManager.persist(Question.builder().questionText("Where do you see yourself in 5 years?")
                        .idealAnswer("Show ambition aligned with the company. Express desire to grow technically (senior/lead roles), contribute to impactful projects, and possibly mentor others. Demonstrate you've researched the company's growth trajectory. Avoid overly specific titles or mentioning leaving the company.")
                        .difficulty("EASY").type("HR").category(hrCategory).aiGenerated(false).build());
                entityManager.persist(Question.builder().questionText("Why should we hire you?")
                        .idealAnswer("Match your skills to job requirements. Highlight unique value proposition - combination of technical skills, soft skills, and experience. Provide specific examples of past achievements. Show enthusiasm for the role and company. Demonstrate cultural fit and willingness to learn and grow.")
                        .difficulty("MEDIUM").type("HR").category(hrCategory).aiGenerated(false).build());
                entityManager.persist(Question.builder().questionText("Why do you want to leave your current job?")
                        .idealAnswer("Focus on positive reasons: seeking new challenges, career growth, alignment with passion, better opportunity to use skills. Never speak negatively about current employer. Frame as moving toward something rather than away from something. Show thoughtfulness about career decisions.")
                        .difficulty("MEDIUM").type("HR").category(hrCategory).aiGenerated(false).build());
                count += 5;

                // Behavioral Questions
                entityManager.persist(Question.builder().questionText("Tell me about a time you faced a challenging problem at work/project.")
                        .idealAnswer("Use STAR method: Situation (context), Task (your responsibility), Action (specific steps taken), Result (measurable outcome). Example: Faced a production outage, identified root cause through log analysis, implemented fix and added monitoring, reduced downtime by 80%. Show problem-solving and composure under pressure.")
                        .difficulty("EASY").type("BEHAVIORAL").category(behavioralCategory).aiGenerated(false).build());
                entityManager.persist(Question.builder().questionText("Describe a time when you had to work with a difficult team member.")
                        .idealAnswer("STAR format: Describe the situation objectively without blame. Explain your approach: active listening, finding common ground, clear communication. Show empathy and professionalism. Highlight the positive outcome - improved collaboration, project success. Demonstrate conflict resolution and interpersonal skills.")
                        .difficulty("MEDIUM").type("BEHAVIORAL").category(behavioralCategory).aiGenerated(false).build());
                entityManager.persist(Question.builder().questionText("Give an example of when you showed leadership.")
                        .idealAnswer("STAR format: Describe a situation where you took initiative without being asked, or led a team/project. Detail specific actions: delegating, motivating, making decisions. Show results: project completed on time, team performance improved. Leadership doesn't require a title - show initiative, responsibility, and impact.")
                        .difficulty("MEDIUM").type("BEHAVIORAL").category(behavioralCategory).aiGenerated(false).build());
                entityManager.persist(Question.builder().questionText("Tell me about a time you failed and what you learned from it.")
                        .idealAnswer("Be honest about a genuine failure, not a humble brag. Use STAR: describe what happened, your role in it, what went wrong. Focus on lessons learned and how you applied them. Show growth mindset, accountability, and resilience. Example: missed a deadline, learned to break tasks down and communicate blockers early.")
                        .difficulty("MEDIUM").type("BEHAVIORAL").category(behavioralCategory).aiGenerated(false).build());
                entityManager.persist(Question.builder().questionText("Describe a time when you had to learn something new quickly.")
                        .idealAnswer("STAR format: Describe the situation (new technology, domain, tool). Explain your learning strategy: documentation, tutorials, hands-on practice, mentoring. Show results: successfully applied the knowledge. Demonstrate adaptability, self-learning ability, and resourcefulness. Highlight time-management during learning.")
                        .difficulty("EASY").type("BEHAVIORAL").category(behavioralCategory).aiGenerated(false).build());
                count += 5;

                // Seed System Configurations
                long configCount = (long) entityManager.createQuery("SELECT COUNT(s) FROM SystemConfig s").getSingleResult();
                if (configCount == 0) {
                    entityManager.persist(SystemConfig.builder().configKey("platform_name").configValue("InterviewIQ").build());
                    entityManager.persist(SystemConfig.builder().configKey("platform_logo").configValue("IQ").build());
                    entityManager.persist(SystemConfig.builder().configKey("default_ai_provider").configValue("gemini").build());
                    entityManager.persist(SystemConfig.builder().configKey("default_ai_model").configValue("gemini-2.0-flash").build());
                    entityManager.persist(SystemConfig.builder().configKey("ats_passing_score").configValue("7.0").build());
                    entityManager.persist(SystemConfig.builder().configKey("fraud_integrity_threshold").configValue("0.8").build());
                    entityManager.persist(SystemConfig.builder().configKey("max_daily_interviews").configValue("10").build());
                    entityManager.persist(SystemConfig.builder().configKey("jwt_session_timeout").configValue("24").build());
                    entityManager.persist(SystemConfig.builder().configKey("ai_temperature").configValue("0.7").build());
                    logger.info("System configs seeded successfully");
                }

                // Seed Interview Templates
                long templateCount = (long) entityManager.createQuery("SELECT COUNT(i) FROM InterviewTemplate i").getSingleResult();
                if (templateCount == 0) {
                    entityManager.persist(InterviewTemplate.builder()
                            .templateName("Backend Developer")
                            .description("Comprehensive mock interview for backend roles focusing on Java, OOP, Spring Boot, SQL, and DSA.")
                            .difficulty("MEDIUM")
                            .durationMinutes(30)
                            .questionCount(5)
                            .selectionStrategy("ADAPTIVE")
                            .skillsList("Java,Spring Boot,SQL,DSA,System Design")
                            .build());
                    entityManager.persist(InterviewTemplate.builder()
                            .templateName("Full Stack Developer")
                            .description("Full stack engineering mock interview covers frontend React and backend microservices.")
                            .difficulty("MEDIUM")
                            .durationMinutes(45)
                            .questionCount(8)
                            .selectionStrategy("ADAPTIVE")
                            .skillsList("Java,React,SQL,REST API,HTML,CSS")
                            .build());
                    entityManager.persist(InterviewTemplate.builder()
                            .templateName("Software Engineer")
                            .description("Focuses heavily on Data Structures, Algorithms, and Core Computer Science concepts.")
                            .difficulty("HARD")
                            .durationMinutes(30)
                            .questionCount(5)
                            .selectionStrategy("RANDOM")
                            .skillsList("DSA,OOP,Java")
                            .build());
                    logger.info("Interview templates seeded successfully");
                }

                // Seed User Feedbacks
                long feedbackCount = (long) entityManager.createQuery("SELECT COUNT(f) FROM UserFeedback f").getSingleResult();
                if (feedbackCount == 0) {
                    entityManager.persist(UserFeedback.builder()
                            .username("student@interviewiq.com")
                            .rating(5)
                            .category("SUGGESTION")
                            .message("The AI feedback is extremely structured. Suggest adding a resume builder tool.")
                            .status("PENDING")
                            .createdAt(LocalDateTime.now().minusDays(2))
                            .build());
                    entityManager.persist(UserFeedback.builder()
                            .username("student@interviewiq.com")
                            .rating(4)
                            .category("FEATURE_REQUEST")
                            .message("Please add voice response mode support for custom question sets.")
                            .status("PENDING")
                            .createdAt(LocalDateTime.now().minusDays(1))
                            .build());
                    logger.info("User feedbacks seeded successfully");
                }

                // Seed Audit Logs
                long auditCount = (long) entityManager.createQuery("SELECT COUNT(a) FROM AuditLog a").getSingleResult();
                if (auditCount == 0) {
                    entityManager.persist(AuditLog.builder()
                            .username("admin@interviewiq.com")
                            .action("ROLE_SEED")
                            .details("Seeded default platform user access roles")
                            .timestamp(LocalDateTime.now().minusHours(3))
                            .build());
                    entityManager.persist(AuditLog.builder()
                            .username("admin@interviewiq.com")
                            .action("SYSTEM_CONFIG_INITIALIZE")
                            .details("Seeded default platform configuration properties")
                            .timestamp(LocalDateTime.now().minusHours(2))
                            .build());
                    logger.info("Audit logs seeded successfully");
                }

                // Seed Violations
                long violationCount = (long) entityManager.createQuery("SELECT COUNT(v) FROM Violation v").getSingleResult();
                if (violationCount == 0) {
                    entityManager.persist(Violation.builder()
                            .userId(3L)
                            .username("student@interviewiq.com")
                            .violationType("COPY_PASTE")
                            .details("Copy-paste detected in Answer to Question 2")
                            .timestamp(LocalDateTime.now().minusHours(1))
                            .build());
                    entityManager.persist(Violation.builder()
                            .userId(3L)
                            .username("student@interviewiq.com")
                            .violationType("TAB_SWITCH")
                            .details("Tab switch detected 3 times during active interview session")
                            .timestamp(LocalDateTime.now().minusMinutes(30))
                            .build());
                    logger.info("Violations seeded successfully");
                }

                // Seed Prompts
                long promptCount = (long) entityManager.createQuery("SELECT COUNT(p) FROM AdminPrompt p").getSingleResult();
                if (promptCount == 0) {
                    entityManager.persist(AdminPrompt.builder()
                            .promptType("EVALUATION")
                            .name("Core Evaluator")
                            .promptText("You are an expert technical interviewer. Evaluate this mock interview response based on technical accuracy, completeness, and communication skills...")
                            .version(1)
                            .createdAt(LocalDateTime.now().minusDays(5))
                            .build());
                    entityManager.persist(AdminPrompt.builder()
                            .promptType("ATS")
                            .name("ATS Core Scorer")
                            .promptText("Evaluate this resume text against ATS standards. Score keywords relevance, formatting, projects, achievements, and grammar accuracy...")
                            .version(1)
                            .createdAt(LocalDateTime.now().minusDays(5))
                            .build());
                    logger.info("Admin prompts seeded successfully");
                }
            }
    }
}
