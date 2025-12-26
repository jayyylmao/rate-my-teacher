package com.ratemyteacher.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO containing partial/blurred company insights for non-contributors.
 * Provides enough information to entice users to contribute without giving away full insights.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyInsightsPreviewDTO {

    /**
     * Total number of approved reviews
     */
    private Integer totalReviews;

    /**
     * Blurred/teaser version of top tags
     * e.g., ["Common feedback includes: *****", "Interview style: *****"]
     */
    private List<String> topTagsBlurred;

    /**
     * Indicates this is a locked/preview version
     */
    @Builder.Default
    private boolean locked = true;

    /**
     * Company name for context
     */
    private String companyName;

    /**
     * Message prompting user to contribute
     */
    private String unlockMessage;

    /**
     * Number of tags available (to show "X insights available")
     */
    private Integer availableInsightsCount;
}
