package com.interviewiq.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "resumes")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Resume {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "file_path", nullable = false)
    private String filePath;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "raw_text", columnDefinition = "TEXT")
    private String rawText;

    @Column(name = "resume_score")
    private Integer resumeScore;

    @Column(name = "ats_score")
    private Integer atsScore;

    @Column(name = "recruiter_score")
    private Integer recruiterScore;

    @Column(name = "technical_depth_score")
    private Integer technicalDepthScore;

    @Column(name = "interview_readiness_score")
    private Integer interviewReadinessScore;

    @Column(name = "final_resume_content", columnDefinition = "LONGTEXT")
    private String finalResumeContent;

    @Column(name = "extracted_data", columnDefinition = "JSON")
    private String extractedData;

    @Column(name = "improvement_suggestions", columnDefinition = "JSON")
    private String improvementSuggestions;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "resume_skills",
        joinColumns = @JoinColumn(name = "resume_id"),
        inverseJoinColumns = @JoinColumn(name = "skill_id")
    )
    @Builder.Default
    private Set<Skill> skills = new HashSet<>();

    @CreatedDate
    @Column(name = "uploaded_at", updatable = false)
    private LocalDateTime uploadedAt;
}
