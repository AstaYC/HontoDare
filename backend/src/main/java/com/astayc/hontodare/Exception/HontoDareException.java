package com.astayc.hontodare.Exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class HontoDareException extends RuntimeException {
    private final HttpStatus status;

    public HontoDareException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }
}