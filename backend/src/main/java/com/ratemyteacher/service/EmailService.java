package com.ratemyteacher.service;

import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class EmailService {

    private final Resend resendClient;
    private final String fromEmail;

    public EmailService(
            @Value("${resend.api-key}") String apiKey,
            @Value("${resend.from-email}") String fromEmail
    ) {
        this.fromEmail = fromEmail;
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("Resend API key not configured. Email sending will be disabled.");
            this.resendClient = null;
        } else {
            this.resendClient = new Resend(apiKey);
        }
    }

    /**
     * Send OTP verification email
     *
     * @param toEmail Recipient email address
     * @param otpCode 6-digit OTP code
     * @return true if sent successfully, false otherwise
     */
    public boolean sendOtpEmail(String toEmail, String otpCode) {
        if (resendClient == null) {
            log.error("Cannot send email: Resend client not initialized (API key missing)");
            return false;
        }

        try {
            String subject = "Your verification code";
            String textBody = buildOtpEmailBody(otpCode);

            CreateEmailOptions params = CreateEmailOptions.builder()
                    .from(fromEmail)
                    .to(toEmail)
                    .subject(subject)
                    .text(textBody)
                    .build();

            CreateEmailResponse response = resendClient.emails().send(params);
            log.info("OTP email sent successfully to {} (ID: {})", toEmail, response.getId());
            return true;

        } catch (ResendException e) {
            log.error("Failed to send OTP email to {}: {}", toEmail, e.getMessage(), e);
            return false;
        }
    }

    private String buildOtpEmailBody(String otpCode) {
        return String.format("""
                Your verification code is: %s

                This code will expire in 10 minutes.

                If you didn't request this code, please ignore this email.

                For security reasons, never share this code with anyone.
                """, otpCode);
    }
}
