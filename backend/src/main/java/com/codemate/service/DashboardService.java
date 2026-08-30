package com.codemate.service;

import com.codemate.dto.ActivityPointDTO;
import com.codemate.dto.DashboardResponse;
import com.codemate.dto.DashboardResponse.StreakDTO;
import com.codemate.dto.DashboardResponse.SummaryDTO;
import com.codemate.dto.DashboardResponse.TodayProgressDTO;
import com.codemate.dto.ProblemResponse;
import com.codemate.dto.StatisticsResponse;
import com.codemate.entity.Problem;
import com.codemate.repository.ProblemRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Aggregates core metrics into the primary CodeMate dashboard response.
 */
@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final StatisticsService statisticsService;
    private final StreakService streakService;
    private final UserSettingsService userSettingsService;
    private final ProblemRepository problemRepository;

    public DashboardService(
            StatisticsService statisticsService,
            StreakService streakService,
            UserSettingsService userSettingsService,
            ProblemRepository problemRepository) {
        this.statisticsService = statisticsService;
        this.streakService = streakService;
        this.userSettingsService = userSettingsService;
        this.problemRepository = problemRepository;
    }

    /**
     * Build the primary dashboard response for the authenticated user.
     */
    public DashboardResponse getDashboardForUser(Long userId, ZoneId zoneId) {
        ZoneId effectiveZone = (zoneId != null) ? zoneId : ZoneId.systemDefault();

        // 1. Fetch user statistics
        StatisticsResponse stats = statisticsService.getStatisticsForUser(userId, effectiveZone);

        // 2. Fetch daily target
        int target = userSettingsService.getDailyTarget(userId).getDailyTarget();
        int solvedToday = stats.getSolvedToday();
        int remaining = Math.max(0, target - solvedToday);
        int percentage = (int) Math.min(100, Math.round(((double) solvedToday / target) * 100.0));
        boolean targetCompleted = solvedToday >= target;

        TodayProgressDTO todayProgress = new TodayProgressDTO(
                target,
                solvedToday,
                remaining,
                percentage,
                targetCompleted
        );

        SummaryDTO summary = new SummaryDTO(
                stats.getTotalProblems(),
                stats.getLogicProblems(),
                stats.getDsaProblems(),
                stats.getSolvedThisWeek()
        );

        StreakDTO streak = streakService.calculateStreakForUser(userId, effectiveZone);

        // 3. Fetch latest 5-10 recent problems (efficient top 10 limit)
        List<Problem> recentList = problemRepository.findByUserId(
                userId,
                PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "solvedAt"))
        ).getContent();

        List<ProblemResponse> recentProblems = recentList.stream()
                .map(ProblemResponse::fromEntity)
                .collect(Collectors.toList());

        DashboardResponse response = new DashboardResponse();
        response.setSummary(summary);
        response.setToday(todayProgress);
        response.setStreak(streak);
        response.setRecentProblems(recentProblems);
        response.setActivity(stats.getActivity());
        response.setCategoryDistribution(stats.getCategoryDistribution());
        response.setDifficultyDistribution(stats.getDifficultyDistribution());
        response.setPlatformDistribution(stats.getPlatformDistribution());
        response.setLanguageDistribution(stats.getLanguageDistribution());
        response.setTopicDistribution(stats.getTopicDistribution());

        return response;
    }
}
