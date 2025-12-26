package com.ratemyteacher.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InterviewExperienceDTO {
    private Integer id;
    private String company;
    private String role;
    private String level;
    private String stage;
    private String location;
    private LocalDateTime createdAt;
    private Double averageRating;
    private Integer reviewCount;
    private LocalDateTime lastReviewedAt;
    private List<String> topTags; // optional
    private List<ReviewDTO> reviews; // detail endpoint only
    private Map<Integer, Long> ratingBreakdown; // detail endpoint only
}
