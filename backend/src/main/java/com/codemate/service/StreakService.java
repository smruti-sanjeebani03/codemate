package com.codemate.service;

import com.codemate.dto.DashboardResponse.StreakDTO;
import com.codemate.entity.Problem;
import com.codemate.repository.ProblemRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.TreeSet;
import java.util.stream.Collectors;

/**
 * Dedicated Streak Calculation Service.
 * Acts as the authoritative source of truth for coding streaks.
 * 
 * Rules:
 * 1. Active Day: Calendar day (LocalDate) with >= 1 solved problem. Multiple problems on the same day count as 1 active day.
 * 2. Future Dates: Ignored to prevent corrupting streak calculations.
 * 3. Current Streak:
 *    - If today is active, count backward from today across consecutive days.
 *    - If today is not active but yesterday is active, streak remains alive counting backward from yesterday.
 *    - If neither today nor yesterday is active, current streak is 0.
 * 4. Longest Streak: Max length of any consecutive sequence of active days historically.
 */
@Service
@Transactional(readOnly = true)
public class StreakService {

    private final ProblemRepository problemRepository;

    public StreakService(ProblemRepository problemRepository) {
        this.problemRepository = problemRepository;
    }

    /**
     * Calculates streak statistics for a given user.
     *
     * @param userId The authenticated user ID.
     * @param zoneId Timezone to normalize problem solved dates (defaults to UTC or System).
     * @return StreakDTO containing currentStreak, longestStreak, isActiveToday, lastActiveDate.
     */
    public StreakDTO calculateStreakForUser(Long userId, ZoneId zoneId) {
        ZoneId effectiveZone = (zoneId != null) ? zoneId : ZoneId.systemDefault();
        List<Problem> problems = problemRepository.findByUserId(userId, Sort.by(Sort.Direction.ASC, "solvedAt"));

        List<Instant> solvedInstants = problems.stream()
                .map(Problem::getSolvedAt)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        return calculateStreak(solvedInstants, effectiveZone);
    }

    /**
     * Core pure calculation method for testability and consistency.
     */
    public StreakDTO calculateStreak(List<Instant> solvedInstants, ZoneId zoneId) {
        if (solvedInstants == null || solvedInstants.isEmpty()) {
            return new StreakDTO(0, 0, false, null);
        }

        LocalDate today = LocalDate.now(zoneId);

        // 1. Normalize instants to distinct sorted calendar dates (excluding future dates)
        Set<LocalDate> activeDates = solvedInstants.stream()
                .filter(Objects::nonNull)
                .map(instant -> instant.atZone(zoneId).toLocalDate())
                .filter(date -> !date.isAfter(today)) // filter out future dates
                .collect(Collectors.toCollection(TreeSet::new));

        if (activeDates.isEmpty()) {
            return new StreakDTO(0, 0, false, null);
        }

        List<LocalDate> sortedDates = activeDates.stream().sorted().collect(Collectors.toList());

        boolean isActiveToday = activeDates.contains(today);
        LocalDate yesterday = today.minusDays(1);
        boolean isActiveYesterday = activeDates.contains(yesterday);

        // 2. Calculate Current Streak
        int currentStreak = 0;
        if (isActiveToday) {
            currentStreak = 1;
            LocalDate checkDate = today.minusDays(1);
            while (activeDates.contains(checkDate)) {
                currentStreak++;
                checkDate = checkDate.minusDays(1);
            }
        } else if (isActiveYesterday) {
            currentStreak = 1;
            LocalDate checkDate = yesterday.minusDays(1);
            while (activeDates.contains(checkDate)) {
                currentStreak++;
                checkDate = checkDate.minusDays(1);
            }
        } else {
            currentStreak = 0;
        }

        // 3. Calculate Longest Streak
        int longestStreak = 0;
        int runningStreak = 0;
        LocalDate previousDate = null;

        for (LocalDate date : sortedDates) {
            if (previousDate == null) {
                runningStreak = 1;
            } else {
                long daysDiff = ChronoUnit.DAYS.between(previousDate, date);
                if (daysDiff == 1) {
                    runningStreak++;
                } else {
                    runningStreak = 1;
                }
            }
            if (runningStreak > longestStreak) {
                longestStreak = runningStreak;
            }
            previousDate = date;
        }

        // In case currentStreak is greater than historical calculated longest
        longestStreak = Math.max(longestStreak, currentStreak);

        LocalDate lastActive = sortedDates.get(sortedDates.size() - 1);

        return new StreakDTO(
                currentStreak,
                longestStreak,
                isActiveToday,
                lastActive != null ? lastActive.toString() : null
        );
    }
}
