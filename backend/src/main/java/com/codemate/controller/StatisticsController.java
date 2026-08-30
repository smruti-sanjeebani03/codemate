package com.codemate.controller;

import com.codemate.dto.StatisticsResponse;
import com.codemate.security.UserPrincipal;
import com.codemate.service.StatisticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.ZoneId;

/**
 * Controller for granular coding statistics.
 * Requires authentication. All calculations scoped strictly to the authenticated user.
 */
@RestController
@RequestMapping("/api/statistics")
public class StatisticsController {

    private final StatisticsService statisticsService;

    public StatisticsController(StatisticsService statisticsService) {
        this.statisticsService = statisticsService;
    }

    /**
     * GET /api/statistics
     * Returns comprehensive problem distribution, streak, weekly velocity, and activity timeline.
     */
    @GetMapping
    public ResponseEntity<StatisticsResponse> getStatistics(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestHeader(value = "X-Timezone", required = false) String timezone) {
        ZoneId zoneId = parseZoneId(timezone);
        StatisticsResponse stats = statisticsService.getStatisticsForUser(principal.getId(), zoneId);
        return ResponseEntity.ok(stats);
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
