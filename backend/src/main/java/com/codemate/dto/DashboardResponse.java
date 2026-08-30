package com.codemate.dto;

import java.util.List;
import java.util.Map;

/**
 * Clean aggregate DTO for the CodeMate main dashboard.
 * All metrics are strictly calculated for the authenticated user.
 */
public class DashboardResponse {

    private SummaryDTO summary;
    private TodayProgressDTO today;
    private StreakDTO streak;
    private List<ProblemResponse> recentProblems;
    private List<ActivityPointDTO> activity;
    private Map<String, Long> categoryDistribution;
    private Map<String, Long> difficultyDistribution;
    private Map<String, Long> platformDistribution;
    private Map<String, Long> languageDistribution;
    private Map<String, Long> topicDistribution;

    public DashboardResponse() {
    }

    public static class SummaryDTO {
        private long totalProblems;
        private long logicProblems;
        private long dsaProblems;
        private long solvedThisWeek;

        public SummaryDTO() {}

        public SummaryDTO(long totalProblems, long logicProblems, long dsaProblems, long solvedThisWeek) {
            this.totalProblems = totalProblems;
            this.logicProblems = logicProblems;
            this.dsaProblems = dsaProblems;
            this.solvedThisWeek = solvedThisWeek;
        }

        public long getTotalProblems() { return totalProblems; }
        public void setTotalProblems(long totalProblems) { this.totalProblems = totalProblems; }
        public long getLogicProblems() { return logicProblems; }
        public void setLogicProblems(long logicProblems) { this.logicProblems = logicProblems; }
        public long getDsaProblems() { return dsaProblems; }
        public void setDsaProblems(long dsaProblems) { this.dsaProblems = dsaProblems; }
        public long getSolvedThisWeek() { return solvedThisWeek; }
        public void setSolvedThisWeek(long solvedThisWeek) { this.solvedThisWeek = solvedThisWeek; }
    }

    public static class TodayProgressDTO {
        private int target;
        private int solved;
        private int remaining;
        private int completionPercentage;
        private boolean targetCompleted;

        public TodayProgressDTO() {}

        public TodayProgressDTO(int target, int solved, int remaining, int completionPercentage, boolean targetCompleted) {
            this.target = target;
            this.solved = solved;
            this.remaining = remaining;
            this.completionPercentage = completionPercentage;
            this.targetCompleted = targetCompleted;
        }

        public int getTarget() { return target; }
        public void setTarget(int target) { this.target = target; }
        public int getSolved() { return solved; }
        public void setSolved(int solved) { this.solved = solved; }
        public int getRemaining() { return remaining; }
        public void setRemaining(int remaining) { this.remaining = remaining; }
        public int getCompletionPercentage() { return completionPercentage; }
        public void setCompletionPercentage(int completionPercentage) { this.completionPercentage = completionPercentage; }
        public boolean isTargetCompleted() { return targetCompleted; }
        public void setTargetCompleted(boolean targetCompleted) { this.targetCompleted = targetCompleted; }
    }

    public static class StreakDTO {
        private int currentStreak;
        private int longestStreak;
        private boolean isActiveToday;
        private String lastActiveDate;

        public StreakDTO() {}

        public StreakDTO(int currentStreak, int longestStreak, boolean isActiveToday, String lastActiveDate) {
            this.currentStreak = currentStreak;
            this.longestStreak = longestStreak;
            this.isActiveToday = isActiveToday;
            this.lastActiveDate = lastActiveDate;
        }

        public int getCurrentStreak() { return currentStreak; }
        public void setCurrentStreak(int currentStreak) { this.currentStreak = currentStreak; }
        public int getLongestStreak() { return longestStreak; }
        public void setLongestStreak(int longestStreak) { this.longestStreak = longestStreak; }
        public boolean isActiveToday() { return isActiveToday; }
        public void setActiveToday(boolean activeToday) { isActiveToday = activeToday; }
        public String getLastActiveDate() { return lastActiveDate; }
        public void setLastActiveDate(String lastActiveDate) { this.lastActiveDate = lastActiveDate; }
    }

    public SummaryDTO getSummary() { return summary; }
    public void setSummary(SummaryDTO summary) { this.summary = summary; }

    public TodayProgressDTO getToday() { return today; }
    public void setToday(TodayProgressDTO today) { this.today = today; }

    public StreakDTO getStreak() { return streak; }
    public void setStreak(StreakDTO streak) { this.streak = streak; }

    public List<ProblemResponse> getRecentProblems() { return recentProblems; }
    public void setRecentProblems(List<ProblemResponse> recentProblems) { this.recentProblems = recentProblems; }

    public List<ActivityPointDTO> getActivity() { return activity; }
    public void setActivity(List<ActivityPointDTO> activity) { this.activity = activity; }

    public Map<String, Long> getCategoryDistribution() { return categoryDistribution; }
    public void setCategoryDistribution(Map<String, Long> categoryDistribution) { this.categoryDistribution = categoryDistribution; }

    public Map<String, Long> getDifficultyDistribution() { return difficultyDistribution; }
    public void setDifficultyDistribution(Map<String, Long> difficultyDistribution) { this.difficultyDistribution = difficultyDistribution; }

    public Map<String, Long> getPlatformDistribution() { return platformDistribution; }
    public void setPlatformDistribution(Map<String, Long> platformDistribution) { this.platformDistribution = platformDistribution; }

    public Map<String, Long> getLanguageDistribution() { return languageDistribution; }
    public void setLanguageDistribution(Map<String, Long> languageDistribution) { this.languageDistribution = languageDistribution; }

    public Map<String, Long> getTopicDistribution() { return topicDistribution; }
    public void setTopicDistribution(Map<String, Long> topicDistribution) { this.topicDistribution = topicDistribution; }
}
