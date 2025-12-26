package com.ratemyteacher.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StatsDTO {
    private Long totalInterviews;
    private Long totalReviews;
}
