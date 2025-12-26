package com.ratemyteacher.exception;

/**
 * Exception thrown when a user attempts to access insights they haven't unlocked.
 * Users must contribute an approved review to unlock insights for a company.
 */
public class InsightsAccessDeniedException extends RuntimeException {

    public InsightsAccessDeniedException(String message) {
        super(message);
    }

    public InsightsAccessDeniedException() {
        super("Submit a review to unlock insights");
    }
}
