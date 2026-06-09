package com.interviewiq.service;

import com.interviewiq.dto.response.ResumeDetailResponse;
import com.interviewiq.dto.response.ResumeUploadResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ResumeService {

    /**
     * Upload and process a resume for the given user.
     *
     * @param file   the uploaded resume file
     * @param userId the ID of the authenticated user
     * @return upload response with scores and extracted skills
     */
    ResumeUploadResponse uploadResume(MultipartFile file, Long userId);

    /**
     * Get the latest resume for a user.
     *
     * @param userId the ID of the user
     * @return detailed resume response
     */
    ResumeDetailResponse getLatestResume(Long userId);

    /**
     * Get a specific resume by ID.
     *
     * @param resumeId the resume ID
     * @param userId   the ID of the authenticated user (for authorization)
     * @return detailed resume response
     */
    ResumeDetailResponse getResumeById(Long resumeId, Long userId);

    /**
     * Get extracted skills for a specific resume.
     *
     * @param resumeId the resume ID
     * @param userId   the ID of the authenticated user (for authorization)
     * @return list of skill info
     */
    List<ResumeDetailResponse.SkillInfo> getResumeSkills(Long resumeId, Long userId);
}
