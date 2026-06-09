package com.interviewiq.dto.response;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AnswerFeedbackResponse {
    private Integer technicalAccuracy;
    private Integer completeness;
    private Integer communication;
    private Integer relevance;
    private Integer confidence;
    private Integer overallScore;
    private String strengths;
    private String weaknesses;
    private String improvements;
}
