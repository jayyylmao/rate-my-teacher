package com.ratemyteacher.controller;

import com.ratemyteacher.dto.CompanyInsightsDTO;
import com.ratemyteacher.dto.CompanyInsightsPreviewDTO;
import com.ratemyteacher.service.InsightsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for company insights.
 * Returns full insights for contributors, preview for others.
 */
@RestController
@RequestMapping("/api/insights")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "https://hello-world-five-peach.vercel.app"})
public class InsightsController {

    private final InsightsService insightsService;

    /**
     * GET /api/insights/{interviewId}
     *
     * Returns full insights if user has contributed (identified by X-User-Identifier header),
     * otherwise returns a preview with blurred data.
     *
     * @param interviewId The interview experience ID
     * @param userIdentifier Optional user identifier from header
     * @return Full insights or preview depending on contribution status
     */
    @GetMapping("/{interviewId}")
    public ResponseEntity<?> getInsights(
            @PathVariable Integer interviewId,
            @RequestHeader(value = "X-User-Identifier", required = false) String userIdentifier) {

        log.info("GET /api/insights/{} - userIdentifier: {}",
                interviewId, userIdentifier != null ? "[present]" : "[none]");

        // Check if user has unlocked insights
        if (userIdentifier != null && insightsService.hasUnlockedInsights(userIdentifier, interviewId)) {
            log.info("User has unlocked insights for interview {}", interviewId);
            CompanyInsightsDTO insights = insightsService.getInsights(userIdentifier, interviewId);
            return ResponseEntity.ok(insights);
        }

        // Return preview for non-contributors
        log.info("Returning preview insights for interview {}", interviewId);
        CompanyInsightsPreviewDTO preview = insightsService.getInsightsPreview(interviewId);
        return ResponseEntity.ok(preview);
    }

    /**
     * GET /api/insights/{interviewId}/status
     *
     * Check if user has unlocked insights for a specific interview.
     *
     * @param interviewId The interview experience ID
     * @param userIdentifier User identifier from header
     * @return JSON with unlocked status
     */
    @GetMapping("/{interviewId}/status")
    public ResponseEntity<?> checkUnlockStatus(
            @PathVariable Integer interviewId,
            @RequestHeader(value = "X-User-Identifier", required = false) String userIdentifier) {

        log.info("GET /api/insights/{}/status - checking unlock status", interviewId);

        boolean unlocked = userIdentifier != null &&
                insightsService.hasUnlockedInsights(userIdentifier, interviewId);

        return ResponseEntity.ok(java.util.Map.of(
                "interviewId", interviewId,
                "unlocked", unlocked
        ));
    }
}
