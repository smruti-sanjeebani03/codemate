package com.codemate.dto;

import java.util.List;
import java.util.Map;

/**
 * Detailed statistics response for the authenticated user.
 */
public class StatisticsResponse {

    private long totalProblems;
    private long logicProblems;
    private long dsaProblems;
    private int solvedToday;
    private int solvedThisWeek;
    private int currentStreak;
    private int longestStreak;
    private Map<String, Long> categoryDistribution;
    private Map<String, Long> difficultyDistribution;
    private Map<String, Long> topicDistribution;
    private Map<String, Long> platformDistribution;
    private Map<String, Long> languageDistribution;
    private List<ActivityPointDTO> activity;

    public StatisticsResponse() {
    }

    public long getTotalProblems() { return totalProblems; }
    public void setTotalProblems(long totalProblems) { this.totalProblems = totalProblems; }

    public long getLogicProblems() { return logicProblems; }
    public void setLogicProblems(long logicProblems) { this.logicProblems = logicProblems; }

    public long getDsaProblems() { return dsaProblems; }
    public void setDsaProblems(long dsaProblems) { this.dsaProblems = dsaProblems; }

    public int getSolvedToday() { return solvedToday; }
    public void setSolvedToday(int solvedToday) { this.solvedToday = solvedToday; }

    public int getSolvedThisWeek() { return solvedThisWeek; }
    public void setSolvedThisWeek(int solvedThisWeek) { this.solvedThisWeek = solvedThisWeek; }

    public int getCurrentStreak() { return currentStreak; }
    public void setCurrentStreak(int currentStreak) { this.currentStreak = currentStreak; }

    public int getLongestStreak() { return longestStreak; }
    public void setLongestStreak(int longestStreak) { this.longestStreak = longestStreak; }

    public Map<String, Long> getCategoryDistribution() { return categoryDistribution; }
    public void setCategoryDistribution(Map<String, Long> categoryDistribution) { this.categoryDistribution = categoryDistribution; }

    public Map<String, Long> getDifficultyDistribution() { return difficultyDistribution; }
    public void setDifficultyDistribution(Map<String, Long> difficultyDistribution) { this.difficultyDistribution = difficultyDistribution; }

    public Map<String, Long> getTopicDistribution() { return topicDistribution; }
    public void setTopicDistribution(Map<String, Long> topicDistribution) { this.topicDistribution = topicDistribution; }

    public Map<String, Long> getPlatformDistribution() { return platformDistribution; }
    public void setPlatformDistribution(Map<String, Long> platformDistribution) { this.platformDistribution = platformDistribution; }

    public Map<String, Long> getLanguageDistribution() { return languageDistribution; }
    public void setLanguageDistribution(Map<String, Long> languageDistribution) { this.languageDistribution = languageDistribution; }

    public List<ActivityPointDTO> getActivity() { return activity; }
    public void setActivity(List<ActivityPointDTO> activity) { this.activity = activity; }
}
