package com.interviewiq.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "interview_templates")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class InterviewTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "template_name", nullable = false, unique = true, length = 100)
    private String templateName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 20)
    private String difficulty;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @Column(name = "question_count", nullable = false)
    private Integer questionCount;

    @Column(name = "selection_strategy", nullable = false, length = 30)
    private String selectionStrategy;

    @Column(name = "skills_list", columnDefinition = "TEXT")
    private String skillsList;
}
