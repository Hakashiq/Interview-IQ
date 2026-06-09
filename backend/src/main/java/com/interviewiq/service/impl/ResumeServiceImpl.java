package com.interviewiq.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.interviewiq.dto.response.ResumeDetailResponse;
import com.interviewiq.dto.response.ResumeUploadResponse;
import com.interviewiq.entity.Resume;
import com.interviewiq.entity.Skill;
import com.interviewiq.entity.User;
import com.interviewiq.exception.BadRequestException;
import com.interviewiq.exception.ResourceNotFoundException;
import com.interviewiq.repository.ResumeRepository;
import com.interviewiq.repository.SkillRepository;
import com.interviewiq.repository.UserRepository;
import com.interviewiq.service.AIClientService;
import com.interviewiq.service.ResumeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ResumeServiceImpl implements ResumeService {

    private static final Logger logger = LoggerFactory.getLogger(ResumeServiceImpl.class);
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("pdf", "docx", "doc");

    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final AIClientService aiClientService;
    private final ObjectMapper objectMapper;
    private final String resumeUploadDir;

    public ResumeServiceImpl(ResumeRepository resumeRepository,
                             UserRepository userRepository,
                             SkillRepository skillRepository,
                             AIClientService aiClientService,
                             ObjectMapper objectMapper,
                             @Value("${app.upload.resume-dir}") String resumeUploadDir) {
        this.resumeRepository = resumeRepository;
        this.userRepository = userRepository;
        this.skillRepository = skillRepository;
        this.aiClientService = aiClientService;
        this.objectMapper = objectMapper;
        this.resumeUploadDir = resumeUploadDir;
    }

    @Override
    @Transactional
    public ResumeUploadResponse uploadResume(MultipartFile file, Long userId) {
        // Validate file
        if (file.isEmpty()) {
            throw new BadRequestException("Resume file is empty");
        }

        String originalFilename = StringUtils.cleanPath(
                Objects.requireNonNull(file.getOriginalFilename(), "Filename is required"));
        String extension = getFileExtension(originalFilename).toLowerCase();

        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new BadRequestException("Only PDF, DOC, and DOCX files are allowed");
        }

        // Find user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Save file to disk
        String storedFileName = UUID.randomUUID() + "." + extension;
        Path uploadPath = Paths.get(resumeUploadDir).toAbsolutePath().normalize();
        Path targetLocation = uploadPath.resolve(storedFileName);

        try {
            Files.createDirectories(uploadPath);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            logger.info("Resume file saved to: {}", targetLocation);
        } catch (IOException e) {
            throw new BadRequestException("Failed to store resume file: " + e.getMessage());
        }

        // Build initial Resume entity
        Resume resume = Resume.builder()
                .user(user)
                .filePath(targetLocation.toString())
                .fileName(originalFilename)
                .build();

        // Call AI service to parse resume
        try {
            byte[] fileContent = file.getBytes();
            Map<String, Object> parseResult = aiClientService.parseResume(fileContent, extension);

            // Extract raw text
            String rawText = parseResult.getOrDefault("raw_text", "").toString();
            resume.setRawText(rawText);

            // Store extracted data as JSON
            if (parseResult.containsKey("extracted_data")) {
                resume.setExtractedData(objectMapper.writeValueAsString(parseResult.get("extracted_data")));
            }

            // Extract skills from parsed data
            List<String> skillNames = new ArrayList<>();
            if (parseResult.containsKey("extracted_data")) {
                Map<String, Object> extData = (Map<String, Object>) parseResult.get("extracted_data");
                if (extData != null && extData.containsKey("skills")) {
                    Object skillsObj = extData.get("skills");
                    if (skillsObj instanceof List<?>) {
                        skillNames = (List<String>) skillsObj;
                    }
                }
            }

            // If we didn't get any skills, fall back to extractSkills endpoint
            if (skillNames.isEmpty() && !rawText.isEmpty()) {
                skillNames = aiClientService.extractSkills(rawText);
            }

            // Save/find skills and associate with resume
            Set<Skill> skills = new HashSet<>();
            for (String skillName : skillNames) {
                String trimmedName = skillName.trim();
                if (trimmedName.isEmpty()) continue;
                Skill skill = skillRepository.findByNameIgnoreCase(trimmedName)
                        .orElseGet(() -> skillRepository.save(
                                Skill.builder().name(trimmedName).build()));
                skills.add(skill);
            }
            resume.setSkills(skills);

            // Score resume
            if (!rawText.isEmpty()) {
                Map<String, Object> scoreResult = aiClientService.scoreResume(rawText, skillNames);
                if (scoreResult.containsKey("resume_score")) {
                    resume.setResumeScore(((Number) scoreResult.get("resume_score")).intValue());
                }
                if (scoreResult.containsKey("ats_score")) {
                    resume.setAtsScore(((Number) scoreResult.get("ats_score")).intValue());
                }
                if (scoreResult.containsKey("recruiter_score")) {
                    resume.setRecruiterScore(((Number) scoreResult.get("recruiter_score")).intValue());
                }
                if (scoreResult.containsKey("technical_depth_score")) {
                    resume.setTechnicalDepthScore(((Number) scoreResult.get("technical_depth_score")).intValue());
                }
                if (scoreResult.containsKey("interview_readiness_score")) {
                    resume.setInterviewReadinessScore(((Number) scoreResult.get("interview_readiness_score")).intValue());
                }
                if (scoreResult.containsKey("final_resume_content")) {
                    resume.setFinalResumeContent((String) scoreResult.get("final_resume_content"));
                }
                if (scoreResult.containsKey("improvements")) {
                    resume.setImprovementSuggestions(
                            objectMapper.writeValueAsString(scoreResult.get("improvements")));
                }
            }

            // Save resume
            resume = resumeRepository.save(resume);
            logger.info("Resume processed and saved with id: {} for user: {}", resume.getId(), userId);

            return ResumeUploadResponse.builder()
                    .id(resume.getId())
                    .fileName(originalFilename)
                    .resumeScore(resume.getResumeScore())
                    .atsScore(resume.getAtsScore())
                    .recruiterScore(resume.getRecruiterScore())
                    .technicalDepthScore(resume.getTechnicalDepthScore())
                    .interviewReadinessScore(resume.getInterviewReadinessScore())
                    .finalResumeContent(resume.getFinalResumeContent())
                    .skills(skillNames)
                    .extractedSkills(skillNames)
                    .suggestions(mapToSuggestionDtoList(resume.getImprovementSuggestions()))
                    .message("Resume uploaded and analyzed successfully")
                    .uploadedAt(resume.getUploadedAt())
                    .build();

        } catch (JsonProcessingException e) {
            logger.error("Failed to serialize AI response data", e);
            // Save resume without AI data
            resume = resumeRepository.save(resume);
            return ResumeUploadResponse.builder()
                    .id(resume.getId())
                    .fileName(originalFilename)
                    .extractedSkills(Collections.emptyList())
                    .message("Resume uploaded but AI analysis partially failed")
                    .uploadedAt(resume.getUploadedAt())
                    .build();
        } catch (IOException e) {
            throw new BadRequestException("Failed to read resume file: " + e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ResumeDetailResponse getLatestResume(Long userId) {
        List<Resume> resumes = resumeRepository.findByUserIdOrderByUploadedAtDesc(userId);
        if (resumes.isEmpty()) {
            throw new ResourceNotFoundException("No resume found for user");
        }
        return mapToDetailResponse(resumes.get(0));
    }

    @Override
    @Transactional(readOnly = true)
    public ResumeDetailResponse getResumeById(Long resumeId, Long userId) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found with id: " + resumeId));

        if (!resume.getUser().getId().equals(userId)) {
            throw new BadRequestException("You do not have access to this resume");
        }

        return mapToDetailResponse(resume);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ResumeDetailResponse.SkillInfo> getResumeSkills(Long resumeId, Long userId) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found with id: " + resumeId));

        if (!resume.getUser().getId().equals(userId)) {
            throw new BadRequestException("You do not have access to this resume");
        }

        return resume.getSkills().stream()
                .map(skill -> ResumeDetailResponse.SkillInfo.builder()
                        .id(skill.getId())
                        .name(skill.getName())
                        .category(skill.getCategory())
                        .build())
                .collect(Collectors.toList());
    }

    private ResumeDetailResponse mapToDetailResponse(Resume resume) {
        List<ResumeDetailResponse.SkillInfo> skillInfos = resume.getSkills().stream()
                .map(skill -> ResumeDetailResponse.SkillInfo.builder()
                        .id(skill.getId())
                        .name(skill.getName())
                        .category(skill.getCategory())
                        .build())
                .collect(Collectors.toList());

        return ResumeDetailResponse.builder()
                .id(resume.getId())
                .fileName(resume.getFileName())
                .rawText(resume.getRawText())
                .resumeScore(resume.getResumeScore())
                .atsScore(resume.getAtsScore())
                .recruiterScore(resume.getRecruiterScore())
                .technicalDepthScore(resume.getTechnicalDepthScore())
                .interviewReadinessScore(resume.getInterviewReadinessScore())
                .finalResumeContent(resume.getFinalResumeContent())
                .extractedData(resume.getExtractedData())
                .improvementSuggestions(resume.getImprovementSuggestions())
                .skills(skillInfos)
                .suggestions(mapToDetailSuggestionDtoList(resume.getImprovementSuggestions()))
                .uploadedAt(resume.getUploadedAt())
                .build();
    }

    private List<ResumeUploadResponse.SuggestionDto> mapToSuggestionDtoList(String suggestionsJson) {
        if (suggestionsJson == null || suggestionsJson.isEmpty()) {
            return Collections.emptyList();
        }
        try {
            return objectMapper.readValue(suggestionsJson, new com.fasterxml.jackson.core.type.TypeReference<List<ResumeUploadResponse.SuggestionDto>>() {});
        } catch (Exception e) {
            logger.error("Failed to parse suggestions JSON", e);
            return Collections.emptyList();
        }
    }

    private List<ResumeDetailResponse.SuggestionDto> mapToDetailSuggestionDtoList(String suggestionsJson) {
        if (suggestionsJson == null || suggestionsJson.isEmpty()) {
            return Collections.emptyList();
        }
        try {
            return objectMapper.readValue(suggestionsJson, new com.fasterxml.jackson.core.type.TypeReference<List<ResumeDetailResponse.SuggestionDto>>() {});
        } catch (Exception e) {
            logger.error("Failed to parse suggestions JSON for detail response", e);
            return Collections.emptyList();
        }
    }

    private String getFileExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex < 0) {
            throw new BadRequestException("File has no extension");
        }
        return filename.substring(dotIndex + 1);
    }
}
