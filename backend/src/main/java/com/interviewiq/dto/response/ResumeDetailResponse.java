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
public class ResumeDetailResponse {
    private Long id;
    private String fileName;
    private String rawText;
    private Integer resumeScore;
    private Integer atsScore;
    private Integer recruiterScore;
    private Integer technicalDepthScore;
    private Integer interviewReadinessScore;
    private String finalResumeContent;
    private String extractedData;
    private String improvementSuggestions;
    private List<SkillInfo> skills;
    private List<SuggestionDto> suggestions;
    private LocalDateTime uploadedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SkillInfo {
        private Long id;
        private String name;
        private String category;
    }

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
