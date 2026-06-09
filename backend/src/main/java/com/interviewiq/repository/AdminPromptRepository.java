package com.interviewiq.repository;

import com.interviewiq.entity.AdminPrompt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdminPromptRepository extends JpaRepository<AdminPrompt, Long> {
    List<AdminPrompt> findByPromptTypeOrderByVersionDesc(String promptType);
}
