package com.interviewiq.repository;

import com.interviewiq.entity.Answer;
import com.interviewiq.entity.InterviewQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AnswerRepository extends JpaRepository<Answer, Long> {
    Optional<Answer> findByInterviewQuestion(InterviewQuestion interviewQuestion);
}
