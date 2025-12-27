package com.ratemyteacher.graphql;

import com.ratemyteacher.auth.AppPrincipal;
import com.ratemyteacher.dto.ReviewDTO;
import com.ratemyteacher.service.ReviewVoteService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Controller
@RequiredArgsConstructor
public class ReviewFieldResolver {

    private final ReviewVoteService voteService;

    /**
     * Field resolver for Review.viewerHasVoted
     * Checks if current user has voted on this review
     */
    @SchemaMapping(typeName = "Review", field = "viewerHasVoted")
    public boolean viewerHasVoted(ReviewDTO review, Authentication authentication) {
        String userIdentifier = extractUserIdentifier(authentication);
        if (userIdentifier == null) {
            return false;
        }
        return voteService.hasVoted(review.getId(), userIdentifier);
    }

    /**
     * Helper: Extract user identifier for voting/contributions.
     * For authenticated users: returns email
     * For guests: returns X-User-Identifier header value (UUID from frontend)
     */
    private String extractUserIdentifier(Authentication authentication) {
        // Try authenticated user first
        if (authentication != null && authentication.isAuthenticated()) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof AppPrincipal appPrincipal) {
                return appPrincipal.getEmail();
            }
        }

        // Fall back to guest identifier from header
        ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attrs != null) {
            HttpServletRequest request = attrs.getRequest();
            String guestIdentifier = request.getHeader("X-User-Identifier");
            if (guestIdentifier != null && !guestIdentifier.isBlank()) {
                return guestIdentifier;
            }
        }

        return null;
    }
}
