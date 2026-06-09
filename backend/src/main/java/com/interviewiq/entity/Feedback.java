package com.interviewiq.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "feedback", indexes = {
    @Index(name = "idx_feedback_answer", columnList = "answer_id")
})
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "answer_id", nullable = false, unique = true)
    private Answer answer;

    @Column(name = "technical_accuracy")
    private Integer technicalAccuracy;

    @Column
    private Integer completeness;

    @Column
    private Integer communication;

    @Column
    private Integer relevance;

    @Column
    private Integer confidence;

    @Column(name = "overall_score")
    private Integer overallScore;

    @Column(columnDefinition = "TEXT")
    private String strengths;

    @Column(columnDefinition = "TEXT")
    private String weaknesses;

    @Column(columnDefinition = "TEXT")
    private String improvements;
}
