package com.interviewiq.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.interviewiq.dto.request.UpdateProfileRequest;
import com.interviewiq.dto.response.MessageResponse;
import com.interviewiq.dto.response.UserProfileResponse;
import com.interviewiq.entity.Resume;
import com.interviewiq.entity.User;
import com.interviewiq.exception.BadRequestException;
import com.interviewiq.exception.ResourceNotFoundException;
import com.interviewiq.repository.ResumeRepository;
import com.interviewiq.repository.UserRepository;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final ResumeRepository resumeRepository;
    private final ObjectMapper objectMapper;
    private final String avatarDir = "./uploads/avatars";

    public UserController(UserRepository userRepository,
                          ResumeRepository resumeRepository,
                          ObjectMapper objectMapper) {
        this.userRepository = userRepository;
        this.resumeRepository = resumeRepository;
        this.objectMapper = objectMapper;
    }

    @PostMapping("/penalty")
    public ResponseEntity<MessageResponse> applyPenalty(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setBannedUntil(LocalDateTime.now().plusDays(1));
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("Penalty applied. Account banned for 24 hours."));
    }

    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getProfile(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return ResponseEntity.ok(mapToProfileResponse(user));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @RequestBody UpdateProfileRequest request,
            Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setEducation(request.getEducation());
        user.setAddress(request.getAddress());
        user.setGithubUrl(request.getGithubUrl());
        user.setLinkedinUrl(request.getLinkedinUrl());
        user.setLeetcodeUrl(request.getLeetcodeUrl());

        user = userRepository.save(user);
        return ResponseEntity.ok(mapToProfileResponse(user));
    }

    @PostMapping("/profile/avatar")
    public ResponseEntity<UserProfileResponse> uploadAvatar(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new BadRequestException("Filename is invalid");
        }

        String extension = originalFilename.substring(originalFilename.lastIndexOf('.') + 1).toLowerCase();
        List<String> allowedExtensions = Arrays.asList("jpg", "jpeg", "png", "gif", "webp");
        if (!allowedExtensions.contains(extension)) {
            throw new BadRequestException("Only images (JPG, PNG, GIF, WEBP) are allowed");
        }

        try {
            Path uploadPath = Paths.get(avatarDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);

            String storedFileName = "avatar_" + user.getId() + "_" + UUID.randomUUID() + "." + extension;
            Path targetLocation = uploadPath.resolve(storedFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            user.setAvatarUrl("/api/users/profile/avatar/view/" + storedFileName);
            user = userRepository.save(user);

            return ResponseEntity.ok(mapToProfileResponse(user));
        } catch (IOException e) {
            throw new BadRequestException("Failed to upload avatar: " + e.getMessage());
        }
    }

    @GetMapping("/profile/avatar/view/{filename:.+}")
    public ResponseEntity<Resource> getAvatar(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(avatarDir).resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists()) {
                String contentType = "image/jpeg";
                if (filename.toLowerCase().endsWith(".png")) {
                    contentType = "image/png";
                } else if (filename.toLowerCase().endsWith(".gif")) {
                    contentType = "image/gif";
                } else if (filename.toLowerCase().endsWith(".webp")) {
                    contentType = "image/webp";
                }
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/profile/import-resume")
    public ResponseEntity<UserProfileResponse> importFromLatestResume(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Resume> resumes = resumeRepository.findByUserIdOrderByUploadedAtDesc(user.getId());
        if (resumes.isEmpty()) {
            throw new BadRequestException("No resume found. Please upload a resume first under the Resume Analyzer section.");
        }

        Resume latestResume = resumes.get(0);
        String extractedJson = latestResume.getExtractedData();
        String rawText = latestResume.getRawText();

        if (extractedJson != null && !extractedJson.isEmpty()) {
            try {
                Map<String, Object> data = objectMapper.readValue(extractedJson, Map.class);
                
                String name = (String) data.get("name");
                if (name != null && !name.trim().isEmpty() && !name.equalsIgnoreCase("Candidate Name")) {
                    user.setFullName(name);
                }

                String phone = (String) data.get("phone");
                if (phone != null && !phone.trim().isEmpty()) {
                    user.setPhone(phone);
                }

                String address = (String) data.get("address");
                if (address == null || address.trim().isEmpty()) {
                    address = (String) data.get("location");
                }
                if (address != null && !address.trim().isEmpty()) {
                    user.setAddress(address);
                }

                List<Map<String, Object>> eduList = (List<Map<String, Object>>) data.get("education");
                if (eduList != null && !eduList.isEmpty()) {
                    StringBuilder sb = new StringBuilder();
                    for (Map<String, Object> edu : eduList) {
                        String degree = (String) edu.get("degree");
                        String inst = (String) edu.get("institution");
                        String year = (String) edu.get("year");
                        String gpa = (String) edu.get("gpa");
                        
                        if (degree != null && !degree.isEmpty()) sb.append(degree);
                        if (inst != null && !inst.isEmpty()) sb.append(" at ").append(inst);
                        if (year != null && !year.isEmpty()) sb.append(" (").append(year).append(")");
                        if (gpa != null && !gpa.isEmpty() && !gpa.equalsIgnoreCase("N/A")) sb.append(" - GPA: ").append(gpa);
                        sb.append("\n");
                    }
                    user.setEducation(sb.toString().trim());
                }
            } catch (Exception e) {
                // Ignore parse errors, continue to heuristic link regex
            }
        }

        if (rawText != null && !rawText.isEmpty()) {
            // Extract GitHub
            Pattern githubPattern = Pattern.compile("github\\.com/[\\w.-]+", Pattern.CASE_INSENSITIVE);
            Matcher githubMatcher = githubPattern.matcher(rawText);
            if (githubMatcher.find()) {
                String match = githubMatcher.group(0);
                user.setGithubUrl(match.startsWith("http") ? match : "https://" + match);
            }

            // Extract LinkedIn
            Pattern linkedinPattern = Pattern.compile("linkedin\\.com/in/[\\w.-]+", Pattern.CASE_INSENSITIVE);
            Matcher linkedinMatcher = linkedinPattern.matcher(rawText);
            if (linkedinMatcher.find()) {
                String match = linkedinMatcher.group(0);
                user.setLinkedinUrl(match.startsWith("http") ? match : "https://" + match);
            }

            // Extract LeetCode
            Pattern leetcodePattern = Pattern.compile("leetcode\\.com/[\\w.-]+", Pattern.CASE_INSENSITIVE);
            Matcher leetcodeMatcher = leetcodePattern.matcher(rawText);
            if (leetcodeMatcher.find()) {
                String match = leetcodeMatcher.group(0);
                user.setLeetcodeUrl(match.startsWith("http") ? match : "https://" + match);
            }

            // Heuristic address extraction from raw text if not found in JSON (or if still CAMBRIDGE MIT address from testing)
            if (user.getAddress() == null || user.getAddress().trim().isEmpty() || user.getAddress().contains("Massachusetts Ave")) {
                String[] lines = rawText.split("\n");
                for (int i = 0; i < Math.min(lines.length, 25); i++) {
                    String line = lines[i].trim();
                    if (line.isEmpty() || line.contains("@") || line.contains("http") || 
                        line.toLowerCase().contains("github") || line.toLowerCase().contains("linkedin") ||
                        line.toLowerCase().contains("developer") || line.toLowerCase().contains("engineer") ||
                        line.toLowerCase().contains("education") || line.toLowerCase().contains("experience")) {
                        continue;
                    }
                    if (line.contains(",")) {
                        String[] parts = line.split(",");
                        if (parts.length == 2 && parts[0].trim().length() > 2 && parts[1].trim().length() > 2) {
                            user.setAddress(line);
                            break;
                        }
                    }
                }
            }
        }

        user = userRepository.save(user);
        return ResponseEntity.ok(mapToProfileResponse(user));
    }

    private UserProfileResponse mapToProfileResponse(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .education(user.getEducation())
                .address(user.getAddress())
                .githubUrl(user.getGithubUrl())
                .linkedinUrl(user.getLinkedinUrl())
                .leetcodeUrl(user.getLeetcodeUrl())
                .roles(user.getRoles().stream()
                        .map(role -> role.getName())
                        .collect(Collectors.toList()))
                .build();
    }
}
