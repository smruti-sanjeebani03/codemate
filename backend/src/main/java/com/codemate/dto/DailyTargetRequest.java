package com.codemate.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * Request payload to update the user's daily coding problem target.
 * Validates sensible range: 1 to 100 problems per day.
 */
public class DailyTargetRequest {

    @NotNull(message = "Daily target is required")
    @Min(value = 1, message = "Daily target must be at least 1 problem per day")
    @Max(value = 100, message = "Daily target cannot exceed 100 problems per day")
    private Integer dailyTarget;

    public DailyTargetRequest() {}

    public DailyTargetRequest(Integer dailyTarget) {
        this.dailyTarget = dailyTarget;
    }

    public Integer getDailyTarget() {
        return dailyTarget;
    }

    public void setDailyTarget(Integer dailyTarget) {
        this.dailyTarget = dailyTarget;
    }
}
