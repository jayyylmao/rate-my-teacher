package com.ratemyteacher.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewDTO {
    private Integer id;
    private Integer interviewId;
    private Integer rating;
    private String comment;
    private String reviewerName;
    private LocalDateTime createdAt;
    private List<String> tags;
    private String roundType;
    private String interviewerInitials;
    private String outcome;
    private String status;
    private LocalDateTime approvedAt;
}
