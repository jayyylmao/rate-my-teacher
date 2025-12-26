package com.ratemyteacher.controller;

import com.ratemyteacher.dto.CreateInterviewRequest;
import com.ratemyteacher.dto.InterviewDetailResponse;
import com.ratemyteacher.dto.InterviewExperienceDTO;
import com.ratemyteacher.dto.ListResponse;
import com.ratemyteacher.service.InterviewExperienceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interviews")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "https://hello-world-five-peach.vercel.app"})
public class InterviewExperienceController {

    private final InterviewExperienceService interviewService;

    /**
     * GET /api/interviews - Get all interview experiences
     */
    @GetMapping
    public ResponseEntity<ListResponse<InterviewExperienceDTO>> getAllInterviews(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String company,
            @RequestParam(required = false) String role) {

        log.info("GET /api/interviews - q: {}, company: {}, role: {}", q, company, role);

        List<InterviewExperienceDTO> interviews;

        if (q != null && !q.trim().isEmpty()) {
            interviews = interviewService.searchByQuery(q.trim());
        } else if (company != null) {
            interviews = interviewService.searchByCompany(company);
        } else if (role != null) {
            interviews = interviewService.searchByRole(role);
        } else {
            interviews = interviewService.getAllInterviews();
        }

        log.info("Returning {} interview experiences", interviews.size());
        return ResponseEntity.ok(new ListResponse<>(interviews));
    }

    /**
     * GET /api/interviews/{id} - Get interview experience by ID with reviews
     */
    @GetMapping("/{id}")
    public ResponseEntity<InterviewDetailResponse> getInterviewById(@PathVariable Integer id) {
        log.info("GET /api/interviews/{}", id);

        InterviewExperienceDTO dto = interviewService.getInterviewById(id);

        // Wrap the response to match frontend expectations
        InterviewDetailResponse response = new InterviewDetailResponse();

        // Create a copy without reviews/breakdown for the nested interview object
        InterviewExperienceDTO interviewOnly = new InterviewExperienceDTO();
        interviewOnly.setId(dto.getId());
        interviewOnly.setCompany(dto.getCompany());
        interviewOnly.setRole(dto.getRole());
        interviewOnly.setLevel(dto.getLevel());
        interviewOnly.setStage(dto.getStage());
        interviewOnly.setLocation(dto.getLocation());
        interviewOnly.setCreatedAt(dto.getCreatedAt());
        interviewOnly.setAverageRating(dto.getAverageRating());
        interviewOnly.setReviewCount(dto.getReviewCount());
        interviewOnly.setLastReviewedAt(dto.getLastReviewedAt());

        response.setInterview(interviewOnly);
        response.setReviews(dto.getReviews());
        response.setRatingBreakdown(dto.getRatingBreakdown());

        log.info("Returning interview experience: {} - {}", dto.getCompany(), dto.getRole());
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/interviews - Create new interview experience
     */
    @PostMapping
    public ResponseEntity<InterviewExperienceDTO> createInterview(
            @Valid @RequestBody CreateInterviewRequest request) {

        log.info("POST /api/interviews - company: {}, role: {}", request.getCompany(), request.getRole());

        InterviewExperienceDTO created = interviewService.createInterview(request);

        log.info("Created interview experience with id: {}", created.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * DELETE /api/interviews/{id} - Delete interview experience
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInterview(@PathVariable Integer id) {
        log.info("DELETE /api/interviews/{}", id);

        interviewService.deleteInterview(id);

        log.info("Deleted interview experience with id: {}", id);
        return ResponseEntity.noContent().build();
    }
}
