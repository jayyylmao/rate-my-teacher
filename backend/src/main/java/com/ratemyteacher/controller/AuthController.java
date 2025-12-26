package com.ratemyteacher.controller;

import com.ratemyteacher.auth.AuthService;
import com.ratemyteacher.auth.SessionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

/**
 * Authentication endpoints for email-based passwordless login.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;
    private final SessionService sessionService;

    @Value("${app.cookie.secure:true}")
    private boolean secureCookie;

    /**
     * POST /api/auth/start
     * Start authentication by sending OTP to email.
     * Always returns 200 to prevent email enumeration.
     */
    @PostMapping("/start")
    public ResponseEntity<Map<String, String>> startAuth(@Valid @RequestBody StartAuthRequest request) {
        log.info("POST /api/auth/start for email: {}", maskEmail(request.getEmail()));

        authService.startAuth(request.getEmail());

        // Always return success to prevent email enumeration
        return ResponseEntity.ok(Map.of(
                "message", "If this email is valid, you will receive a verification code shortly."
        ));
    }

    /**
     * POST /api/auth/verify
     * Verify OTP and create session.
     * Returns user info and sets session cookie.
     */
    @PostMapping("/verify")
    public ResponseEntity<?> verifyAuth(
            @Valid @RequestBody VerifyAuthRequest request,
            HttpServletResponse response) {

        log.info("POST /api/auth/verify for email: {}", maskEmail(request.getEmail()));

        Optional<String> sidOpt = authService.verifyOtp(request.getEmail(), request.getCode());

        if (sidOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of(
                    "error", "Invalid or expired code"
            ));
        }

        String sid = sidOpt.get();

        // Set session cookie
        setSidCookie(response, sid);

        return ResponseEntity.ok(Map.of(
                "message", "Login successful"
        ));
    }

    /**
     * POST /api/auth/logout
     * Delete session and clear cookie.
     */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(
            HttpServletRequest request,
            HttpServletResponse response) {

        log.info("POST /api/auth/logout");

        String sid = readCookie(request, "sid");
        if (sid != null) {
            sessionService.deleteSession(sid);
        }

        // Clear cookie
        clearSidCookie(response);

        return ResponseEntity.ok(Map.of(
                "message", "Logged out successfully"
        ));
    }

    /**
     * Set the session cookie on the response.
     */
    private void setSidCookie(HttpServletResponse response, String sid) {
        StringBuilder cookie = new StringBuilder();
        cookie.append("sid=").append(sid);
        cookie.append("; Path=/");
        cookie.append("; HttpOnly");
        cookie.append("; SameSite=Lax");
        cookie.append("; Max-Age=").append(30 * 24 * 60 * 60); // 30 days

        if (secureCookie) {
            cookie.append("; Secure");
        }

        response.addHeader("Set-Cookie", cookie.toString());
    }

    /**
     * Clear the session cookie.
     */
    private void clearSidCookie(HttpServletResponse response) {
        StringBuilder cookie = new StringBuilder();
        cookie.append("sid=");
        cookie.append("; Path=/");
        cookie.append("; HttpOnly");
        cookie.append("; SameSite=Lax");
        cookie.append("; Max-Age=0"); // Expire immediately

        if (secureCookie) {
            cookie.append("; Secure");
        }

        response.addHeader("Set-Cookie", cookie.toString());
    }

    /**
     * Read a cookie value from the request.
     */
    private String readCookie(HttpServletRequest request, String name) {
        if (request.getCookies() == null) return null;
        for (var cookie : request.getCookies()) {
            if (name.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }

    /**
     * Mask email for logging (privacy).
     */
    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) return "***";
        String[] parts = email.split("@");
        String local = parts[0];
        String masked = local.length() > 2
                ? local.substring(0, 2) + "***"
                : "***";
        return masked + "@" + parts[1];
    }

    // Request DTOs

    @Data
    public static class StartAuthRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;
    }

    @Data
    public static class VerifyAuthRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Code is required")
        @Pattern(regexp = "\\d{6}", message = "Code must be 6 digits")
        private String code;
    }
}
