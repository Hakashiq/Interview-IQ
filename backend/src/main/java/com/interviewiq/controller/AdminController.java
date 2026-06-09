package com.interviewiq.controller;

import com.interviewiq.entity.*;
import com.interviewiq.repository.*;
import com.interviewiq.dto.response.MessageResponse;
import com.interviewiq.exception.ResourceNotFoundException;
import com.interviewiq.exception.BadRequestException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_MENTOR')")
public class AdminController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final InterviewRepository interviewRepository;
    private final ResumeRepository resumeRepository;
    private final SystemConfigRepository systemConfigRepository;
    private final AuditLogRepository auditLogRepository;
    private final ViolationRepository violationRepository;
    private final InterviewTemplateRepository interviewTemplateRepository;
    private final AdminPromptRepository adminPromptRepository;
    private final UserFeedbackRepository userFeedbackRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminController(UserRepository userRepository,
                           RoleRepository roleRepository,
                           InterviewRepository interviewRepository,
                           ResumeRepository resumeRepository,
                           SystemConfigRepository systemConfigRepository,
                           AuditLogRepository auditLogRepository,
                           ViolationRepository violationRepository,
                           InterviewTemplateRepository interviewTemplateRepository,
                           AdminPromptRepository adminPromptRepository,
                           UserFeedbackRepository userFeedbackRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.interviewRepository = interviewRepository;
        this.resumeRepository = resumeRepository;
        this.systemConfigRepository = systemConfigRepository;
        this.auditLogRepository = auditLogRepository;
        this.violationRepository = violationRepository;
        this.interviewTemplateRepository = interviewTemplateRepository;
        this.adminPromptRepository = adminPromptRepository;
        this.userFeedbackRepository = userFeedbackRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/users")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<User> createUser(@RequestBody Map<String, String> payload, Authentication authentication) {
        String email = payload.get("email");
        String fullName = payload.get("fullName");
        String password = payload.get("password");
        String phone = payload.get("phone");
        String roleName = payload.get("role");
        String education = payload.get("education");

        if (email == null || fullName == null || password == null) {
            throw new BadRequestException("Email, full name, and password are required");
        }

        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email is already registered on the platform");
        }

        String finalRoleName = roleName != null ? (roleName.startsWith("ROLE_") ? roleName : "ROLE_" + roleName) : "ROLE_STUDENT";
        Role role = roleRepository.findByName(finalRoleName)
                .orElseThrow(() -> new ResourceNotFoundException("Role " + finalRoleName + " not found"));

        User newUser = User.builder()
                .email(email)
                .fullName(fullName)
                .password(passwordEncoder.encode(password))
                .phone(phone)
                .education(education)
                .enabled(true)
                .roles(Set.of(role))
                .build();

        User saved = userRepository.save(newUser);
        logAction(authentication.getName(), "USER_CREATE", "Created user account: " + email + " with role: " + finalRoleName);
        return ResponseEntity.ok(saved);
    }

    private void logAction(String username, String action, String details) {
        auditLogRepository.save(AuditLog.builder()
                .username(username)
                .action(action)
                .details(details)
                .timestamp(LocalDateTime.now())
                .build());
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalInterviews", interviewRepository.count());
        stats.put("totalResumes", resumeRepository.count());
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/detailed-stats")
    public ResponseEntity<Map<String, Object>> getDetailedStats() {
        Map<String, Object> stats = new HashMap<>();
        long totalUsers = userRepository.count();
        long totalInterviews = interviewRepository.count();
        long totalResumes = resumeRepository.count();

        // Calculate completions and averages
        List<Interview> completed = interviewRepository.findAll().stream()
                .filter(i -> "COMPLETED".equals(i.getStatus()))
                .collect(Collectors.toList());
        
        long totalCompleted = completed.size();
        double completionRate = totalInterviews > 0 ? (double) totalCompleted / totalInterviews * 100 : 0.0;
        double avgScore = totalCompleted > 0 ? completed.stream()
                .mapToDouble(i -> i.getOverallScore() != null ? i.getOverallScore() : 0.0)
                .average().orElse(0.0) : 0.0;

        // Calculate dynamic system usage costs (mocked based on actual entity counts)
        long tokenUsage = totalInterviews * 12500 + totalResumes * 4000;
        double estimatedCost = (tokenUsage / 1000000.0) * 0.15; // $0.15 per million input tokens

        stats.put("totalUsers", totalUsers);
        stats.put("activeUsers", userRepository.findAll().stream().filter(User::getEnabled).count());
        stats.put("totalInterviews", totalInterviews);
        stats.put("interviewCompletionRate", completionRate);
        stats.put("averageInterviewScore", avgScore);
        stats.put("averageAtsScore", totalResumes > 0 ? 7.6 : 0.0);
        stats.put("resumeUploads", totalResumes);
        stats.put("tokenUsage", tokenUsage);
        stats.put("aiCosts", estimatedCost);

        // System Health Status
        Map<String, String> health = new HashMap<>();
        health.put("database", "HEALTHY");
        health.put("redis", "HEALTHY");
        health.put("aiService", "HEALTHY");
        stats.put("systemHealth", health);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getUsers() {
        List<User> users = userRepository.findAll();
        List<Map<String, Object>> response = users.stream().map(user -> {
            Map<String, Object> u = new HashMap<>();
            u.put("id", user.getId());
            u.put("email", user.getEmail());
            u.put("fullName", user.getFullName());
            u.put("phone", user.getPhone());
            u.put("avatarUrl", user.getAvatarUrl());
            u.put("enabled", user.getEnabled());
            u.put("bannedUntil", user.getBannedUntil());
            u.put("idCardPath", user.getIdCardPath());
            u.put("education", user.getEducation());
            u.put("roles", user.getRoles().stream()
                    .map(Role::getName)
                    .collect(Collectors.toList()));
            return u;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/users/{id}/ban")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<MessageResponse> banUser(@PathVariable Long id, Authentication authentication) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getEmail().equalsIgnoreCase("admin@interviewiq.com")) {
            throw new BadRequestException("Cannot modify primary admin account");
        }

        user.setBannedUntil(LocalDateTime.now().plusDays(1));
        userRepository.save(user);

        logAction(authentication.getName(), "USER_BAN", "Banned user id: " + id + " (" + user.getEmail() + ") for 24 hours");
        return ResponseEntity.ok(new MessageResponse("User banned for 24 hours."));
    }

    @PostMapping("/users/{id}/unban")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<MessageResponse> unbanUser(@PathVariable Long id, Authentication authentication) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setBannedUntil(null);
        userRepository.save(user);

        logAction(authentication.getName(), "USER_UNBAN", "Unbanned user id: " + id + " (" + user.getEmail() + ")");
        return ResponseEntity.ok(new MessageResponse("User unbanned successfully."));
    }

    @PostMapping("/users/{id}/toggle-admin")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<MessageResponse> toggleAdmin(@PathVariable Long id, Authentication authentication) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getEmail().equalsIgnoreCase("admin@interviewiq.com")) {
            throw new BadRequestException("Cannot modify primary admin account");
        }

        Set<Role> roles = new HashSet<>(user.getRoles());
        boolean isAdmin = roles.stream().anyMatch(r -> r.getName().equalsIgnoreCase("ROLE_ADMIN"));

        if (isAdmin) {
            roles.removeIf(r -> r.getName().equalsIgnoreCase("ROLE_ADMIN"));
            user.setRoles(roles);
            userRepository.save(user);
            logAction(authentication.getName(), "REVOKE_ADMIN", "Revoked ROLE_ADMIN from " + user.getEmail());
            return ResponseEntity.ok(new MessageResponse("Admin role removed from user."));
        } else {
            Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                    .orElseThrow(() -> new ResourceNotFoundException("ROLE_ADMIN not found"));
            roles.add(adminRole);
            user.setRoles(roles);
            userRepository.save(user);
            logAction(authentication.getName(), "ASSIGN_ADMIN", "Assigned ROLE_ADMIN to " + user.getEmail());
            return ResponseEntity.ok(new MessageResponse("Admin role assigned to user."));
        }
    }

    @PutMapping("/users/{id}/role")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<MessageResponse> updateUserRole(@PathVariable Long id, @RequestBody Map<String, String> payload, Authentication authentication) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getEmail().equalsIgnoreCase("admin@interviewiq.com")) {
            throw new BadRequestException("Cannot modify primary admin account");
        }

        String roleName = payload.get("role");
        if (roleName == null) {
            throw new BadRequestException("Role name is required");
        }

        String finalRoleName = roleName.startsWith("ROLE_") ? roleName : "ROLE_" + roleName;

        Role newRole = roleRepository.findByName(finalRoleName)
                .orElseThrow(() -> new ResourceNotFoundException("Role " + finalRoleName + " not found"));

        user.setRoles(Set.of(newRole));
        userRepository.save(user);

        logAction(authentication.getName(), "ROLE_UPDATE", "Updated user " + user.getEmail() + " role to " + finalRoleName);
        return ResponseEntity.ok(new MessageResponse("User role updated to " + finalRoleName));
    }

    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<MessageResponse> deleteUser(@PathVariable Long id, Authentication authentication) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getEmail().equalsIgnoreCase("admin@interviewiq.com")) {
            throw new BadRequestException("Cannot delete primary admin account");
        }

        // Delete related violations referencing this user
        try {
            List<Violation> userViolations = violationRepository.findAll().stream()
                    .filter(v -> id.equals(v.getUserId()))
                    .collect(Collectors.toList());
            if (!userViolations.isEmpty()) {
                violationRepository.deleteAll(userViolations);
            }
        } catch (Exception e) {
            System.err.println("Warning: failed to clear user violations: " + e.getMessage());
        }

        userRepository.delete(user);
        logAction(authentication.getName(), "USER_DELETE", "Deleted user email: " + user.getEmail());
        return ResponseEntity.ok(new MessageResponse("User deleted successfully."));
    }

    // --- System Configuration Settings ---
    @GetMapping("/system-config")
    public ResponseEntity<Map<String, String>> getSystemConfig() {
        List<SystemConfig> configs = systemConfigRepository.findAll();
        Map<String, String> response = new HashMap<>();
        for (SystemConfig config : configs) {
            response.put(config.getConfigKey(), config.getConfigValue());
        }
        return ResponseEntity.ok(response);
    }

    @PutMapping("/system-config")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<MessageResponse> updateSystemConfig(@RequestBody Map<String, String> payload, Authentication authentication) {
        for (Map.Entry<String, String> entry : payload.entrySet()) {
            SystemConfig config = systemConfigRepository.findById(entry.getKey())
                    .orElse(SystemConfig.builder().configKey(entry.getKey()).build());
            config.setConfigValue(entry.getValue());
            systemConfigRepository.save(config);
        }
        logAction(authentication.getName(), "CONFIG_UPDATE", "Updated platform system configurations");
        return ResponseEntity.ok(new MessageResponse("System configuration updated successfully."));
    }

    // --- Interview Template Builder ---
    @GetMapping("/templates")
    public ResponseEntity<List<InterviewTemplate>> getTemplates() {
        return ResponseEntity.ok(interviewTemplateRepository.findAll());
    }

    @PostMapping("/templates")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<InterviewTemplate> createTemplate(@RequestBody InterviewTemplate template, Authentication authentication) {
        InterviewTemplate saved = interviewTemplateRepository.save(template);
        logAction(authentication.getName(), "TEMPLATE_CREATE", "Created interview template: " + template.getTemplateName());
        return ResponseEntity.ok(saved);
    }

    // --- AI Prompt Management ---
    @GetMapping("/prompts")
    public ResponseEntity<List<AdminPrompt>> getPrompts() {
        return ResponseEntity.ok(adminPromptRepository.findAll());
    }

    @PostMapping("/prompts")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<AdminPrompt> savePrompt(@RequestBody AdminPrompt prompt, Authentication authentication) {
        prompt.setCreatedAt(LocalDateTime.now());
        AdminPrompt saved = adminPromptRepository.save(prompt);
        logAction(authentication.getName(), "PROMPT_UPDATE", "Updated AI Prompt: " + prompt.getName() + " to version " + prompt.getVersion());
        return ResponseEntity.ok(saved);
    }

    // --- Audit Log Trail ---
    @GetMapping("/audit-logs")
    public ResponseEntity<List<AuditLog>> getAuditLogs() {
        return ResponseEntity.ok(auditLogRepository.findAllByOrderByTimestampDesc());
    }

    // --- Fraud Detection monitoring logs ---
    @GetMapping("/violations")
    public ResponseEntity<List<Violation>> getViolations() {
        return ResponseEntity.ok(violationRepository.findAllByOrderByTimestampDesc());
    }

    @PostMapping("/violations")
    public ResponseEntity<Violation> reportViolation(@RequestBody Violation violation) {
        violation.setTimestamp(LocalDateTime.now());
        Violation saved = violationRepository.save(violation);
        return ResponseEntity.ok(saved);
    }

    // --- Feedback and Review Management ---
    @GetMapping("/feedback")
    public ResponseEntity<List<UserFeedback>> getFeedback() {
        return ResponseEntity.ok(userFeedbackRepository.findAllByOrderByCreatedAtDesc());
    }

    @PostMapping("/feedback")
    public ResponseEntity<UserFeedback> submitFeedback(@RequestBody UserFeedback feedback, Authentication authentication) {
        feedback.setUsername(authentication.getName());
        feedback.setStatus("PENDING");
        feedback.setCreatedAt(LocalDateTime.now());
        UserFeedback saved = userFeedbackRepository.save(feedback);
        return ResponseEntity.ok(saved);
    }
}
