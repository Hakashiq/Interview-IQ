package com.interviewiq.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {
    @NotBlank(message = "Full name is required")
    private String fullName;
    private String phone;
    private String education;
    private String address;
    private String githubUrl;
    private String linkedinUrl;
    private String leetcodeUrl;
}
