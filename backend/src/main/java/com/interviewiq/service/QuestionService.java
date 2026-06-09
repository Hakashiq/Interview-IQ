package com.interviewiq.service;

import com.interviewiq.dto.response.CategoryResponse;
import com.interviewiq.dto.response.QuestionResponse;
import java.util.List;

public interface QuestionService {
    List<QuestionResponse> getQuestions(String category, String difficulty);
    List<CategoryResponse> getCategories();
}
