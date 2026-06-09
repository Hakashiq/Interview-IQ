package com.interviewiq.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class RecommendationResponse {
    private Long id;
    private String type;
    private String content;
    private String roadmap;
    private LocalDateTime generatedAt;
}
