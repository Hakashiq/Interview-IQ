package com.interviewiq.service.impl;

import com.interviewiq.dto.request.StartInterviewRequest;
import com.interviewiq.dto.request.SubmitAnswerRequest;
import com.interviewiq.dto.response.*;
import com.interviewiq.entity.*;
import com.interviewiq.exception.BadRequestException;
import com.interviewiq.exception.ResourceNotFoundException;
import com.interviewiq.repository.*;
import com.interviewiq.service.AIClientService;
import com.interviewiq.service.InterviewService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class InterviewServiceImpl implements InterviewService {

    private static final Logger logger = LoggerFactory.getLogger(InterviewServiceImpl.class);

    private final InterviewRepository interviewRepository;
    private final InterviewQuestionRepository interviewQuestionRepository;
    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;
    private final AIClientService aiClientService;
    private final CategoryRepository categoryRepository;
    private final ResumeRepository resumeRepository;

    private static final Map<String, List<String>> JOB_ROLE_CATEGORIES;
    static {
        Map<String, List<String>> map = new HashMap<>();
        // Job Roles
        map.put("SDE", List.of("Java", "OOP", "DSA", "System Design", "SQL"));
        map.put("Full Stack", List.of("Java", "React", "REST API", "SQL", "Spring Boot"));
        map.put("Backend", List.of("Java", "Spring Boot", "SQL", "REST API", "System Design"));
        map.put("Data Engineer", List.of("SQL", "DSA", "System Design", "DBMS", "Java"));
        
        // Subjects / Categories
        map.put("Java", List.of("Java", "Collections"));
        map.put("OOP", List.of("OOP"));
        map.put("Spring Boot", List.of("Spring Boot"));
        map.put("SQL", List.of("SQL"));
        map.put("DBMS", List.of("DBMS", "SQL"));
        map.put("Database", List.of("DBMS", "SQL"));
        map.put("db", List.of("DBMS", "SQL"));
        map.put("DB", List.of("DBMS", "SQL"));
        map.put("Operating Systems", List.of("Operating Systems"));
        map.put("OS", List.of("Operating Systems"));
        map.put("os", List.of("Operating Systems"));
        map.put("Networking", List.of("Networking"));
        map.put("CN", List.of("Networking"));
        map.put("cn", List.of("Networking"));
        map.put("Computer Networks", List.of("Networking"));
        map.put("REST API", List.of("REST API"));
        map.put("System Design", List.of("System Design"));
        map.put("DSA", List.of("DSA"));
        map.put("React", List.of("React"));
        map.put("HR Questions", List.of("HR Questions"));
        map.put("Behavioral", List.of("Behavioral"));
        JOB_ROLE_CATEGORIES = Collections.unmodifiableMap(map);
    }

    public InterviewServiceImpl(InterviewRepository interviewRepository,
                                InterviewQuestionRepository interviewQuestionRepository,
                                QuestionRepository questionRepository,
                                AnswerRepository answerRepository,
                                FeedbackRepository feedbackRepository,
                                UserRepository userRepository,
                                AIClientService aiClientService,
                                CategoryRepository categoryRepository,
                                ResumeRepository resumeRepository) {
        this.interviewRepository = interviewRepository;
        this.interviewQuestionRepository = interviewQuestionRepository;
        this.questionRepository = questionRepository;
        this.answerRepository = answerRepository;
        this.feedbackRepository = feedbackRepository;
        this.userRepository = userRepository;
        this.aiClientService = aiClientService;
        this.categoryRepository = categoryRepository;
        this.resumeRepository = resumeRepository;
    }

    @Override
    @Transactional
    public InterviewResponse startInterview(StartInterviewRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Check if user is banned
        if (user.getBannedUntil() != null && user.getBannedUntil().isAfter(LocalDateTime.now())) {
            throw new BadRequestException("Your account is temporarily banned due to repeated unnecessary movements. Try again after " + user.getBannedUntil());
        }

        List<Question> selectedQuestions = getQuestionsForRequest(request, userId);

        // Create Interview entity
        Interview interview = Interview.builder()
                .user(user)
                .jobRole(request.getJobRole())
                .difficulty(request.getDifficulty())
                .mode(request.getMode())
                .status("IN_PROGRESS")
                .build();

        interview = interviewRepository.save(interview);
        logger.info("Interview started with id: {} for user: {}", interview.getId(), userId);

        // Create InterviewQuestion entries
        for (int i = 0; i < selectedQuestions.size(); i++) {
            InterviewQuestion iq = InterviewQuestion.builder()
                    .interview(interview)
                    .question(selectedQuestions.get(i))
                    .sequenceOrder(i + 1)
                    .status("PENDING")
                    .build();
            interviewQuestionRepository.save(iq);
        }

        return mapToInterviewResponse(interview, selectedQuestions.size(), 0);
    }

    @Override
    @Transactional
    public InterviewResponse scheduleInterview(StartInterviewRequest request, LocalDateTime scheduledAt, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Check if user is banned
        if (user.getBannedUntil() != null && user.getBannedUntil().isAfter(LocalDateTime.now())) {
            throw new BadRequestException("Your account is temporarily banned due to repeated unnecessary movements. Try again after " + user.getBannedUntil());
        }

        List<Question> selectedQuestions = getQuestionsForRequest(request, userId);

        // Create Interview entity in SCHEDULED status
        Interview interview = Interview.builder()
                .user(user)
                .jobRole(request.getJobRole())
                .difficulty(request.getDifficulty())
                .mode(request.getMode())
                .status("SCHEDULED")
                .scheduledAt(scheduledAt)
                .build();

        interview = interviewRepository.save(interview);
        logger.info("Interview scheduled with id: {} for user: {} at {}", interview.getId(), userId, scheduledAt);

        // Create InterviewQuestion entries
        for (int i = 0; i < selectedQuestions.size(); i++) {
            InterviewQuestion iq = InterviewQuestion.builder()
                    .interview(interview)
                    .question(selectedQuestions.get(i))
                    .sequenceOrder(i + 1)
                    .status("PENDING")
                    .build();
            interviewQuestionRepository.save(iq);
        }

        return mapToInterviewResponse(interview, selectedQuestions.size(), 0);
    }

    @Override
    @Transactional(readOnly = true)
    public InterviewResponse getInterview(Long interviewId, Long userId) {
        Interview interview = getInterviewWithOwnershipCheck(interviewId, userId);
        List<InterviewQuestion> questions = interviewQuestionRepository.findByInterviewId(interviewId);
        long answeredCount = questions.stream()
                .filter(iq -> "ANSWERED".equals(iq.getStatus()))
                .count();

        return mapToInterviewResponse(interview, questions.size(), (int) answeredCount);
    }

    @Override
    @Transactional
    public InterviewQuestionResponse getNextQuestion(Long interviewId, Long userId) {
        Interview interview = getInterviewWithOwnershipCheck(interviewId, userId);

        if ("COMPLETED".equals(interview.getStatus())) {
            throw new BadRequestException("Interview is already completed");
        }

        if ("SCHEDULED".equals(interview.getStatus())) {
            interview.setStatus("IN_PROGRESS");
            interviewRepository.save(interview);
        }

        List<InterviewQuestion> questions = interviewQuestionRepository.findByInterviewId(interviewId);
        InterviewQuestion nextQuestion = questions.stream()
                .filter(iq -> "PENDING".equals(iq.getStatus()))
                .min(Comparator.comparingInt(InterviewQuestion::getSequenceOrder))
                .orElse(null);

        if (nextQuestion == null) {
            throw new ResourceNotFoundException("No more pending questions in this interview");
        }

        Question question = nextQuestion.getQuestion();
        return InterviewQuestionResponse.builder()
                .interviewQuestionId(nextQuestion.getId())
                .questionText(question.getQuestionText())
                .category(question.getCategory().getName())
                .difficulty(question.getDifficulty())
                .sequenceOrder(nextQuestion.getSequenceOrder())
                .build();
    }

    @Override
    @Transactional
    public SubmitAnswerResponse submitAnswer(Long interviewId, SubmitAnswerRequest request, Long userId) {
        Interview interview = getInterviewWithOwnershipCheck(interviewId, userId);

        if ("COMPLETED".equals(interview.getStatus())) {
            throw new BadRequestException("Interview is already completed");
        }

        InterviewQuestion interviewQuestion = interviewQuestionRepository.findById(request.getInterviewQuestionId())
                .orElseThrow(() -> new ResourceNotFoundException("Interview question not found"));

        if (!interviewQuestion.getInterview().getId().equals(interviewId)) {
            throw new BadRequestException("Question does not belong to this interview");
        }

        if ("ANSWERED".equals(interviewQuestion.getStatus())) {
            throw new BadRequestException("This question has already been answered");
        }

        // Save answer
        Answer answer = Answer.builder()
                .interviewQuestion(interviewQuestion)
                .answerText(request.getAnswerText())
                .timeTakenSeconds(request.getTimeTakenSeconds())
                .build();
        answer = answerRepository.save(answer);

        // Call AI to evaluate
        Question question = interviewQuestion.getQuestion();
        Map<String, Object> evaluation = aiClientService.evaluateAnswer(
                question.getQuestionText(),
                question.getIdealAnswer() != null ? question.getIdealAnswer() : "",
                request.getAnswerText(),
                question.getCategory().getName()
        );

        // Parse response to Feedback
        Feedback feedback = Feedback.builder()
                .answer(answer)
                .technicalAccuracy(getIntValue(evaluation, "technical_accuracy"))
                .completeness(getIntValue(evaluation, "completeness"))
                .communication(getIntValue(evaluation, "communication"))
                .relevance(getIntValue(evaluation, "relevance"))
                .confidence(getIntValue(evaluation, "confidence"))
                .overallScore(getIntValue(evaluation, "overall_score"))
                .strengths(getStringValue(evaluation, "strengths"))
                .weaknesses(getStringValue(evaluation, "weaknesses"))
                .improvements(getStringValue(evaluation, "improvements"))
                .build();
        feedback = feedbackRepository.save(feedback);

        // Mark question as ANSWERED
        interviewQuestion.setStatus("ANSWERED");
        interviewQuestionRepository.save(interviewQuestion);

        logger.info("Answer submitted for interview: {}, question: {}", interviewId, request.getInterviewQuestionId());

        return SubmitAnswerResponse.builder()
                .feedback(mapToFeedbackResponse(feedback))
                .build();
    }

    @Override
    @Transactional
    public MessageResponse completeInterview(Long interviewId, Long userId) {
        Interview interview = getInterviewWithOwnershipCheck(interviewId, userId);

        if ("COMPLETED".equals(interview.getStatus())) {
            throw new BadRequestException("Interview is already completed");
        }

        // Calculate average score from all feedback
        List<InterviewQuestion> questions = interviewQuestionRepository.findByInterviewId(interviewId);
        OptionalDouble avgScore = questions.stream()
                .filter(iq -> "ANSWERED".equals(iq.getStatus()))
                .map(iq -> answerRepository.findByInterviewQuestion(iq).orElse(null))
                .filter(Objects::nonNull)
                .map(a -> feedbackRepository.findByAnswer(a).orElse(null))
                .filter(Objects::nonNull)
                .filter(f -> f.getOverallScore() != null)
                .mapToInt(Feedback::getOverallScore)
                .average();

        interview.setStatus("COMPLETED");
        interview.setCompletedAt(LocalDateTime.now());
        if (avgScore.isPresent()) {
            interview.setOverallScore((int) Math.round(avgScore.getAsDouble()));
        }

        interviewRepository.save(interview);
        logger.info("Interview completed: {} with overall score: {}", interviewId, interview.getOverallScore());

        return new MessageResponse("Interview completed successfully");
    }

    @Override
    @Transactional(readOnly = true)
    public InterviewResultsResponse getResults(Long interviewId, Long userId) {
        Interview interview = getInterviewWithOwnershipCheck(interviewId, userId);
        List<InterviewQuestion> questions = interviewQuestionRepository.findByInterviewId(interviewId);

        List<InterviewResultsResponse.QuestionResult> questionResults = questions.stream()
                .sorted(Comparator.comparingInt(InterviewQuestion::getSequenceOrder))
                .map(iq -> {
                    Question q = iq.getQuestion();
                    Answer answer = answerRepository.findByInterviewQuestion(iq).orElse(null);
                    Feedback feedback = answer != null
                            ? feedbackRepository.findByAnswer(answer).orElse(null)
                            : null;

                    return InterviewResultsResponse.QuestionResult.builder()
                            .interviewQuestionId(iq.getId())
                            .questionText(q.getQuestionText())
                            .category(q.getCategory().getName())
                            .difficulty(q.getDifficulty())
                            .sequenceOrder(iq.getSequenceOrder())
                            .answerText(answer != null ? answer.getAnswerText() : null)
                            .timeTakenSeconds(answer != null ? answer.getTimeTakenSeconds() : null)
                            .feedback(feedback != null ? mapToFeedbackResponse(feedback) : null)
                            .build();
                })
                .collect(Collectors.toList());

        return InterviewResultsResponse.builder()
                .id(interview.getId())
                .jobRole(interview.getJobRole())
                .difficulty(interview.getDifficulty())
                .mode(interview.getMode())
                .status(interview.getStatus())
                .overallScore(interview.getOverallScore())
                .totalQuestions(questions.size())
                .startedAt(interview.getStartedAt())
                .completedAt(interview.getCompletedAt())
                .questions(questionResults)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<InterviewResponse> getHistory(Long userId) {
        List<Interview> interviews = interviewRepository.findByUserIdOrderByStartedAtDesc(userId);
        return interviews.stream()
                .map(interview -> {
                    List<InterviewQuestion> questions = interviewQuestionRepository.findByInterviewId(interview.getId());
                    long answered = questions.stream()
                            .filter(iq -> "ANSWERED".equals(iq.getStatus()))
                            .count();
                    return mapToInterviewResponse(interview, questions.size(), (int) answered);
                })
                .collect(Collectors.toList());
    }

    private Interview getInterviewWithOwnershipCheck(Long interviewId, Long userId) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found with id: " + interviewId));

        if (!interview.getUser().getId().equals(userId)) {
            throw new BadRequestException("You do not have access to this interview");
        }

        return interview;
    }

    private InterviewResponse mapToInterviewResponse(Interview interview, int totalQuestions, int answeredCount) {
        return InterviewResponse.builder()
                .id(interview.getId())
                .jobRole(interview.getJobRole())
                .difficulty(interview.getDifficulty())
                .mode(interview.getMode())
                .status(interview.getStatus())
                .totalQuestions(totalQuestions)
                .answeredCount(answeredCount)
                .overallScore(interview.getOverallScore())
                .startedAt(interview.getStartedAt())
                .completedAt(interview.getCompletedAt())
                .build();
    }

    private AnswerFeedbackResponse mapToFeedbackResponse(Feedback feedback) {
        return AnswerFeedbackResponse.builder()
                .technicalAccuracy(feedback.getTechnicalAccuracy())
                .completeness(feedback.getCompleteness())
                .communication(feedback.getCommunication())
                .relevance(feedback.getRelevance())
                .confidence(feedback.getConfidence())
                .overallScore(feedback.getOverallScore())
                .strengths(feedback.getStrengths())
                .weaknesses(feedback.getWeaknesses())
                .improvements(feedback.getImprovements())
                .build();
    }

    private Integer getIntValue(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        return null;
    }

    private String getStringValue(Map<String, Object> map, String key) {
        Object value = map.get(key);
        return value != null ? value.toString() : null;
    }

    private List<Question> getQuestionsForRequest(StartInterviewRequest request, Long userId) {
        int questionCount = Math.max(1, request.getQuestionCount());
        List<Question> selectedQuestions = new ArrayList<>();

        if (request.getJobRole().equalsIgnoreCase("RESUME")) {
            List<Resume> resumes = resumeRepository.findByUserIdOrderByUploadedAtDesc(userId);
            if (resumes.isEmpty()) {
                throw new BadRequestException("Please upload your resume in the Resume Analyzer first.");
            }
            Resume resume = resumes.get(0);
            List<String> skillNames = resume.getSkills().stream()
                    .map(Skill::getName)
                    .collect(Collectors.toList());
            if (skillNames.isEmpty()) {
                throw new BadRequestException("No skills detected in your resume. Please upload a resume with skills.");
            }

            // Call AI service to generate questions
            List<Map<String, Object>> aiQuestions = aiClientService.generateQuestions(
                    skillNames, "Software Engineer", request.getDifficulty(), questionCount);

            if (aiQuestions != null && !aiQuestions.isEmpty()) {
                for (Map<String, Object> qMap : aiQuestions) {
                    String qText = qMap.getOrDefault("question_text", "").toString();
                    String ideal = qMap.getOrDefault("ideal_answer", "").toString();
                    String diff = qMap.getOrDefault("difficulty", request.getDifficulty()).toString();
                    String catName = qMap.getOrDefault("category", "Resume-Based").toString();

                    if (qText.isEmpty()) continue;

                    Category category = categoryRepository.findByNameIgnoreCase(catName)
                            .orElseGet(() -> categoryRepository.save(Category.builder().name(catName).type("TECHNICAL").build()));

                    Question question = Question.builder()
                            .questionText(qText)
                            .idealAnswer(ideal)
                            .difficulty(diff.toUpperCase())
                            .type("TECHNICAL")
                            .category(category)
                            .aiGenerated(true)
                            .build();

                    question = questionRepository.save(question);
                    selectedQuestions.add(question);
                }
            }

            if (selectedQuestions.isEmpty()) {
                // Fallback: search DB for questions matching resume skills
                List<Question> dbQuestions = questionRepository.findByCategoryNameIn(skillNames);
                if (dbQuestions.isEmpty()) {
                    dbQuestions = questionRepository.findAll();
                }
                if (dbQuestions.isEmpty()) {
                    throw new BadRequestException("No questions available for your resume skills. Please seed questions or check AI service.");
                }
                Collections.shuffle(dbQuestions);
                selectedQuestions = dbQuestions.stream().limit(questionCount).collect(Collectors.toList());
            }
        } else {
            // Map job role to categories
            List<String> categoryNames;
            if (JOB_ROLE_CATEGORIES.containsKey(request.getJobRole())) {
                categoryNames = JOB_ROLE_CATEGORIES.get(request.getJobRole());
            } else {
                categoryNames = List.of(request.getJobRole());
            }

            // Query questions from DB
            List<Question> availableQuestions;
            if (request.getDifficulty() != null && !request.getDifficulty().equalsIgnoreCase("MIXED")) {
                availableQuestions = questionRepository.findByCategoryNameInAndDifficulty(
                        categoryNames, request.getDifficulty().toUpperCase());
            } else {
                availableQuestions = questionRepository.findByCategoryNameIn(categoryNames);
            }

            // Randomly select questionCount questions with priority to unseen ones
            List<Interview> recentInterviews = interviewRepository.findByUserIdAndStatusOrderByStartedAtDesc(userId, "COMPLETED");
            Set<Long> recentQuestionIds = new HashSet<>();
            if (recentInterviews != null) {
                recentInterviews.stream()
                    .limit(3)
                    .forEach(ri -> {
                        List<InterviewQuestion> riqs = interviewQuestionRepository.findByInterviewId(ri.getId());
                        if (riqs != null) {
                            for (InterviewQuestion riq : riqs) {
                                if ("ANSWERED".equals(riq.getStatus()) && riq.getQuestion() != null) {
                                    recentQuestionIds.add(riq.getQuestion().getId());
                                }
                            }
                        }
                    });
            }

            // Separate into unseen and seen questions
            List<Question> unseenQuestions = new ArrayList<>();
            List<Question> seenQuestions = new ArrayList<>();
            for (Question q : availableQuestions) {
                if (recentQuestionIds.contains(q.getId())) {
                    seenQuestions.add(q);
                } else {
                    unseenQuestions.add(q);
                }
            }

            Collections.shuffle(unseenQuestions);
            Collections.shuffle(seenQuestions);

            selectedQuestions.addAll(unseenQuestions);
            selectedQuestions.addAll(seenQuestions);

            selectedQuestions = selectedQuestions.stream()
                    .limit(questionCount)
                    .collect(Collectors.toList());

            if (selectedQuestions.isEmpty()) {
                throw new BadRequestException("No questions available for the selected role and difficulty");
            }
        }

        return selectedQuestions;
    }
}
