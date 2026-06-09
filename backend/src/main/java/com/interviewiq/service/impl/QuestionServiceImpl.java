package com.interviewiq.service.impl;

import com.interviewiq.dto.response.CategoryResponse;
import com.interviewiq.dto.response.QuestionResponse;
import com.interviewiq.entity.Category;
import com.interviewiq.entity.Question;
import com.interviewiq.repository.CategoryRepository;
import com.interviewiq.repository.QuestionRepository;
import com.interviewiq.service.QuestionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class QuestionServiceImpl implements QuestionService {

    private static final Logger logger = LoggerFactory.getLogger(QuestionServiceImpl.class);

    private final QuestionRepository questionRepository;
    private final CategoryRepository categoryRepository;

    public QuestionServiceImpl(QuestionRepository questionRepository,
                               CategoryRepository categoryRepository) {
        this.questionRepository = questionRepository;
        this.categoryRepository = categoryRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuestionResponse> getQuestions(String category, String difficulty) {
        List<Question> questions;

        if (category != null && !category.isBlank() && difficulty != null && !difficulty.isBlank()) {
            Category cat = categoryRepository.findByName(category).orElse(null);
            if (cat == null) {
                return List.of();
            }
            questions = questionRepository.findByCategoryAndDifficulty(cat, difficulty.toUpperCase());
        } else if (category != null && !category.isBlank()) {
            Category cat = categoryRepository.findByName(category).orElse(null);
            if (cat == null) {
                return List.of();
            }
            questions = questionRepository.findByCategoryNameIn(List.of(category));
        } else if (difficulty != null && !difficulty.isBlank()) {
            questions = questionRepository.findAll().stream()
                    .filter(q -> difficulty.equalsIgnoreCase(q.getDifficulty()))
                    .collect(Collectors.toList());
        } else {
            questions = questionRepository.findAll();
        }

        return questions.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategories() {
        return categoryRepository.findAll().stream()
                .map(cat -> CategoryResponse.builder()
                        .id(cat.getId())
                        .name(cat.getName())
                        .type(cat.getType())
                        .build())
                .collect(Collectors.toList());
    }

    private QuestionResponse mapToResponse(Question question) {
        return QuestionResponse.builder()
                .id(question.getId())
                .questionText(question.getQuestionText())
                .idealAnswer(question.getIdealAnswer())
                .category(question.getCategory().getName())
                .difficulty(question.getDifficulty())
                .type(question.getType())
                .build();
    }
}
