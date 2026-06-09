package com.interviewiq.dto.response;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class InterviewQuestionResponse {
    private Long interviewQuestionId;
    private String questionText;
    private String category;
    private String difficulty;
    private Integer sequenceOrder;
}
