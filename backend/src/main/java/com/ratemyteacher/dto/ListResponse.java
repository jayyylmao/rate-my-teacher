package com.ratemyteacher.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Generic wrapper for list responses to match frontend API expectations
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ListResponse<T> {
    private List<T> items;
}
