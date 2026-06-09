package com.interviewiq.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "admin_prompts")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class AdminPrompt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "prompt_type", nullable = false, length = 50)
    private String promptType;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "prompt_text", columnDefinition = "TEXT", nullable = false)
    private String promptText;

    @Column(nullable = false)
    private Integer version;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
