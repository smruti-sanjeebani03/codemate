package com.codemate.dto;

/**
 * Activity count data point for a specific calendar date (YYYY-MM-DD).
 */
public class ActivityPointDTO {
    private String date;
    private int count;

    public ActivityPointDTO() {}

    public ActivityPointDTO(String date, int count) {
        this.date = date;
        this.count = count;
    }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public int getCount() { return count; }
    public void setCount(int count) { this.count = count; }
}
