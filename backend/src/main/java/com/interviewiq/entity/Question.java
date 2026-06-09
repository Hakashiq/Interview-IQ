package com.interviewiq.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "questions", indexes = {
    @Index(name = "idx_question_category_difficulty", columnList = "category_id,difficulty")
})
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(name = "question_text", nullable = false, columnDefinition = "TEXT")
    private String questionText;

    @Column(name = "ideal_answer", columnDefinition = "TEXT")
    private String idealAnswer;

    @Column(length = 20, nullable = false)
    private String difficulty;

    @Column(length = 20, nullable = false)
    private String type;

    @Builder.Default
    @Column(name = "ai_generated", nullable = false)
    private Boolean aiGenerated = false;
}
