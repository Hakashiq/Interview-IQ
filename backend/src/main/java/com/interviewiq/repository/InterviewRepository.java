package com.interviewiq.repository;

import com.interviewiq.entity.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {
    List<Interview> findByUserIdOrderByStartedAtDesc(Long userId);
    long countByUserId(Long userId);
    List<Interview> findByUserIdAndStatusOrderByStartedAtDesc(Long userId, String status);
    List<Interview> findByStatus(String status);
}
