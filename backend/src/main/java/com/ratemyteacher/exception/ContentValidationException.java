package com.ratemyteacher.exception;

/**
 * Exception thrown when content validation fails for review submissions.
 * Used for hard guardrails that reject submissions containing inappropriate content
 * such as full names, contact information, or URLs.
 */
public class ContentValidationException extends RuntimeException {

    private final String fieldName;

    public ContentValidationException(String message) {
        super(message);
        this.fieldName = null;
    }

    public ContentValidationException(String fieldName, String message) {
        super(message);
        this.fieldName = fieldName;
    }

    public String getFieldName() {
        return fieldName;
    }
}
