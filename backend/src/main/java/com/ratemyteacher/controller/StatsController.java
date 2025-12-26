package com.ratemyteacher.controller;

import com.ratemyteacher.dto.StatsDTO;
import com.ratemyteacher.repository.InterviewExperienceRepository;
import com.ratemyteacher.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "https://hello-world-five-peach.vercel.app"})
public class StatsController {

    private final InterviewExperienceRepository interviewRepo;
    private final ReviewRepository reviewRepo;

    /**
     * GET /api/stats - Get platform statistics
     */
    @GetMapping
    public ResponseEntity<StatsDTO> getStats() {
        log.info("GET /api/stats");

        Long totalInterviews = interviewRepo.count();
        Long totalReviews = reviewRepo.count();

        StatsDTO stats = new StatsDTO(totalInterviews, totalReviews);

        log.info("Returning stats: {} interviews, {} reviews", totalInterviews, totalReviews);
        return ResponseEntity.ok(stats);
    }
}
