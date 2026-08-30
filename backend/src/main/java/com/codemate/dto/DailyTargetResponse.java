package com.codemate.dto;

/**
 * Response DTO for user's configured daily target.
 */
public class DailyTargetResponse {
    private Integer dailyTarget;

    public DailyTargetResponse() {}

    public DailyTargetResponse(Integer dailyTarget) {
        this.dailyTarget = dailyTarget;
    }

    public Integer getDailyTarget() {
        return dailyTarget;
    }

    public void setDailyTarget(Integer dailyTarget) {
        this.dailyTarget = dailyTarget;
    }
}
