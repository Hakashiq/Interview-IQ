package com.interviewiq.service;

import com.interviewiq.dto.response.RecommendationResponse;
import java.util.List;

public interface RecommendationService {
    List<RecommendationResponse> getRecommendations(Long userId);
    RecommendationResponse generateRecommendations(Long userId);
}
