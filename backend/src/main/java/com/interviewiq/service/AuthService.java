package com.interviewiq.service;

import com.interviewiq.dto.request.ChangePasswordRequest;
import com.interviewiq.dto.request.LoginRequest;
import com.interviewiq.dto.request.RegisterRequest;
import com.interviewiq.dto.response.AuthResponse;
import com.interviewiq.dto.response.MessageResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse refreshToken(String refreshToken);
    MessageResponse logout(String refreshToken);
    MessageResponse changePassword(String email, ChangePasswordRequest request);
}
