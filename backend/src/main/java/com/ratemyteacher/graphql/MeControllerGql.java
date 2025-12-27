package com.ratemyteacher.graphql;

import com.ratemyteacher.auth.AppPrincipal;
import com.ratemyteacher.entity.Review;
import com.ratemyteacher.graphql.model.MeGql;
import com.ratemyteacher.graphql.model.MyReviewsResponseGql;
import com.ratemyteacher.graphql.model.ReviewGql;
import com.ratemyteacher.repository.ReviewRepository;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
public class MeControllerGql {

    private final ReviewRepository reviewRepository;

    public MeControllerGql(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

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
        List<ReviewGql> items = reviews.stream().map(Mapper::toReview).toList();
        return new MyReviewsResponseGql(items, items.size());
    }
}
