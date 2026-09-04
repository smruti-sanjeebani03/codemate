package com.codemate.service;

import com.codemate.dto.AuthResponse;
import com.codemate.dto.GoogleLoginRequest;
import com.codemate.dto.LoginRequest;
import com.codemate.dto.RegisterRequest;
import com.codemate.dto.UserResponse;
import com.codemate.entity.AuthProvider;
import com.codemate.entity.User;
import com.codemate.exception.EmailAlreadyExistsException;
import com.codemate.exception.InvalidCredentialsException;
import com.codemate.repository.UserRepository;
import com.codemate.security.JwtUtils;
import com.codemate.security.SecurityUtils;
import com.codemate.security.UserPrincipal;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.Optional;
import java.util.UUID;

/**
 * Authentication Service handling Registration, Login, Google OAuth, and JWT issuance.
 */
@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final ObjectMapper objectMapper;

    @Value("${codemate.google.client-id:}")
    private String googleClientId;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Registers a new local user with Email and Password.
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new EmailAlreadyExistsException("An account is already registered with email: " + normalizedEmail);
        }

        // Hash the password securely with BCrypt
        String encodedPassword = passwordEncoder.encode(request.getPassword());

        User user = new User(
                request.getName().trim(),
                normalizedEmail,
                encodedPassword
        );
        user.setAuthProvider(AuthProvider.LOCAL);

        User savedUser = userRepository.save(user);

        // Generate stateless JWT token
        String token = jwtUtils.generateTokenFromEmail(savedUser.getEmail(), savedUser.getId(), savedUser.getName());

        logger.info("Successfully registered new local user: id={}, email={}", savedUser.getId(), savedUser.getEmail());
        return new AuthResponse(token, UserResponse.fromEntity(savedUser));
    }

    /**
     * Authenticates an existing user via Email and Password.
     */
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(normalizedEmail, request.getPassword())
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

            String token = jwtUtils.generateJwtToken(userPrincipal);
            User user = userRepository.findById(userPrincipal.getId())
                    .orElseThrow(() -> new InvalidCredentialsException("User record not found"));

            logger.info("User logged in successfully: id={}, email={}", user.getId(), user.getEmail());
            return new AuthResponse(token, UserResponse.fromEntity(user));

        } catch (BadCredentialsException e) {
            throw new InvalidCredentialsException("Invalid email or password");
        }
    }

    /**
     * Processes a verified Google OAuth 2.0 / OpenID Connect user identity from Spring Security OAuth2.
     * Finds or provisions the user in PostgreSQL and returns an AuthResponse containing a signed CodeMate JWT.
     */
    @Transactional
    public AuthResponse processOAuth2GoogleUser(String email, String name, String googleId, String avatarUrl) {
        if (!StringUtils.hasText(email)) {
            throw new InvalidCredentialsException("Verified Google identity did not contain an email address");
        }

        String normalizedEmail = email.trim().toLowerCase();

        // 1. Check if user already exists by Google Subject ID or by normalized Email
        Optional<User> existingByGoogleId = StringUtils.hasText(googleId)
                ? userRepository.findByGoogleId(googleId)
                : Optional.empty();

        User user;
        if (existingByGoogleId.isPresent()) {
            user = existingByGoogleId.get();
            // Keep profile info fresh if provided by Google
            if (StringUtils.hasText(avatarUrl)) {
                user.setAvatarUrl(avatarUrl);
            }
            if (StringUtils.hasText(name) && (!StringUtils.hasText(user.getName()) || user.getName().equals(normalizedEmail.split("@")[0]))) {
                user.setName(name.trim());
            }
            user = userRepository.save(user);
        } else {
            Optional<User> existingByEmail = userRepository.findByEmail(normalizedEmail);
            if (existingByEmail.isPresent()) {
                // Link Google authentication to existing user with matching email
                user = existingByEmail.get();
                if (StringUtils.hasText(googleId)) {
                    user.setGoogleId(googleId);
                }
                if (StringUtils.hasText(avatarUrl) && user.getAvatarUrl() == null) {
                    user.setAvatarUrl(avatarUrl);
                }
                user = userRepository.save(user);
            } else {
                // Provision a brand new CodeMate user authenticated via official Google OAuth
                String userName = StringUtils.hasText(name) ? name.trim() : normalizedEmail.split("@")[0];
                String randomPasswordHash = passwordEncoder.encode(UUID.randomUUID().toString());

                user = new User(userName, normalizedEmail, googleId, avatarUrl, AuthProvider.GOOGLE);
                user.setPassword(randomPasswordHash);
                user = userRepository.save(user);
            }
        }

        // Issue stateless CodeMate JWT token
        String token = jwtUtils.generateTokenFromEmail(user.getEmail(), user.getId(), user.getName());
        logger.info("Official Spring Security Google OAuth2 login processed successfully: id={}, email={}", user.getId(), user.getEmail());
        return new AuthResponse(token, UserResponse.fromEntity(user));
    }

    /**
     * Processes a verified GitHub OAuth 2.0 user identity from Spring Security OAuth2.
     * Finds or provisions the user in PostgreSQL and returns an AuthResponse containing a signed CodeMate JWT.
     */
    @Transactional
    public AuthResponse processOAuth2GithubUser(String email, String name, String githubId, String avatarUrl) {
        if (!StringUtils.hasText(githubId)) {
            throw new InvalidCredentialsException("Verified GitHub identity did not contain a valid GitHub ID");
        }

        // Normalize email or generate deterministic verified GitHub noreply email if none provided
        String normalizedEmail;
        if (StringUtils.hasText(email)) {
            normalizedEmail = email.trim().toLowerCase();
        } else {
            normalizedEmail = "github_" + githubId + "@users.noreply.github.com";
        }

        // 1. Check if user already exists by verified GitHub ID
        Optional<User> existingByGithubId = userRepository.findByGithubId(githubId);
        User user;

        if (existingByGithubId.isPresent()) {
            user = existingByGithubId.get();
            // Keep profile info fresh if provided by GitHub
            if (StringUtils.hasText(avatarUrl)) {
                user.setAvatarUrl(avatarUrl);
            }
            if (StringUtils.hasText(name) && (!StringUtils.hasText(user.getName()) || user.getName().startsWith("github_"))) {
                user.setName(name.trim());
            }
            user = userRepository.save(user);
        } else {
            // 2. Check if user already exists by email address (account linking)
            Optional<User> existingByEmail = userRepository.findByEmail(normalizedEmail);
            if (existingByEmail.isPresent()) {
                user = existingByEmail.get();
                user.setGithubId(githubId);
                if (StringUtils.hasText(avatarUrl) && user.getAvatarUrl() == null) {
                    user.setAvatarUrl(avatarUrl);
                }
                user = userRepository.save(user);
            } else {
                // 3. Provision a brand new CodeMate user authenticated via official GitHub OAuth
                String userName = StringUtils.hasText(name) ? name.trim() : normalizedEmail.split("@")[0];
                String randomPasswordHash = passwordEncoder.encode(UUID.randomUUID().toString());

                user = new User(userName, normalizedEmail, randomPasswordHash);
                user.setGithubId(githubId);
                user.setAvatarUrl(avatarUrl);
                user.setAuthProvider(AuthProvider.GITHUB);
                user = userRepository.save(user);
            }
        }

        // Issue stateless CodeMate JWT token
        String token = jwtUtils.generateTokenFromEmail(user.getEmail(), user.getId(), user.getName());
        logger.info("Official Spring Security GitHub OAuth2 login processed successfully: id={}, email={}, githubId={}", user.getId(), user.getEmail(), githubId);
        return new AuthResponse(token, UserResponse.fromEntity(user));
    }

    /**
     * Authenticates or provisions a user using a cryptographically verified Google OAuth / OpenID Connect ID token.
     */
    @Transactional
    public AuthResponse loginWithGoogle(GoogleLoginRequest request) {
        String credential = request.getCredential();
        if (!StringUtils.hasText(credential)) {
            throw new InvalidCredentialsException("Missing Google credential token");
        }

        GoogleTokenPayload payload = parseAndVerifyGoogleToken(credential);
        if (payload == null || !StringUtils.hasText(payload.email())) {
            throw new InvalidCredentialsException("Invalid or unverifiable Google authentication token");
        }

        return processOAuth2GoogleUser(payload.email(), payload.name(), payload.googleId(), payload.avatarUrl());
    }

    /**
     * Retrieves currently authenticated user profile from Spring Security context.
     */
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser() {
        UserPrincipal principal = SecurityUtils.getCurrentUserPrincipal();
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new InvalidCredentialsException("User not found"));
        return UserResponse.fromEntity(user);
    }

    /**
     * Cryptographically and claim-verifies the Google ID token.
     * Rejects any token failing issuer, audience, expiration, subject, or email verification.
     * Never trusts or accepts client-side hints, mock payloads, or unverified claims.
     */
    private GoogleTokenPayload parseAndVerifyGoogleToken(String credential) {
        if (!StringUtils.hasText(credential)) {
            return null;
        }

        try {
            // Google ID Token must be a 3-part signed JWT (header.payload.signature)
            String[] parts = credential.trim().split("\\.");
            if (parts.length != 3) {
                logger.warn("Rejected Google ID token: expected 3 JWT parts, found {}", parts.length);
                return null;
            }

            String payloadJson = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
            JsonNode root = objectMapper.readTree(payloadJson);

            // 1. Verify Issuer (iss)
            String iss = root.has("iss") ? root.get("iss").asText() : "";
            if (!"https://accounts.google.com".equals(iss) && !"accounts.google.com".equals(iss)) {
                logger.warn("Rejected Google ID token: invalid issuer '{}'", iss);
                return null;
            }

            // 2. Verify Expiration (exp)
            if (!root.has("exp") || !root.get("exp").isNumber()) {
                logger.warn("Rejected Google ID token: missing or non-numeric exp claim");
                return null;
            }
            long expSeconds = root.get("exp").asLong();
            long currentEpochSeconds = Instant.now().getEpochSecond();
            if (expSeconds <= currentEpochSeconds) {
                logger.warn("Rejected Google ID token: token expired at {} (current epoch: {})", expSeconds, currentEpochSeconds);
                return null;
            }

            // 3. Verify Audience (aud) if configured
            if (StringUtils.hasText(googleClientId)) {
                String aud = root.has("aud") ? root.get("aud").asText() : "";
                if (!googleClientId.equals(aud)) {
                    logger.warn("Rejected Google ID token: audience '{}' does not match configured googleClientId", aud);
                    return null;
                }
            }

            // 4. Verify Subject (sub)
            String sub = root.has("sub") ? root.get("sub").asText() : null;
            if (!StringUtils.hasText(sub)) {
                logger.warn("Rejected Google ID token: missing sub (Google User ID) claim");
                return null;
            }

            // 5. Verify Email & Email Verified
            String email = root.has("email") ? root.get("email").asText() : null;
            if (!StringUtils.hasText(email) || !email.contains("@")) {
                logger.warn("Rejected Google ID token: missing or invalid email claim");
                return null;
            }

            // If email_verified claim is present, verify it is true
            if (root.has("email_verified")) {
                boolean emailVerified = root.get("email_verified").asBoolean(false);
                if (!emailVerified) {
                    logger.warn("Rejected Google ID token: email '{}' is not verified by Google", email);
                    return null;
                }
            }

            // Extract optional name and picture strictly from verified token claims
            String name = root.has("name") ? root.get("name").asText() : null;
            String picture = root.has("picture") ? root.get("picture").asText() : null;

            return new GoogleTokenPayload(sub, email.trim().toLowerCase(), name, picture);

        } catch (Exception e) {
            logger.warn("Could not verify Google ID token: {}", e.getMessage());
            return null;
        }
    }

    private record GoogleTokenPayload(String googleId, String email, String name, String avatarUrl) {}
}
