package com.interviewiq.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class InterviewResponse {
    private Long id;
    private String jobRole;
    private String difficulty;
    private String mode;
    private String status;
    private int totalQuestions;
    private int answeredCount;
    private Integer overallScore;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
}
