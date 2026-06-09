package com.interviewiq.controller;

import com.interviewiq.dto.request.StartInterviewRequest;
import com.interviewiq.dto.request.SubmitAnswerRequest;
import com.interviewiq.dto.response.*;
import com.interviewiq.entity.User;
import com.interviewiq.exception.ResourceNotFoundException;
import com.interviewiq.repository.UserRepository;
import com.interviewiq.service.InterviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interviews")
public class InterviewController {

    private final InterviewService interviewService;
    private final UserRepository userRepository;

    public InterviewController(InterviewService interviewService, UserRepository userRepository) {
        this.interviewService = interviewService;
        this.userRepository = userRepository;
    }

    @PostMapping("/start")
    public ResponseEntity<InterviewResponse> startInterview(
            @Valid @RequestBody StartInterviewRequest request,
            Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        InterviewResponse response = interviewService.startInterview(request, userId);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/schedule")
    public ResponseEntity<InterviewResponse> scheduleInterview(
            @Valid @RequestBody StartInterviewRequest request,
            @RequestParam("scheduledAt") @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime scheduledAt,
            Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        InterviewResponse response = interviewService.scheduleInterview(request, scheduledAt, userId);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<InterviewResponse> getInterview(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        InterviewResponse response = interviewService.getInterview(id, userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/next-question")
    public ResponseEntity<InterviewQuestionResponse> getNextQuestion(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        InterviewQuestionResponse response = interviewService.getNextQuestion(id, userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/submit-answer")
    public ResponseEntity<SubmitAnswerResponse> submitAnswer(
            @PathVariable Long id,
            @Valid @RequestBody SubmitAnswerRequest request,
            Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        SubmitAnswerResponse response = interviewService.submitAnswer(id, request, userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<MessageResponse> completeInterview(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        MessageResponse response = interviewService.completeInterview(id, userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/results")
    public ResponseEntity<InterviewResultsResponse> getResults(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        InterviewResultsResponse response = interviewService.getResults(id, userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    public ResponseEntity<List<InterviewResponse>> getHistory(Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        List<InterviewResponse> response = interviewService.getHistory(userId);
        return ResponseEntity.ok(response);
    }

    private Long getCurrentUserId(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return user.getId();
    }
}
