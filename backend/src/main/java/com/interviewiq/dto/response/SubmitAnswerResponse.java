package com.interviewiq.dto.response;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class SubmitAnswerResponse {
    private AnswerFeedbackResponse feedback;
}
