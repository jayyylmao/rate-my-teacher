package com.ratemyteacher.graphql;

import com.ratemyteacher.auth.AppPrincipal;
import com.ratemyteacher.dto.InterviewExperienceDTO;
import com.ratemyteacher.entity.Review;
import com.ratemyteacher.graphql.model.InterviewGql;
import com.ratemyteacher.graphql.model.MeGql;
import com.ratemyteacher.graphql.model.MyReviewGql;
import com.ratemyteacher.graphql.model.MyReviewsResponseGql;
import com.ratemyteacher.repository.ReviewRepository;
import com.ratemyteacher.service.InterviewExperienceService;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
public class MeControllerGql {

    private final ReviewRepository reviewRepository;
    private final InterviewExperienceService interviewService;

    public MeControllerGql(ReviewRepository reviewRepository, InterviewExperienceService interviewService) {
        this.reviewRepository = reviewRepository;
        this.interviewService = interviewService;
    }

    /**
     * Resolve myReviews field on Me type.
     * Returns all reviews by the authenticated user (all statuses).
     */
    @SchemaMapping(typeName = "Me", field = "myReviews")
    public MyReviewsResponseGql myReviews(MeGql me, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("UNAUTHENTICATED");
        }
        Object p = authentication.getPrincipal();
        if (!(p instanceof AppPrincipal principal)) {
            throw new RuntimeException("UNAUTHENTICATED");
        }

        List<Review> reviews = reviewRepository.findByAuthorUserId(principal.getUserId());
        List<MyReviewGql> items = reviews.stream().map(Mapper::toMyReview).toList();
        return new MyReviewsResponseGql(items, items.size());
    }

    /**
     * Resolve interview field on MyReview type.
     * Returns the interview that this review belongs to.
     */
    @SchemaMapping(typeName = "MyReview", field = "interview")
    public InterviewGql myReviewInterview(MyReviewGql myReview) {
        InterviewExperienceDTO dto = interviewService.getInterviewById(myReview.interviewId());
        return Mapper.toInterview(dto);
    }
}
