package com.interviewiq.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class SubmitAnswerRequest {
    @NotNull(message = "Interview question ID is required")
    private Long interviewQuestionId;
    @NotBlank(message = "Answer text is required")
    private String answerText;
    private Integer timeTakenSeconds;
}
