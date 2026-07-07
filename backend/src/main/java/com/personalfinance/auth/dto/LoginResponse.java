package com.personalfinance.auth.dto;

public class LoginResponse {

    private final String username;
    private final String message;

    public LoginResponse(String username, String message) {
        this.username = username;
        this.message = message;
    }

    public String getUsername() { return username; }
    public String getMessage() { return message; }
}
