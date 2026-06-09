package com.interviewiq.controller;

import com.interviewiq.dto.response.RecommendationResponse;
import com.interviewiq.entity.User;
import com.interviewiq.exception.ResourceNotFoundException;
import com.interviewiq.repository.UserRepository;
import com.interviewiq.service.RecommendationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    private final RecommendationService recommendationService;
    private final UserRepository userRepository;

    public RecommendationController(RecommendationService recommendationService, UserRepository userRepository) {
        this.recommendationService = recommendationService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<RecommendationResponse>> getRecommendations(Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        List<RecommendationResponse> response = recommendationService.getRecommendations(userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/generate")
    public ResponseEntity<RecommendationResponse> generateRecommendations(Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        RecommendationResponse response = recommendationService.generateRecommendations(userId);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    private Long getCurrentUserId(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return user.getId();
    }
}
