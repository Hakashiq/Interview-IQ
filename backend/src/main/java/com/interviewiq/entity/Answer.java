package com.interviewiq.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "answers", indexes = {
    @Index(name = "idx_answer_iq_id", columnList = "interview_question_id")
})
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Answer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_question_id", nullable = false, unique = true)
    private InterviewQuestion interviewQuestion;

    @Column(name = "answer_text", columnDefinition = "TEXT")
    private String answerText;

    @Column(name = "audio_path")
    private String audioPath;

    @Column(columnDefinition = "TEXT")
    private String transcript;

    @Column(name = "time_taken_seconds")
    private Integer timeTakenSeconds;

    @CreatedDate
    @Column(name = "submitted_at", updatable = false)
    private LocalDateTime submittedAt;

    @OneToOne(mappedBy = "answer", cascade = CascadeType.ALL, orphanRemoval = true)
    private Feedback feedback;
}
