package com.ratemyteacher.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * Response wrapper for interview detail endpoint
 * Matches frontend InterviewDetailDTO structure
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InterviewDetailResponse {
    private InterviewExperienceDTO interview;
    private List<ReviewDTO> reviews;
    private Map<Integer, Long> ratingBreakdown;
}
