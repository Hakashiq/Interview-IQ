package com.interviewiq.dto.response;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class QuestionResponse {
    private Long id;
    private String questionText;
    private String idealAnswer;
    private String category;
    private String difficulty;
    private String type;
}
