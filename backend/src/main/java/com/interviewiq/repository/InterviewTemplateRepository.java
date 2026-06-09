package com.interviewiq.repository;

import com.interviewiq.entity.InterviewTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InterviewTemplateRepository extends JpaRepository<InterviewTemplate, Long> {
    Optional<InterviewTemplate> findByTemplateName(String templateName);
}
