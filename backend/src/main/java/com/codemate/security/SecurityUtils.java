package com.codemate.security;

import com.codemate.exception.InvalidCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Utility for retrieving the currently authenticated user principal from the Spring SecurityContext.
 */
public final class SecurityUtils {

    private SecurityUtils() {
    }

    /**
     * Returns the currently authenticated UserPrincipal or throws InvalidCredentialsException if unauthenticated.
     */
    public static UserPrincipal getCurrentUserPrincipal() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal) {
            return (UserPrincipal) authentication.getPrincipal();
        }
        throw new InvalidCredentialsException("No authenticated user found in security context");
    }

    /**
     * Returns current user ID from the security context.
     */
    public static Long getCurrentUserId() {
        return getCurrentUserPrincipal().getId();
    }

    /**
     * Returns current user email from the security context.
     */
    public static String getCurrentUserEmail() {
        return getCurrentUserPrincipal().getEmail();
    }
}
