package com.interviewiq.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "interview_questions")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class InterviewQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_id", nullable = false)
    private Interview interview;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(name = "sequence_order", nullable = false)
    private Integer sequenceOrder;

    @Builder.Default
    @Column(length = 20, nullable = false)
    private String status = "PENDING";

    @OneToOne(mappedBy = "interviewQuestion", cascade = CascadeType.ALL, orphanRemoval = true)
    private Answer answer;
}
