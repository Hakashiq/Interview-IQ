package com.interviewiq.dto.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class InterviewResultsResponse {
    private Long id;
    private String jobRole;
    private String difficulty;
    private String mode;
    private String status;
    private Integer overallScore;
    private int totalQuestions;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private List<QuestionResult> questions;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class QuestionResult {
        private Long interviewQuestionId;
        private String questionText;
        private String category;
        private String difficulty;
        private Integer sequenceOrder;
        private String answerText;
        private Integer timeTakenSeconds;
        private AnswerFeedbackResponse feedback;
    }
}
