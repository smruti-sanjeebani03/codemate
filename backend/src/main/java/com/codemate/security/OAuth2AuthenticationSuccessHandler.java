package com.codemate.security;

import com.codemate.dto.AuthResponse;
import com.codemate.service.AuthService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Map;

/**
 * Spring Security OAuth2 Success Handler.
 *
 * Invoked when real Google or GitHub OAuth 2.0 authentication
 * completes successfully.
 *
 * Extracts the verified user identity, links or provisions the
 * CodeMate account, creates a JWT, and redirects back to React.
 */
@Component
public class OAuth2AuthenticationSuccessHandler
        extends SimpleUrlAuthenticationSuccessHandler {

    private static final Logger logger =
            LoggerFactory.getLogger(OAuth2AuthenticationSuccessHandler.class);

    private final AuthService authService;
    private final OAuth2AuthorizedClientService authorizedClientService;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    @Value("${codemate.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    public OAuth2AuthenticationSuccessHandler(
            AuthService authService,
            @Autowired(required = false)
            OAuth2AuthorizedClientService authorizedClientService) {

        this.authService = authService;
        this.authorizedClientService = authorizedClientService;
        this.objectMapper = new ObjectMapper();

        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(8))
                .build();
    }

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication)
            throws IOException, ServletException {

        if (response.isCommitted()) {
            logger.debug(
                    "Response has already been committed. Unable to redirect."
            );
            return;
        }

        try {
            OAuth2AuthenticationToken oauthToken =
                    (OAuth2AuthenticationToken) authentication;

            String registrationId =
                    oauthToken.getAuthorizedClientRegistrationId();

            OAuth2User oAuth2User = oauthToken.getPrincipal();

            Map<String, Object> attributes =
                    oAuth2User.getAttributes();

            AuthResponse authResponse;

            /*
             * ---------------------------------------------------------
             * GITHUB LOGIN
             * ---------------------------------------------------------
             */
            if ("github".equalsIgnoreCase(registrationId)) {

                Object rawId = attributes.get("id");

                String githubId =
                        rawId != null
                                ? String.valueOf(rawId)
                                : null;

                String name =
                        (String) attributes.get("name");

                String login =
                        (String) attributes.get("login");

                String avatarUrl =
                        (String) attributes.get("avatar_url");

                String email =
                        (String) attributes.get("email");

                if (name == null || name.isBlank()) {
                    name = login != null && !login.isBlank()
                            ? login
                            : "GitHub Developer";
                }

                /*
                 * GitHub may not return the user's email in the
                 * public profile. In that case query /user/emails
                 * using the verified OAuth access token.
                 */
                if (email == null || email.isBlank()) {
                    email = fetchPrimaryGithubEmail(oauthToken);
                }

                if (githubId == null || githubId.isBlank()) {

                    logger.error(
                            "OAuth2 GitHub user attributes did not contain an ID: {}",
                            attributes
                    );

                    redirectToFrontendWithError(
                            request,
                            response,
                            "GitHub authentication did not return a valid user ID."
                    );

                    return;
                }

                authResponse =
                        authService.processOAuth2GithubUser(
                                email,
                                name,
                                githubId,
                                avatarUrl
                        );

                logger.info(
                        "OAuth2 GitHub login succeeded for githubId={}, email={}",
                        githubId,
                        email
                );

            }

            /*
             * ---------------------------------------------------------
             * GOOGLE LOGIN
             * ---------------------------------------------------------
             */
            else {

                String email =
                        (String) attributes.get("email");

                String name =
                        (String) attributes.get("name");

                String googleId =
                        (String) attributes.get("sub");

                String picture =
                        (String) attributes.get("picture");

                if (email == null || email.isBlank()) {

                    logger.error(
                            "OAuth2 Google user attributes did not contain an email address: {}",
                            attributes
                    );

                    redirectToFrontendWithError(
                            request,
                            response,
                            "Google account does not provide an email address."
                    );

                    return;
                }

                authResponse =
                        authService.processOAuth2GoogleUser(
                                email,
                                name,
                                googleId,
                                picture
                        );

                logger.info(
                        "OAuth2 Google login succeeded for email={}",
                        email
                );
            }

            /*
             * ---------------------------------------------------------
             * REDIRECT TO REACT FRONTEND
             * ---------------------------------------------------------
             */

            String jwtToken = authResponse.getToken();

            String targetUrl =
                    UriComponentsBuilder
                            .fromUriString(frontendUrl)
                            .fragment(
                                    "auth/callback?token="
                                            + URLEncoder.encode(
                                                    jwtToken,
                                                    StandardCharsets.UTF_8
                                            )
                            )
                            .build()
                            .toUriString();

            getRedirectStrategy()
                    .sendRedirect(
                            request,
                            response,
                            targetUrl
                    );

        } catch (Exception ex) {

            logger.error(
                    "Error processing OAuth2 authentication success: {}",
                    ex.getMessage(),
                    ex
            );

            redirectToFrontendWithError(
                    request,
                    response,
                    "Authentication failed: " + ex.getMessage()
            );
        }
    }

    /**
     * Queries GitHub /user/emails using the OAuth2 access token
     * to retrieve a verified email address.
     */
    private String fetchPrimaryGithubEmail(
            OAuth2AuthenticationToken oauthToken) {

        try {

            if (authorizedClientService == null) {
                return null;
            }

            OAuth2AuthorizedClient client =
                    authorizedClientService.loadAuthorizedClient(
                            oauthToken.getAuthorizedClientRegistrationId(),
                            oauthToken.getName()
                    );

            if (client == null ||
                    client.getAccessToken() == null) {
                return null;
            }

            String accessToken =
                    client.getAccessToken().getTokenValue();

            HttpRequest emailRequest =
                    HttpRequest.newBuilder()
                            .uri(
                                    URI.create(
                                            "https://api.github.com/user/emails"
                                    )
                            )
                            .header(
                                    "Authorization",
                                    "Bearer " + accessToken
                            )
                            .header(
                                    "Accept",
                                    "application/vnd.github+json"
                            )
                            .header(
                                    "User-Agent",
                                    "codemate"
                            )
                            .timeout(Duration.ofSeconds(6))
                            .GET()
                            .build();

            HttpResponse<String> emailResponse =
                    httpClient.send(
                            emailRequest,
                            HttpResponse.BodyHandlers.ofString()
                    );

            if (emailResponse.statusCode() == 200) {

                JsonNode emailsNode =
                        objectMapper.readTree(
                                emailResponse.body()
                        );

                if (emailsNode.isArray()) {

                    /*
                     * Priority 1:
                     * Primary + verified email
                     */
                    for (JsonNode node : emailsNode) {

                        if (node.path("primary").asBoolean()
                                && node.path("verified").asBoolean()) {

                            String mail =
                                    node.path("email").asText();

                            if (mail != null && !mail.isBlank()) {
                                return mail.trim().toLowerCase();
                            }
                        }
                    }

                    /*
                     * Priority 2:
                     * Any verified email
                     */
                    for (JsonNode node : emailsNode) {

                        if (node.path("verified").asBoolean()) {

                            String mail =
                                    node.path("email").asText();

                            if (mail != null && !mail.isBlank()) {
                                return mail.trim().toLowerCase();
                            }
                        }
                    }

                    /*
                     * Priority 3:
                     * First available email
                     */
                    if (!emailsNode.isEmpty()) {

                        String mail =
                                emailsNode
                                        .get(0)
                                        .path("email")
                                        .asText();

                        if (mail != null && !mail.isBlank()) {
                            return mail.trim().toLowerCase();
                        }
                    }
                }
            }

        } catch (Exception e) {

            logger.warn(
                    "Could not fetch private email from GitHub API: {}",
                    e.getMessage()
            );
        }

        return null;
    }

    /**
     * Redirects the user back to React with an authentication error.
     */
    private void redirectToFrontendWithError(
            HttpServletRequest request,
            HttpServletResponse response,
            String errorMessage)
            throws IOException {

        String targetUrl =
                UriComponentsBuilder
                        .fromUriString(frontendUrl)
                        .fragment(
                                "auth/callback?error="
                                        + URLEncoder.encode(
                                                errorMessage,
                                                StandardCharsets.UTF_8
                                        )
                        )
                        .build()
                        .toUriString();

        getRedirectStrategy()
                .sendRedirect(
                        request,
                        response,
                        targetUrl
                );
    }
}