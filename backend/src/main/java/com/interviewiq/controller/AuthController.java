package com.interviewiq.controller;

import com.interviewiq.dto.request.ChangePasswordRequest;
import com.interviewiq.dto.request.LoginRequest;
import com.interviewiq.dto.request.RefreshTokenRequest;
import com.interviewiq.dto.request.RegisterRequest;
import com.interviewiq.dto.response.AuthResponse;
import com.interviewiq.dto.response.MessageResponse;
import com.interviewiq.service.AuthService;
import com.interviewiq.exception.BadRequestException;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
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
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<MessageResponse> logout(@Valid @RequestBody RefreshTokenRequest request) {
        MessageResponse response = authService.logout(request.getRefreshToken());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/change-password")
    public ResponseEntity<MessageResponse> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {
        MessageResponse response = authService.changePassword(authentication.getName(), request);
        return ResponseEntity.ok(response);
    }

    private final String idCardDir = "./uploads/id_cards";

    @PostMapping(value = "/register/id-card", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadIdCard(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }

        String originalFilename = org.springframework.util.StringUtils.cleanPath(
                java.util.Objects.requireNonNullElse(file.getOriginalFilename(), "document.png")
        );
        int dotIndex = originalFilename.lastIndexOf('.');
        String extension = (dotIndex >= 0) ? originalFilename.substring(dotIndex + 1).toLowerCase() : "png";

        List<String> allowedExtensions = Arrays.asList("jpg", "jpeg", "png", "webp", "pdf");
        if (!allowedExtensions.contains(extension)) {
            throw new BadRequestException("Only PDF and image files (PDF, JPG, PNG, WEBP) are allowed");
        }

        try {
            Path uploadPath = Paths.get(idCardDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);

            String storedFileName = "id_card_" + UUID.randomUUID() + "." + extension;
            Path targetLocation = uploadPath.resolve(storedFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            String viewUrl = "/api/auth/register/id-card/view/" + storedFileName;
            
            Map<String, String> response = new HashMap<>();
            response.put("idCardPath", viewUrl);
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            throw new BadRequestException("Failed to upload ID document: " + e.getMessage());
        }
    }

    @GetMapping("/register/id-card/view/{filename:.+}")
    public ResponseEntity<Resource> getIdCard(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(idCardDir).resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                String contentType = "image/jpeg";
                String lower = filename.toLowerCase();
                if (lower.endsWith(".png")) {
                    contentType = "image/png";
                } else if (lower.endsWith(".webp")) {
                    contentType = "image/webp";
                } else if (lower.endsWith(".pdf")) {
                    contentType = "application/pdf";
                }
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
