package com.astayc.hontodare.Exception;

import org.springframework.http.HttpStatus;

public class HontoDareException extends RuntimeException {
    private final HttpStatus status;

    public HontoDareException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}