package com.codemate.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.context.annotation.Lazy;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * Spring Security Configuration for CodeMate.
 *
 * - Stateless session management (no sessions stored in server memory)
 * - Standard BCrypt password hashing
 * - Intercepts incoming requests with JwtAuthenticationFilter
 * - Permits public endpoints (/api/auth/**, /api/health, /api/public/**)
 * - Protects authenticated user endpoints
 * - Supports Google/GitHub OAuth2 login
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationEntryPoint unauthorizedHandler;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler;
    private final OAuth2AuthenticationFailureHandler oAuth2AuthenticationFailureHandler;

    @Value("${codemate.cors.allowed-origins:http://localhost:3000,http://localhost:5173}")
    private String allowedOrigins;

    @Value("${codemate.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    public SecurityConfig(
            JwtAuthenticationEntryPoint unauthorizedHandler,
            JwtAuthenticationFilter jwtAuthenticationFilter,
            @Lazy OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler,
            OAuth2AuthenticationFailureHandler oAuth2AuthenticationFailureHandler) {

        this.unauthorizedHandler = unauthorizedHandler;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.oAuth2AuthenticationSuccessHandler = oAuth2AuthenticationSuccessHandler;
        this.oAuth2AuthenticationFailureHandler = oAuth2AuthenticationFailureHandler;
    }

    /**
     * Password encoder used for local account passwords.
     *
     * AuthenticationManager and DaoAuthenticationProvider are configured
     * separately in AuthenticationConfig to avoid a circular dependency
     * between AuthService and SecurityConfig.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * CORS configuration for the React frontend.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        Set<String> originSet = new LinkedHashSet<>();

        if (frontendUrl != null && !frontendUrl.trim().isEmpty()) {
            originSet.add(frontendUrl.trim().replaceAll("/+$", ""));
        }

        if (allowedOrigins != null && !allowedOrigins.trim().isEmpty()) {
            Arrays.stream(allowedOrigins.split(","))
                    .map(String::trim)
                    .map(s -> s.replaceAll("/+$", ""))
                    .filter(s -> !s.isEmpty())
                    .forEach(originSet::add);
        }

        configuration.setAllowedOrigins(new ArrayList<>(originSet));

        configuration.setAllowedMethods(Arrays.asList(
                "GET",
                "POST",
                "PUT",
                "PATCH",
                "DELETE",
                "OPTIONS"
        ));

        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type",
                "X-Requested-With",
                "Accept",
                "Origin"
        ));

        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    /**
     * Main Spring Security filter chain.
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                .csrf(csrf -> csrf.disable())

                .exceptionHandling(exception ->
                        exception.authenticationEntryPoint(unauthorizedHandler)
                )

                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                .authorizeHttpRequests(auth -> auth

                        // Public authentication endpoints
                        .requestMatchers(
                                "/api/auth/**",

                                // Health/status endpoints
                                "/api/health",
                                "/api/codecat/status",
                                "/api/public/**",

                                // OAuth2 authorization and callback endpoints
                                "/oauth2/**",
                                "/login/oauth2/**",

                                // Spring error endpoint
                                "/error"
                        ).permitAll()

                        // CORS preflight requests
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Everything else requires authentication
                        .anyRequest().authenticated()
                )

                .oauth2Login(oauth2 -> oauth2

                        .authorizationEndpoint(authorization ->
                                authorization.baseUri("/oauth2/authorization")
                        )

                        .redirectionEndpoint(redirection ->
                                redirection.baseUri("/login/oauth2/code/*")
                        )

                        .successHandler(oAuth2AuthenticationSuccessHandler)

                        .failureHandler(oAuth2AuthenticationFailureHandler)
                );

        /*
         * AuthenticationManager and DaoAuthenticationProvider are now
         * configured in AuthenticationConfig.java.
         *
         * We intentionally do NOT call:
         *
         *     http.authenticationProvider(authenticationProvider());
         *
         * here because doing so was part of the dependency cycle.
         */

        http.addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
        );

        return http.build();
    }
}