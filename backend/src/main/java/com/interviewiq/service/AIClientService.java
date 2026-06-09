package com.interviewiq.service;

import java.util.List;
import java.util.Map;

public interface AIClientService {

    /**
     * Parse a resume file and extract structured data.
     *
     * @param fileContent the resume file content as bytes
     * @param fileType    the file type (e.g., "pdf", "docx")
     * @return parsed resume data as a map
     */
    Map<String, Object> parseResume(byte[] fileContent, String fileType);

    /**
     * Score a resume based on its text content and extracted skills.
     *
     * @param text   the resume raw text
     * @param skills list of skill names
     * @return scoring results including resume score and ATS score
     */
    Map<String, Object> scoreResume(String text, List<String> skills);

    /**
     * Extract skills from resume text.
     *
     * @param text the resume raw text
     * @return list of extracted skill names
     */
    List<String> extractSkills(String text);

    /**
     * Generate interview questions based on skills, job role, and difficulty.
     */
    List<Map<String, Object>> generateQuestions(List<String> skills, String jobRole, String difficulty, int count);

    /**
     * Evaluate a student's answer against the ideal answer.
     */
    Map<String, Object> evaluateAnswer(String question, String idealAnswer, String studentAnswer, String category);

    /**
     * Generate learning recommendations based on interview performance.
     */
    Map<String, Object> generateRecommendations(List<String> userSkills, List<Map<String, Object>> interviewScores, List<String> weakTopics);
}
