package com.interviewiq.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_feedbacks")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class UserFeedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String username;

    @Column(nullable = false)
    private Integer rating;

    @Column(nullable = false, length = 50)
    private String category; // e.g. COMPLAINT, SUGGESTION, FEATURE_REQUEST

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    @Column(nullable = false, length = 20)
    private String status; // e.g. PENDING, RESOLVED

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
