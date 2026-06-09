package com.interviewiq.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumeUploadResponse {
    private Long id;
    private String fileName;
    private Integer resumeScore;
    private Integer atsScore;
    private Integer recruiterScore;
    private Integer technicalDepthScore;
    private Integer interviewReadinessScore;
    private String finalResumeContent;
    private List<String> skills;
    private List<String> extractedSkills;
    private List<SuggestionDto> suggestions;
    private String message;
    private LocalDateTime uploadedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SuggestionDto {
        private String priority;
        private String title;
        private String description;
    }
}
