package com.interviewiq.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class StartInterviewRequest {
    @NotBlank(message = "Job role is required")
    private String jobRole;
    @NotBlank(message = "Difficulty is required")
    private String difficulty;
    @NotBlank(message = "Mode is required")
    private String mode;
    private int questionCount = 5;
}
