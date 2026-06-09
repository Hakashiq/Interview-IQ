package com.interviewiq.service.impl;

import com.interviewiq.service.AIClientService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class AIClientServiceImpl implements AIClientService {

    private static final Logger logger = LoggerFactory.getLogger(AIClientServiceImpl.class);

    private final RestTemplate restTemplate;
    private final String aiServiceUrl;

    public AIClientServiceImpl(RestTemplate restTemplate,
                               @Value("${app.ai-service.url}") String aiServiceUrl) {
        this.restTemplate = restTemplate;
        this.aiServiceUrl = aiServiceUrl;
    }

    @Override
    public Map<String, Object> parseResume(byte[] fileContent, String fileType) {
        String url = aiServiceUrl + "/ai/resume/parse";
        logger.debug("Calling AI service to parse resume at: {}", url);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            String base64Content = Base64.getEncoder().encodeToString(fileContent);
            Map<String, String> requestBody = new HashMap<>();
            requestBody.put("file_content", base64Content);
            requestBody.put("file_type", fileType);

            HttpEntity<Map<String, String>> requestEntity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    requestEntity,
                    new ParameterizedTypeReference<>() {}
            );

            logger.debug("AI resume parse response status: {}", response.getStatusCode());
            return response.getBody() != null ? response.getBody() : Collections.emptyMap();
        } catch (RestClientException e) {
            logger.error("Failed to call AI resume parse service: {}", e.getMessage());
            return Collections.emptyMap();
        }
    }

    @Override
    public Map<String, Object> scoreResume(String text, List<String> skills) {
        String url = aiServiceUrl + "/ai/resume/score";
        logger.debug("Calling AI service to score resume at: {}", url);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("text", text);
            requestBody.put("skills", skills);

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    requestEntity,
                    new ParameterizedTypeReference<>() {}
            );

            logger.debug("AI resume score response status: {}", response.getStatusCode());
            return response.getBody() != null ? response.getBody() : Collections.emptyMap();
        } catch (RestClientException e) {
            logger.error("Failed to call AI resume score service: {}", e.getMessage());
            return Collections.emptyMap();
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    public List<String> extractSkills(String text) {
        String url = aiServiceUrl + "/ai/resume/extract-skills";
        logger.debug("Calling AI service to extract skills at: {}", url);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, String> requestBody = new HashMap<>();
            requestBody.put("text", text);

            HttpEntity<Map<String, String>> requestEntity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    requestEntity,
                    new ParameterizedTypeReference<>() {}
            );

            Map<String, Object> body = response.getBody();
            if (body != null && body.containsKey("skills")) {
                Object skillsObj = body.get("skills");
                if (skillsObj instanceof List<?>) {
                    return (List<String>) skillsObj;
                }
            }
            return Collections.emptyList();
        } catch (RestClientException e) {
            logger.error("Failed to call AI skill extraction service: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    @Override
    public List<Map<String, Object>> generateQuestions(List<String> skills, String jobRole, String difficulty, int count) {
        String url = aiServiceUrl + "/ai/questions/generate";
        logger.debug("Calling AI service to generate questions at: {}", url);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("skills", skills);
            requestBody.put("job_role", jobRole);
            requestBody.put("difficulty", difficulty);
            requestBody.put("count", count);

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    requestEntity,
                    new ParameterizedTypeReference<List<Map<String, Object>>>() {}
            );

            logger.debug("AI generate questions response status: {}", response.getStatusCode());
            return response.getBody() != null ? response.getBody() : Collections.emptyList();
        } catch (RestClientException e) {
            logger.error("Failed to call AI question generation service: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    @Override
    public Map<String, Object> evaluateAnswer(String question, String idealAnswer, String studentAnswer, String category) {
        String url = aiServiceUrl + "/ai/answers/evaluate";
        logger.debug("Calling AI service to evaluate answer at: {}", url);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("question", question);
            requestBody.put("ideal_answer", idealAnswer);
            requestBody.put("student_answer", studentAnswer);
            requestBody.put("category", category);

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    requestEntity,
                    new ParameterizedTypeReference<>() {}
            );

            logger.debug("AI evaluate answer response status: {}", response.getStatusCode());
            return response.getBody() != null ? response.getBody() : Collections.emptyMap();
        } catch (RestClientException e) {
            logger.error("Failed to call AI answer evaluation service: {}", e.getMessage());
            return Collections.emptyMap();
        }
    }

    @Override
    public Map<String, Object> generateRecommendations(List<String> userSkills, List<Map<String, Object>> interviewScores, List<String> weakTopics) {
        String url = aiServiceUrl + "/ai/recommendations/generate";
        logger.debug("Calling AI service to generate recommendations at: {}", url);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("user_skills", userSkills);
            requestBody.put("interview_scores", interviewScores);
            requestBody.put("weak_topics", weakTopics);

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    requestEntity,
                    new ParameterizedTypeReference<>() {}
            );

            logger.debug("AI generate recommendations response status: {}", response.getStatusCode());
            return response.getBody() != null ? response.getBody() : Collections.emptyMap();
        } catch (RestClientException e) {
            logger.error("Failed to call AI recommendation generation service: {}", e.getMessage());
            return Collections.emptyMap();
        }
    }
}
