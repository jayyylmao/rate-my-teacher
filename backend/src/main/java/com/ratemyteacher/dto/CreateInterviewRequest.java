package com.ratemyteacher.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateInterviewRequest {

    @NotBlank(message = "Company is required")
    @Size(max = 200, message = "Company name must not exceed 200 characters")
    private String company;

    @NotBlank(message = "Role is required")
    @Size(max = 200, message = "Role must not exceed 200 characters")
    private String role;

    @Size(max = 100, message = "Level must not exceed 100 characters")
    private String level;

    @Size(max = 100, message = "Stage must not exceed 100 characters")
    private String stage;

    @Size(max = 100, message = "Location must not exceed 100 characters")
    private String location;
}
