package com.interviewiq.service;

import com.interviewiq.dto.request.StartInterviewRequest;
import com.interviewiq.dto.request.SubmitAnswerRequest;
import com.interviewiq.dto.response.*;
import java.util.List;

public interface InterviewService {
    InterviewResponse startInterview(StartInterviewRequest request, Long userId);
    InterviewResponse scheduleInterview(StartInterviewRequest request, java.time.LocalDateTime scheduledAt, Long userId);
    InterviewResponse getInterview(Long interviewId, Long userId);
    InterviewQuestionResponse getNextQuestion(Long interviewId, Long userId);
    SubmitAnswerResponse submitAnswer(Long interviewId, SubmitAnswerRequest request, Long userId);
    MessageResponse completeInterview(Long interviewId, Long userId);
    InterviewResultsResponse getResults(Long interviewId, Long userId);
    List<InterviewResponse> getHistory(Long userId);
}
