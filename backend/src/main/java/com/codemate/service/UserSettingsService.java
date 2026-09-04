package com.codemate.service;

import com.codemate.dto.DailyTargetRequest;
import com.codemate.dto.DailyTargetResponse;
import com.codemate.entity.User;
import com.codemate.entity.UserSettings;
import com.codemate.exception.ResourceNotFoundException;
import com.codemate.repository.UserRepository;
import com.codemate.repository.UserSettingsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for managing user settings including daily coding target.
 */
@Service
@Transactional
public class UserSettingsService {

    private static final int DEFAULT_DAILY_TARGET = 3;
    private static final int MIN_DAILY_TARGET = 1;
    private static final int MAX_DAILY_TARGET = 100;

    private final UserSettingsRepository userSettingsRepository;
    private final UserRepository userRepository;

    public UserSettingsService(
            UserSettingsRepository userSettingsRepository,
            UserRepository userRepository) {
        this.userSettingsRepository = userSettingsRepository;
        this.userRepository = userRepository;
    }

    /**
     * Get or initialize the user's daily target.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public DailyTargetResponse getDailyTarget(Long userId) {
        UserSettings settings = userSettingsRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() ->
                                    new ResourceNotFoundException("User not found: " + userId));

                    UserSettings newSettings =
                            new UserSettings(user, DEFAULT_DAILY_TARGET);

                    return userSettingsRepository.save(newSettings);
                });

        return new DailyTargetResponse(settings.getDailyTarget());
    }

    /**
     * Update the user's daily target with validation.
     */
    public DailyTargetResponse updateDailyTarget(
            Long userId,
            DailyTargetRequest request) {

        if (request == null || request.getDailyTarget() == null) {
            throw new IllegalArgumentException("Daily target is required");
        }

        int target = request.getDailyTarget();

        if (target < MIN_DAILY_TARGET || target > MAX_DAILY_TARGET) {
            throw new IllegalArgumentException(
                    String.format(
                            "Daily target must be between %d and %d problems per day",
                            MIN_DAILY_TARGET,
                            MAX_DAILY_TARGET
                    )
            );
        }

        UserSettings settings = userSettingsRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() ->
                                    new ResourceNotFoundException("User not found: " + userId));

                    return new UserSettings(user, target);
                });

        settings.setDailyTarget(target);

        UserSettings saved =
                userSettingsRepository.save(settings);

        return new DailyTargetResponse(saved.getDailyTarget());
    }
}