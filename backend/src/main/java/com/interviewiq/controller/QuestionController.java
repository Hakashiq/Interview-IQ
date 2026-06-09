package com.interviewiq.controller;

import com.interviewiq.dto.response.CategoryResponse;
import com.interviewiq.dto.response.QuestionResponse;
import com.interviewiq.service.QuestionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class QuestionController {

    private final QuestionService questionService;

    public QuestionController(QuestionService questionService) {
        this.questionService = questionService;
    }

    @GetMapping("/questions")
    public ResponseEntity<List<QuestionResponse>> getQuestions(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String difficulty) {
        List<QuestionResponse> response = questionService.getQuestions(category, difficulty);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/categories")
    public ResponseEntity<List<CategoryResponse>> getCategories() {
        List<CategoryResponse> response = questionService.getCategories();
        return ResponseEntity.ok(response);
    }
}
