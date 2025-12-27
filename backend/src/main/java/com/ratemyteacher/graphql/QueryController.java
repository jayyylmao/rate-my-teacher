package com.ratemyteacher.graphql;

import com.ratemyteacher.auth.AppPrincipal;
import com.ratemyteacher.dto.InterviewExperienceDTO;
import com.ratemyteacher.repository.InterviewExperienceRepository;
import com.ratemyteacher.repository.ReviewRepository;
import com.ratemyteacher.graphql.model.*;
import com.ratemyteacher.service.InterviewExperienceService;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;
import org.springframework.security.core.Authentication;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Controller
public class QueryController {

    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    private final InterviewExperienceService interviewService;
    private final InterviewExperienceRepository interviewRepo;
    private final ReviewRepository reviewRepo;

    public QueryController(
            InterviewExperienceService interviewService,
            InterviewExperienceRepository interviewRepo,
            ReviewRepository reviewRepo
    ) {
        this.interviewService = interviewService;
        this.interviewRepo = interviewRepo;
        this.reviewRepo = reviewRepo;
    }

    @QueryMapping
    public InterviewDetailResponseGql interviewDetail(@Argument Integer id) {
        // Reuse the existing service logic:
        // - APPROVED reviews only
        // - rating breakdown (APPROVED only)
        // - weighted average rating
        InterviewExperienceDTO dto = interviewService.getInterviewById(id);

        InterviewExperienceGql interview = toInterviewSummary(dto);

        List<ReviewGql> reviews = dto.getReviews() == null ? List.of() :
                dto.getReviews().stream().map(Mapper::toReview).toList();

        List<RatingCountGql> breakdown = dto.getRatingBreakdown() == null ? List.of() :
                dto.getRatingBreakdown().entrySet().stream()
                        .map(e -> new RatingCountGql(e.getKey(), e.getValue()))
                        .sorted(Comparator.comparingInt(RatingCountGql::rating).reversed())
                        .toList();

        return new InterviewDetailResponseGql(interview, reviews, breakdown);
    }

    @QueryMapping
    public MeGql me(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        Object p = authentication.getPrincipal();
        if (!(p instanceof AppPrincipal principal)) {
            return null;
        }
        return new MeGql(
                principal.getUserId(),
                principal.getEmail(),
                new ArrayList<>(principal.getRoles())
        );
    }

    @QueryMapping
    public PlatformStatsGql stats() {
        int totalInterviews = Math.toIntExact(interviewRepo.count());
        int totalReviews = Math.toIntExact(reviewRepo.count());
        return new PlatformStatsGql(totalInterviews, totalReviews);
    }

    private static InterviewExperienceGql toInterviewSummary(InterviewExperienceDTO dto) {
        return new InterviewExperienceGql(
                dto.getId(),
                dto.getCompany(),
                dto.getRole(),
                dto.getLevel(),
                dto.getStage(),
                dto.getLocation(),
                dto.getCreatedAt() != null ? ISO.format(dto.getCreatedAt()) : null,
                dto.getAverageRating(),
                dto.getReviewCount() != null ? dto.getReviewCount() : 0,
                dto.getLastReviewedAt() != null ? ISO.format(dto.getLastReviewedAt()) : null
        );
    }
}
