package com.ratemyteacher.controller;

import com.ratemyteacher.dto.CreateInterviewRequest;
import com.ratemyteacher.dto.InterviewExperienceDTO;
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
    public ResponseEntity<List<InterviewExperienceDTO>> getAllInterviews(
            @RequestParam(required = false) String company,
            @RequestParam(required = false) String role) {

        log.info("GET /api/interviews - company: {}, role: {}", company, role);

        List<InterviewExperienceDTO> interviews;

        if (company != null) {
            interviews = interviewService.searchByCompany(company);
        } else if (role != null) {
            interviews = interviewService.searchByRole(role);
        } else {
            interviews = interviewService.getAllInterviews();
        }

        log.info("Returning {} interview experiences", interviews.size());
        return ResponseEntity.ok(interviews);
    }

    /**
     * GET /api/interviews/{id} - Get interview experience by ID with reviews
     */
    @GetMapping("/{id}")
    public ResponseEntity<InterviewExperienceDTO> getInterviewById(@PathVariable Integer id) {
        log.info("GET /api/interviews/{}", id);

        InterviewExperienceDTO interview = interviewService.getInterviewById(id);

        log.info("Returning interview experience: {} - {}", interview.getCompany(), interview.getRole());
        return ResponseEntity.ok(interview);
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
