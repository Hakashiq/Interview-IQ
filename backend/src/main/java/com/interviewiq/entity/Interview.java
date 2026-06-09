package com.interviewiq.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "interviews", indexes = {
    @Index(name = "idx_interview_user_status", columnList = "user_id,status")
})
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Interview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "job_role", length = 100)
    private String jobRole;

    @Column(length = 20, nullable = false)
    private String difficulty;

    @Column(length = 20, nullable = false)
    private String mode;

    @Builder.Default
    @Column(length = 20, nullable = false)
    private String status = "IN_PROGRESS";

    @Column(name = "overall_score")
    private Integer overallScore;

    @Column(name = "communication_analysis", columnDefinition = "JSON")
    private String communicationAnalysis;

    @OneToMany(mappedBy = "interview", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<InterviewQuestion> interviewQuestions = new ArrayList<>();

    @CreatedDate
    @Column(name = "started_at", updatable = false)
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "scheduled_at")
    private LocalDateTime scheduledAt;

    @Builder.Default
    @Column(name = "notified_30m", nullable = false)
    private Boolean notified30m = false;
}
