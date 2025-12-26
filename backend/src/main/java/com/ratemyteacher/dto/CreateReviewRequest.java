package com.ratemyteacher.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateReviewRequest {

    @NotNull(message = "Interview ID is required")
    private Integer interviewId;

    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must not exceed 5")
    private Integer rating;

    @NotBlank(message = "Comment is required")
    @Size(min = 10, max = 2000, message = "Comment must be between 10 and 2000 characters")
    private String comment;

    @NotBlank(message = "Reviewer name is required")
    @Size(min = 2, max = 255, message = "Reviewer name must be between 2 and 255 characters")
    private String reviewerName;

    @Size(max = 5, message = "You may select up to 5 tags")
    private List<String> tagKeys;

    private String roundType;

    @Size(min = 2, max = 5, message = "Interviewer initials must be 2-4 letters")
    @Pattern(regexp = "^[A-Za-z.\\s]*$", message = "Interviewer initials must contain only letters, dots, and spaces")
    private String interviewerInitials;

    @Pattern(regexp = "^(OFFER|REJECTED|WITHDREW)?$", message = "Outcome must be OFFER, REJECTED, or WITHDREW")
    private String outcome;
}
