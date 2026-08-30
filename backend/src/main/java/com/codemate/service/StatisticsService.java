package com.codemate.service;

import com.codemate.dto.ActivityPointDTO;
import com.codemate.dto.DashboardResponse.StreakDTO;
import com.codemate.dto.StatisticsResponse;
import com.codemate.entity.Category;
import com.codemate.entity.Difficulty;
import com.codemate.entity.Problem;
import com.codemate.repository.ProblemRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.TreeMap;
import java.util.stream.Collectors;

/**
 * Service for calculating user-scoped progress statistics.
 */
@Service
@Transactional(readOnly = true)
public class StatisticsService {

    private final ProblemRepository problemRepository;
    private final StreakService streakService;

    public StatisticsService(ProblemRepository problemRepository, StreakService streakService) {
        this.problemRepository = problemRepository;
        this.streakService = streakService;
    }

    /**
     * Compute comprehensive statistics for the authenticated user.
     */
    public StatisticsResponse getStatisticsForUser(Long userId, ZoneId zoneId) {
        ZoneId effectiveZone = (zoneId != null) ? zoneId : ZoneId.systemDefault();
        LocalDate today = LocalDate.now(effectiveZone);
        LocalDate mondayOfWeek = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate sundayOfWeek = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));

        List<Problem> problems = problemRepository.findByUserId(userId, Sort.by(Sort.Direction.DESC, "solvedAt"));

        long total = problems.size();
        long logic = problems.stream().filter(p -> p.getCategory() == Category.LOGIC).count();
        long dsa = problems.stream().filter(p -> p.getCategory() == Category.DSA).count();

        // Solved today & solved this week
        int solvedToday = 0;
        int solvedThisWeek = 0;
        Map<LocalDate, Integer> dateCounts = new TreeMap<>();

        for (Problem p : problems) {
            if (p.getSolvedAt() != null) {
                LocalDate problemDate = p.getSolvedAt().atZone(effectiveZone).toLocalDate();
                if (problemDate.equals(today)) {
                    solvedToday++;
                }
                if (!problemDate.isBefore(mondayOfWeek) && !problemDate.isAfter(sundayOfWeek)) {
                    solvedThisWeek++;
                }
                dateCounts.put(problemDate, dateCounts.getOrDefault(problemDate, 0) + 1);
            }
        }

        StreakDTO streak = streakService.calculateStreakForUser(userId, effectiveZone);

        // Distributions
        Map<String, Long> categoryDistribution = new LinkedHashMap<>();
        categoryDistribution.put("DSA", dsa);
        categoryDistribution.put("LOGIC", logic);

        Map<String, Long> difficultyDistribution = new LinkedHashMap<>();
        difficultyDistribution.put("EASY", problems.stream().filter(p -> p.getDifficulty() == Difficulty.EASY).count());
        difficultyDistribution.put("MEDIUM", problems.stream().filter(p -> p.getDifficulty() == Difficulty.MEDIUM).count());
        difficultyDistribution.put("HARD", problems.stream().filter(p -> p.getDifficulty() == Difficulty.HARD).count());

        Map<String, Long> platformDistribution = problems.stream()
                .filter(p -> p.getPlatform() != null && !p.getPlatform().isBlank())
                .collect(Collectors.groupingBy(Problem::getPlatform, Collectors.counting()));

        Map<String, Long> languageDistribution = problems.stream()
                .filter(p -> p.getProgrammingLanguage() != null && !p.getProgrammingLanguage().isBlank())
                .collect(Collectors.groupingBy(Problem::getProgrammingLanguage, Collectors.counting()));

        Map<String, Long> topicDistribution = problems.stream()
                .filter(p -> p.getTopic() != null && !p.getTopic().isBlank())
                .collect(Collectors.groupingBy(Problem::getTopic, Collectors.counting()));

        // Activity timeline (e.g. past 60 days)
        List<ActivityPointDTO> activityList = new ArrayList<>();
        LocalDate timelineStart = today.minusDays(59);
        for (LocalDate date = timelineStart; !date.isAfter(today); date = date.plusDays(1)) {
            int count = dateCounts.getOrDefault(date, 0);
            activityList.add(new ActivityPointDTO(date.toString(), count));
        }

        StatisticsResponse response = new StatisticsResponse();
        response.setTotalProblems(total);
        response.setLogicProblems(logic);
        response.setDsaProblems(dsa);
        response.setSolvedToday(solvedToday);
        response.setSolvedThisWeek(solvedThisWeek);
        response.setCurrentStreak(streak.getCurrentStreak());
        response.setLongestStreak(streak.getLongestStreak());
        response.setCategoryDistribution(categoryDistribution);
        response.setDifficultyDistribution(difficultyDistribution);
        response.setPlatformDistribution(platformDistribution);
        response.setLanguageDistribution(languageDistribution);
        response.setTopicDistribution(topicDistribution);
        response.setActivity(activityList);

        return response;
    }
}
