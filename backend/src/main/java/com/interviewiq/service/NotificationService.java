package com.interviewiq.service;

import com.interviewiq.dto.response.NotificationResponse;
import java.util.List;

public interface NotificationService {
    List<NotificationResponse> getNotifications(Long userId);
    void markAsRead(Long notificationId, Long userId);
    void markAllAsRead(Long userId);
    long getUnreadCount(Long userId);
    void createNotification(Long userId, String title, String message);
}
