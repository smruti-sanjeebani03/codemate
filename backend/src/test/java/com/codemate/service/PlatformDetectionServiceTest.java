package com.codemate.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import static org.junit.jupiter.api.Assertions.*;

class PlatformDetectionServiceTest {

    private PlatformDetectionService platformDetectionService;

    @BeforeEach
    void setUp() {
        platformDetectionService = new PlatformDetectionService();
    }

    @ParameterizedTest(name = "Detect platform for {0} should be {1}")
    @CsvSource({
            "https://leetcode.com/problems/two-sum/, LeetCode",
            "https://www.leetcode.com/problems/3sum/, LeetCode",
            "https://leetcode.com/problems/trapping-rain-water/?source=daily, LeetCode",
            "https://leetcode.cn/problems/two-sum/, LeetCode",
            "https://www.geeksforgeeks.org/problems/subarray-with-given-sum/1, GeeksforGeeks",
            "https://practice.geeksforgeeks.org/problems/find-missing-and-repeating, GeeksforGeeks",
            "https://www.codechef.com/problems/FLOW001, CodeChef",
            "https://codechef.com/practice/problems/START123, CodeChef",
            "https://codeforces.com/problemset/problem/1/A, Codeforces",
            "https://codeforces.net/contest/1500/problem/B, Codeforces",
            "https://www.hackerrank.com/challenges/simple-array-sum/problem, HackerRank",
            "https://www.codingninjas.com/studio/problems/ninja-and-his-friends_3125885, Coding Ninjas",
            "https://www.naukri.com/code360/problems/two-sum, Coding Ninjas",
            "https://atcoder.jp/contests/abc300/tasks/abc300_a, AtCoder",
            "https://www.spoj.com/problems/PRIME1/, SPOJ",
            "https://www.interviewbit.com/problems/wave-array/, InterviewBit",
            "https://www.hackerearth.com/practice/basic-programming/input-output/, HackerEarth",
            "https://projecteuler.net/problem=1, Project Euler",
            "https://neetcode.io/problems/contains-duplicate, NeetCode"
    })
    @DisplayName("Should accurately detect recognized coding platforms from various URLs")
    void testRecognizedPlatforms(String url, String expectedPlatform) {
        String detected = platformDetectionService.detectPlatform(url);
        assertEquals(expectedPlatform, detected);
        assertTrue(platformDetectionService.isRecognizedPlatform(url));
    }

    @Test
    @DisplayName("Should handle unknown and custom domain URLs gracefully")
    void testUnknownDomain() {
        String url = "https://custom-judge.dev/problem/42";
        String detected = platformDetectionService.detectPlatform(url);
        assertEquals("Custom (custom-judge.dev)", detected);
        assertFalse(platformDetectionService.isRecognizedPlatform(url));
    }

    @Test
    @DisplayName("Should handle null, blank, and malformed URLs without throwing exceptions")
    void testEdgeCases() {
        assertEquals("Other", platformDetectionService.detectPlatform(null));
        assertEquals("Other", platformDetectionService.detectPlatform(""));
        assertEquals("Other", platformDetectionService.detectPlatform("   "));
        assertEquals(
                "Custom (not-a-valid-domain)",
                platformDetectionService.detectPlatform("not-a-valid-domain"));
    }

    @Test
    @DisplayName("Should extract clean host without www or protocol")
    void testExtractHost() {
        assertEquals("leetcode.com",
                platformDetectionService.extractHost("https://www.leetcode.com/problems/two-sum/"));
        assertEquals("codeforces.com",
                platformDetectionService.extractHost("http://codeforces.com/problemset/problem/1/A"));
        assertEquals("hackerrank.com", platformDetectionService.extractHost("www.hackerrank.com/challenges/test"));
    }
}
