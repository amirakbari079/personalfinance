package com.personalfinance.auth.service;

import com.personalfinance.auth.dto.LoginRequest;
import com.personalfinance.auth.dto.LoginResponse;
import com.personalfinance.auth.security.JwtUtil;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public AuthService(AuthenticationManager authenticationManager, JwtUtil jwtUtil) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
    }

    public LoginResponse login(LoginRequest request, HttpServletResponse response) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()));

        String username = authentication.getName();
        String token = jwtUtil.generateToken(username);

        ResponseCookie cookie = ResponseCookie.from(jwtUtil.getCookieName(), token)
                .httpOnly(true)
                .path("/")
                .maxAge(jwtUtil.getExpirationMs() / 1000)
                .sameSite("Strict")
                // .secure(true)  // enable in production with HTTPS
                .build();
        response.addHeader("Set-Cookie", cookie.toString());

        return new LoginResponse(username, "ورود موفق");
    }

    public void logout(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from(jwtUtil.getCookieName(), "")
                .httpOnly(true)
                .path("/")
                .maxAge(0)
                .sameSite("Strict")
                .build();
        response.addHeader("Set-Cookie", cookie.toString());
    }
}
