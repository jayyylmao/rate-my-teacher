package com.ratemyteacher.exception;

public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String resourceName, Integer id) {
        super(String.format("%s not found with id: %d", resourceName, id));
    }
}
