package com.ratemyteacher.controller;

import com.ratemyteacher.dto.CompanyInsightsDTO;
import com.ratemyteacher.dto.CompanyInsightsPreviewDTO;
import com.ratemyteacher.service.InsightsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// ─────────────────────────────────────────────────────────────
// KILL TEST: REST endpoints disabled - use GraphQL instead
// Query: insights(interviewId: ID!) { ... }
// ─────────────────────────────────────────────────────────────
// @RestController
// @RequestMapping("/api/insights")
// @RequiredArgsConstructor
// @Slf4j
// @CrossOrigin(origins = {"http://localhost:3000", "https://hello-world-five-peach.vercel.app"})
// public class InsightsController {
//
//     private final InsightsService insightsService;
//
//     -- REMOVED: Use GraphQL query instead --
//     GET /api/insights/{interviewId}
//     GET /api/insights/{interviewId}/status
// }

/**
 * @deprecated Use GraphQL query: insights(interviewId: ID!)
 */
@Deprecated
public class InsightsController {
    // REST endpoints disabled - use GraphQL instead
}
