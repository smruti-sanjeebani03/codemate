package com.codemate.exception;

/**
 * Thrown when CodeCat AI service cannot complete a request due to missing API key,
 * invalid credentials, rate limiting / quota exhaustion, or external provider unavailability.
 */
public class AiServiceUnavailableException extends RuntimeException {
    public AiServiceUnavailableException(String message) {
        super(message);
    }

    public AiServiceUnavailableException(String message, Throwable cause) {
        super(message, cause);
    }
}
