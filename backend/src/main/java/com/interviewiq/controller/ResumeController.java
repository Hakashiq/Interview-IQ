package com.interviewiq.controller;

import com.interviewiq.dto.response.ResumeDetailResponse;
import com.interviewiq.dto.response.ResumeUploadResponse;
import com.interviewiq.entity.User;
import com.interviewiq.exception.ResourceNotFoundException;
import com.interviewiq.repository.UserRepository;
import com.interviewiq.service.ResumeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/resumes")
public class ResumeController {

    private final ResumeService resumeService;
    private final UserRepository userRepository;

    public ResumeController(ResumeService resumeService, UserRepository userRepository) {
        this.resumeService = resumeService;
        this.userRepository = userRepository;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ResumeUploadResponse> uploadResume(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        ResumeUploadResponse response = resumeService.uploadResume(file, userId);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/latest")
    public ResponseEntity<ResumeDetailResponse> getLatestResume(Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        ResumeDetailResponse response = resumeService.getLatestResume(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResumeDetailResponse> getResumeById(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        ResumeDetailResponse response = resumeService.getResumeById(id, userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/skills")
    public ResponseEntity<List<ResumeDetailResponse.SkillInfo>> getResumeSkills(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        List<ResumeDetailResponse.SkillInfo> skills = resumeService.getResumeSkills(id, userId);
        return ResponseEntity.ok(skills);
    }

    private Long getCurrentUserId(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return user.getId();
    }
}
