package com.interviewiq.service.impl;

import com.interviewiq.dto.response.RecommendationResponse;
import com.interviewiq.entity.*;
import com.interviewiq.exception.ResourceNotFoundException;
import com.interviewiq.repository.*;
import com.interviewiq.service.AIClientService;
import com.interviewiq.service.RecommendationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationServiceImpl implements RecommendationService {

    private static final Logger logger = LoggerFactory.getLogger(RecommendationServiceImpl.class);

    private final RecommendationRepository recommendationRepository;
    private final InterviewRepository interviewRepository;
    private final InterviewQuestionRepository interviewQuestionRepository;
    private final AnswerRepository answerRepository;
    private final FeedbackRepository feedbackRepository;
    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final AIClientService aiClientService;

    public RecommendationServiceImpl(RecommendationRepository recommendationRepository,
                                     InterviewRepository interviewRepository,
                                     InterviewQuestionRepository interviewQuestionRepository,
                                     AnswerRepository answerRepository,
                                     FeedbackRepository feedbackRepository,
                                     ResumeRepository resumeRepository,
                                     UserRepository userRepository,
                                     AIClientService aiClientService) {
        this.recommendationRepository = recommendationRepository;
        this.interviewRepository = interviewRepository;
        this.interviewQuestionRepository = interviewQuestionRepository;
        this.answerRepository = answerRepository;
        this.feedbackRepository = feedbackRepository;
        this.resumeRepository = resumeRepository;
        this.userRepository = userRepository;
        this.aiClientService = aiClientService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<RecommendationResponse> getRecommendations(Long userId) {
        return recommendationRepository.findByUserIdOrderByGeneratedAtDesc(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public RecommendationResponse generateRecommendations(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Gather user skills from resumes
        List<String> userSkills = resumeRepository.findByUserIdOrderByUploadedAtDesc(userId).stream()
                .flatMap(resume -> resume.getSkills().stream())
                .map(Skill::getName)
                .distinct()
                .collect(Collectors.toList());

        // Gather interview scores
        List<Interview> completedInterviews = interviewRepository
                .findByUserIdAndStatusOrderByStartedAtDesc(userId, "COMPLETED");

        List<Map<String, Object>> interviewScores = new ArrayList<>();
        Set<String> weakTopicsSet = new HashSet<>();

        for (Interview interview : completedInterviews) {
            Map<String, Object> scoreEntry = new HashMap<>();
            scoreEntry.put("job_role", interview.getJobRole());
            scoreEntry.put("overall_score", interview.getOverallScore());

            List<InterviewQuestion> questions = interviewQuestionRepository.findByInterviewId(interview.getId());
            for (InterviewQuestion iq : questions) {
                Answer answer = answerRepository.findByInterviewQuestion(iq).orElse(null);
                if (answer != null) {
                    Feedback feedback = feedbackRepository.findByAnswer(answer).orElse(null);
                    if (feedback != null && feedback.getOverallScore() != null && feedback.getOverallScore() < 60) {
                        weakTopicsSet.add(iq.getQuestion().getCategory().getName());
                    }
                }
            }

            interviewScores.add(scoreEntry);
        }

        List<String> weakTopics = new ArrayList<>(weakTopicsSet);

        // Call AI service
        Map<String, Object> aiResult = aiClientService.generateRecommendations(
                userSkills, interviewScores, weakTopics);

        // Save recommendation
        String type = aiResult.getOrDefault("type", "GENERAL").toString();
        String content = aiResult.getOrDefault("content",
                "Based on your interview performance, focus on improving your weaker areas. Practice more questions in topics where you scored below 60%.").toString();
        String roadmap = aiResult.containsKey("roadmap") ? aiResult.get("roadmap").toString() : null;

        Recommendation recommendation = Recommendation.builder()
                .user(user)
                .type(type)
                .content(content)
                .roadmap(roadmap)
                .build();

        recommendation = recommendationRepository.save(recommendation);
        logger.info("Recommendation generated for user: {} with type: {}", userId, type);

        return mapToResponse(recommendation);
    }

    private RecommendationResponse mapToResponse(Recommendation recommendation) {
        return RecommendationResponse.builder()
                .id(recommendation.getId())
                .type(recommendation.getType())
                .content(recommendation.getContent())
                .roadmap(recommendation.getRoadmap())
                .generatedAt(recommendation.getGeneratedAt())
                .build();
    }
}
