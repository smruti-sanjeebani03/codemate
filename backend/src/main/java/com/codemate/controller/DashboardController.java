package com.codemate.controller;

import com.codemate.dto.DashboardResponse;
import com.codemate.security.UserPrincipal;
import com.codemate.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.ZoneId;

/**
 * Controller for the primary CodeMate dashboard.
 * Requires authentication. All calculations are strictly user-specific.
 */
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    /**
     * GET /api/dashboard
     * Returns aggregate summary, today's progress, streak info, recent problems, distributions, and activity.
     */
    @GetMapping
    public ResponseEntity<DashboardResponse> getDashboard(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestHeader(value = "X-Timezone", required = false) String timezone) {
        ZoneId zoneId = parseZoneId(timezone);
        DashboardResponse dashboard = dashboardService.getDashboardForUser(principal.getId(), zoneId);
        return ResponseEntity.ok(dashboard);
    }

    private ZoneId parseZoneId(String timezone) {
        if (timezone == null || timezone.isBlank()) {
            return ZoneId.systemDefault();
        }
        try {
            return ZoneId.of(timezone.trim());
        } catch (Exception e) {
            return ZoneId.systemDefault();
        }
    }
}
