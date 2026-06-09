package com.interviewiq.repository;

import com.interviewiq.entity.Category;
import com.interviewiq.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByCategoryAndDifficulty(Category category, String difficulty);
    List<Question> findByCategoryNameInAndDifficulty(List<String> categoryNames, String difficulty);
    List<Question> findByCategoryNameIn(List<String> categoryNames);
}
