package com.interviewiq.config;

import com.interviewiq.entity.Interview;
import com.interviewiq.repository.InterviewRepository;
import com.interviewiq.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class NotificationScheduler {

    private static final Logger logger = LoggerFactory.getLogger(NotificationScheduler.class);

    private final InterviewRepository interviewRepository;
    private final NotificationService notificationService;

    public NotificationScheduler(InterviewRepository interviewRepository,
                                 NotificationService notificationService) {
        this.interviewRepository = interviewRepository;
        this.notificationService = notificationService;
    }

    @Scheduled(cron = "0 * * * * *") // Runs every minute
    @Transactional
    public void sendUpcomingInterviewAlerts() {
        logger.debug("Checking for upcoming scheduled interviews...");
        List<Interview> scheduledInterviews = interviewRepository.findByStatus("SCHEDULED");

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime alertThreshold = now.plusMinutes(30);

        for (Interview interview : scheduledInterviews) {
            if (interview.getScheduledAt() != null && !interview.getNotified30m()) {
                // If the scheduled time is within the next 30 minutes (and hasn't already passed)
                if (interview.getScheduledAt().isBefore(alertThreshold) && interview.getScheduledAt().isAfter(now)) {
                    try {
                        notificationService.createNotification(
                                interview.getUser().getId(),
                                "Upcoming Interview Alert 📅",
                                "Your scheduled mock interview for " + interview.getJobRole() + " starts in 30 minutes!"
                        );
                        interview.setNotified30m(true);
                        interviewRepository.save(interview);
                        logger.info("Sent 30-minute alert for scheduled interview ID: {}", interview.getId());
                    } catch (Exception e) {
                        logger.error("Failed to send alert for interview ID: {}", interview.getId(), e);
                    }
                }
            }
        }
    }
}
