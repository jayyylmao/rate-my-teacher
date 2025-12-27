package com.ratemyteacher.graphql;

import com.ratemyteacher.auth.AppPrincipal;
import com.ratemyteacher.dto.CompanyInsightsDTO;
import com.ratemyteacher.dto.CompanyInsightsPreviewDTO;
import com.ratemyteacher.dto.InterviewExperienceDTO;
import com.ratemyteacher.dto.TrendDTO;
import com.ratemyteacher.entity.Review;
import com.ratemyteacher.entity.ReviewStatus;
import com.ratemyteacher.entity.Tag;
import com.ratemyteacher.repository.InterviewExperienceRepository;
import com.ratemyteacher.repository.ReviewRepository;
import com.ratemyteacher.repository.TagRepository;
import com.ratemyteacher.graphql.model.*;
import org.springframework.graphql.data.method.annotation.Argument;
import com.ratemyteacher.service.InsightsService;
import com.ratemyteacher.service.InterviewExperienceService;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.stereotype.Controller;
import org.springframework.security.core.Authentication;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Controller
public class QueryController {

    private final InterviewExperienceService interviewService;
    private final InterviewExperienceRepository interviewRepo;
    private final ReviewRepository reviewRepo;
    private final TagRepository tagRepo;
    private final InsightsService insightsService;

    public QueryController(
            InterviewExperienceService interviewService,
            InterviewExperienceRepository interviewRepo,
            ReviewRepository reviewRepo,
            TagRepository tagRepo,
            InsightsService insightsService
    ) {
        this.interviewService = interviewService;
        this.interviewRepo = interviewRepo;
        this.reviewRepo = reviewRepo;
        this.tagRepo = tagRepo;
        this.insightsService = insightsService;
    }

    // ─────────────────────────────────────────────────────────────
    // Interview queries
    // ─────────────────────────────────────────────────────────────

    /**
     * Get single interview by ID.
     * reviews and ratingBreakdown are resolved via field resolvers below.
     */
    @QueryMapping
    public InterviewGql interview(@Argument Integer id) {
        InterviewExperienceDTO dto = interviewService.getInterviewById(id);
        return Mapper.toInterview(dto);
    }

    /**
     * List interviews with optional filters.
     * Does not include nested reviews - use interview(id) for detail.
     */
    @QueryMapping
    public InterviewsResponseGql interviews(
            @Argument String q,
            @Argument String company,
            @Argument String role,
            @Argument String level,
            @Argument String stage,
            @Argument String location,
            @Argument String sort,
            @Argument Integer limit
    ) {
        List<InterviewExperienceDTO> results;

        if (q != null && !q.isBlank()) {
            results = interviewService.searchByQuery(q);
        } else if (company != null && !company.isBlank()) {
            results = interviewService.searchByCompany(company);
        } else if (role != null && !role.isBlank()) {
            results = interviewService.searchByRole(role);
        } else {
            results = interviewService.getAllInterviews();
        }

        // Apply additional filters
        if (level != null && !level.isBlank()) {
            results = results.stream()
                    .filter(i -> level.equalsIgnoreCase(i.getLevel()))
                    .collect(Collectors.toList());
        }
        if (stage != null && !stage.isBlank()) {
            results = results.stream()
                    .filter(i -> stage.equalsIgnoreCase(i.getStage()))
                    .collect(Collectors.toList());
        }
        if (location != null && !location.isBlank()) {
            results = results.stream()
                    .filter(i -> i.getLocation() != null &&
                            i.getLocation().toLowerCase().contains(location.toLowerCase()))
                    .collect(Collectors.toList());
        }

        // Apply sorting
        if (sort != null) {
            results = switch (sort) {
                case "rating" -> results.stream()
                        .sorted(Comparator.comparing(InterviewExperienceDTO::getAverageRating,
                                Comparator.nullsLast(Comparator.reverseOrder())))
                        .collect(Collectors.toList());
                case "reviews" -> results.stream()
                        .sorted(Comparator.comparing(InterviewExperienceDTO::getReviewCount,
                                Comparator.nullsLast(Comparator.reverseOrder())))
                        .collect(Collectors.toList());
                case "recent" -> results.stream()
                        .sorted(Comparator.comparing(InterviewExperienceDTO::getLastReviewedAt,
                                Comparator.nullsLast(Comparator.reverseOrder())))
                        .collect(Collectors.toList());
                default -> results;
            };
        }

        // Apply limit
        int effectiveLimit = limit != null && limit > 0 ? limit : 50;
        if (results.size() > effectiveLimit) {
            results = results.subList(0, effectiveLimit);
        }

        List<InterviewGql> items = results.stream()
                .map(Mapper::toInterview)
                .collect(Collectors.toList());

        return new InterviewsResponseGql(items, null);
    }

    // ─────────────────────────────────────────────────────────────
    // Company Insights
    // ─────────────────────────────────────────────────────────────

    /**
     * Get company insights for an interview.
     * Returns full insights if user has contributed, otherwise preview.
     */
    @QueryMapping
    public InsightsGql insights(@Argument Integer interviewId, Authentication authentication) {
        // Get user identifier for checking unlock status
        String userIdentifier = null;
        if (authentication != null && authentication.isAuthenticated()) {
            Object p = authentication.getPrincipal();
            if (p instanceof AppPrincipal principal) {
                userIdentifier = principal.getEmail();
            }
        }

        // Check if user has unlocked insights
        if (userIdentifier != null && insightsService.hasUnlockedInsights(userIdentifier, interviewId)) {
            // Return full insights
            CompanyInsightsDTO dto = insightsService.getInsights(userIdentifier, interviewId);
            return mapFullInsights(dto);
        }

        // Return preview
        CompanyInsightsPreviewDTO preview = insightsService.getInsightsPreview(interviewId);
        return mapPreviewInsights(preview);
    }

    private InsightsGql mapFullInsights(CompanyInsightsDTO dto) {
        // Convert tag distribution map to list
        List<TagDistributionGql> tagDist = null;
        if (dto.getTagDistribution() != null) {
            tagDist = dto.getTagDistribution().entrySet().stream()
                    .map(e -> new TagDistributionGql(e.getKey(), e.getValue()))
                    .sorted((a, b) -> Double.compare(b.percentage(), a.percentage()))
                    .collect(Collectors.toList());
        }

        // Convert outcome distribution map to list
        List<OutcomeDistributionGql> outcomeDist = null;
        if (dto.getOutcomeDistribution() != null) {
            outcomeDist = dto.getOutcomeDistribution().entrySet().stream()
                    .map(e -> new OutcomeDistributionGql(e.getKey(), e.getValue()))
                    .collect(Collectors.toList());
        }

        // Convert trend
        TrendGql trend = null;
        if (dto.getRecentTrend() != null) {
            TrendDTO t = dto.getRecentTrend();
            trend = new TrendGql(
                    t.getRecentAverageRating(),
                    t.getOlderAverageRating(),
                    t.getRatingChange(),
                    t.getDirection(),
                    t.getRecentReviewCount(),
                    t.getOlderReviewCount()
            );
        }

        return new InsightsGql(
                dto.getCompanyName(),
                dto.getTotalReviews(),
                false, // unlocked
                tagDist,
                dto.getAverageDifficulty(),
                dto.getFeedbackSpeed(),
                dto.getCommonFeedback(),
                outcomeDist,
                trend,
                null, // unlockMessage
                null, // availableInsightsCount
                null  // topTagsBlurred
        );
    }

    private InsightsGql mapPreviewInsights(CompanyInsightsPreviewDTO preview) {
        return new InsightsGql(
                preview.getCompanyName(),
                preview.getTotalReviews(),
                true, // locked
                null, // tagDistribution
                null, // averageDifficulty
                null, // feedbackSpeed
                null, // commonFeedback
                null, // outcomeDistribution
                null, // recentTrend
                preview.getUnlockMessage(),
                preview.getAvailableInsightsCount(),
                preview.getTopTagsBlurred()
        );
    }

    // ─────────────────────────────────────────────────────────────
    // Interview field resolvers (nested data)
    // ─────────────────────────────────────────────────────────────

    /**
     * Resolve reviews field on Interview type.
     * Only returns APPROVED reviews.
     * @deprecated Use reviewsConnection for pagination
     */
    @SchemaMapping(typeName = "Interview", field = "reviews")
    public List<ReviewGql> interviewReviews(InterviewGql interview) {
        List<Review> reviews = reviewRepo.findByInterviewIdAndStatus(
                interview.id(), ReviewStatus.APPROVED);
        return reviews.stream()
                .map(Mapper::toReview)
                .collect(Collectors.toList());
    }

    /**
     * Resolve reviewsConnection field on Interview type with cursor-based pagination.
     * Mobile-friendly: supports first/after and sorting.
     */
    @SchemaMapping(typeName = "Interview", field = "reviewsConnection")
    public ReviewConnectionGql interviewReviewsConnection(
            InterviewGql interview,
            @Argument Integer first,
            @Argument String after,
            @Argument ReviewSort sort) {

        // Fetch all approved reviews for this interview
        List<Review> allReviews = reviewRepo.findByInterviewIdAndStatus(
                interview.id(), ReviewStatus.APPROVED);

        // Apply sorting
        Comparator<Review> comparator = switch (sort != null ? sort : ReviewSort.RECENT) {
            case RECENT -> Comparator.comparing(Review::getCreatedAt).reversed();
            case HIGHEST -> Comparator.comparing(Review::getRating).reversed()
                    .thenComparing(Review::getCreatedAt, Comparator.reverseOrder());
            case LOWEST -> Comparator.comparing(Review::getRating)
                    .thenComparing(Review::getCreatedAt, Comparator.reverseOrder());
        };
        allReviews.sort(comparator);

        // Decode cursor to find starting position
        int startIndex = 0;
        if (after != null && !after.isEmpty()) {
            try {
                String decoded = new String(Base64.getDecoder().decode(after), StandardCharsets.UTF_8);
                String[] parts = decoded.split(":");
                if (parts.length == 2 && "review".equals(parts[0])) {
                    int afterId = Integer.parseInt(parts[1]);
                    // Find index of review with this ID
                    for (int i = 0; i < allReviews.size(); i++) {
                        if (allReviews.get(i).getId() == afterId) {
                            startIndex = i + 1; // Start after this review
                            break;
                        }
                    }
                }
            } catch (Exception e) {
                // Invalid cursor, start from beginning
                startIndex = 0;
            }
        }

        // Apply pagination
        int pageSize = first != null && first > 0 ? first : 10;
        int endIndex = Math.min(startIndex + pageSize, allReviews.size());
        List<Review> pageReviews = allReviews.subList(startIndex, endIndex);

        // Build edges with cursors
        List<ReviewEdgeGql> edges = pageReviews.stream()
                .map(review -> {
                    String cursor = Base64.getEncoder().encodeToString(
                            ("review:" + review.getId()).getBytes(StandardCharsets.UTF_8));
                    return new ReviewEdgeGql(Mapper.toReview(review), cursor);
                })
                .collect(Collectors.toList());

        // Build page info
        boolean hasNextPage = endIndex < allReviews.size();
        boolean hasPreviousPage = startIndex > 0;
        String startCursor = edges.isEmpty() ? null : edges.get(0).cursor();
        String endCursor = edges.isEmpty() ? null : edges.get(edges.size() - 1).cursor();

        PageInfoGql pageInfo = new PageInfoGql(
                hasNextPage,
                hasPreviousPage,
                startCursor,
                endCursor
        );

        return new ReviewConnectionGql(edges, pageInfo, allReviews.size());
    }

    /**
     * Resolve ratingBreakdown field on Interview type.
     * Only counts APPROVED reviews.
     */
    @SchemaMapping(typeName = "Interview", field = "ratingBreakdown")
    public List<RatingCountGql> interviewRatingBreakdown(InterviewGql interview) {
        List<Object[]> breakdown = reviewRepo.ratingBreakdown(interview.id());
        return breakdown.stream()
                .map(row -> new RatingCountGql(
                        (Integer) row[0],
                        ((Number) row[1]).intValue()))
                .sorted(Comparator.comparingInt(RatingCountGql::rating).reversed())
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────
    // User & Auth queries
    // ─────────────────────────────────────────────────────────────

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

    // ─────────────────────────────────────────────────────────────
    // Platform queries
    // ─────────────────────────────────────────────────────────────

    @QueryMapping
    public PlatformStatsGql stats() {
        int totalInterviews = Math.toIntExact(interviewRepo.count());
        int totalReviews = Math.toIntExact(reviewRepo.count());
        return new PlatformStatsGql(totalInterviews, totalReviews);
    }

    @QueryMapping
    public TagsResponseGql tags() {
        List<Tag> allTags = tagRepo.findAll();
        List<TagGql> items = allTags.stream()
                .map(t -> new TagGql(t.getKey(), t.getLabel(), t.getCategory()))
                .collect(Collectors.toList());
        return new TagsResponseGql(items);
    }
}
