package com.interviewiq.repository;

import com.interviewiq.entity.Answer;
import com.interviewiq.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    Optional<Feedback> findByAnswer(Answer answer);
}
