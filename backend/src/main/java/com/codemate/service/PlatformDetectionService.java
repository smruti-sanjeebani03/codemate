package com.codemate.service;

import org.springframework.stereotype.Service;

import java.net.URI;
import java.util.Locale;

/**
 * Service dedicated to extracting and detecting coding platform names from problem URLs.
 * 
 * Rules:
 * - Does NOT perform web scraping or outbound network requests.
 * - Extracts and normalizes domain names from URLs.
 * - Recognizes major competitive programming & coding platforms.
 * - Gracefully handles unknown domains, query parameters, fragments, www prefixes, and malformed URLs.
 */
@Service
public class PlatformDetectionService {

    public enum Platform {
        LEETCODE("LeetCode"),
        GEEKSFORGEEKS("GeeksforGeeks"),
        CODECHEF("CodeChef"),
        CODEFORCES("Codeforces"),
        HACKERRANK("HackerRank"),
        CODING_NINJAS("Coding Ninjas"),
        ATCODER("AtCoder"),
        SPOJ("SPOJ"),
        INTERVIEWBIT("InterviewBit"),
        HACKEREARTH("HackerEarth"),
        PROJECT_EULER("Project Euler"),
        NEETCODE("NeetCode"),
        TOPCODER("TopCoder"),
        KATTIS("Kattis"),
        OTHER("Other");

        private final String displayName;

        Platform(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    /**
     * Detect platform name from the given URL string.
     *
     * @param url The problem URL (e.g., "https://leetcode.com/problems/two-sum/")
     * @return Display name of the detected platform (e.g., "LeetCode") or "Other" / domain name.
     */
    public String detectPlatform(String url) {
        if (url == null || url.trim().isEmpty()) {
            return Platform.OTHER.getDisplayName();
        }

        String host = extractHost(url.trim());
        if (host == null || host.isEmpty()) {
            return Platform.OTHER.getDisplayName();
        }

        String lowerHost = host.toLowerCase(Locale.ROOT);

        if (lowerHost.contains("leetcode.com") || lowerHost.contains("leetcode.cn")) {
            return Platform.LEETCODE.getDisplayName();
        }
        if (lowerHost.contains("geeksforgeeks.org") || lowerHost.contains("gfg.org")) {
            return Platform.GEEKSFORGEEKS.getDisplayName();
        }
        if (lowerHost.contains("codechef.com")) {
            return Platform.CODECHEF.getDisplayName();
        }
        if (lowerHost.contains("codeforces.com") || lowerHost.contains("codeforces.net")) {
            return Platform.CODEFORCES.getDisplayName();
        }
        if (lowerHost.contains("hackerrank.com")) {
            return Platform.HACKERRANK.getDisplayName();
        }
        if (lowerHost.contains("codingninjas.com") || lowerHost.contains("naukri.com") || lowerHost.contains("code360")) {
            return Platform.CODING_NINJAS.getDisplayName();
        }
        if (lowerHost.contains("atcoder.jp")) {
            return Platform.ATCODER.getDisplayName();
        }
        if (lowerHost.contains("spoj.com")) {
            return Platform.SPOJ.getDisplayName();
        }
        if (lowerHost.contains("interviewbit.com")) {
            return Platform.INTERVIEWBIT.getDisplayName();
        }
        if (lowerHost.contains("hackerearth.com")) {
            return Platform.HACKEREARTH.getDisplayName();
        }
        if (lowerHost.contains("projecteuler.net")) {
            return Platform.PROJECT_EULER.getDisplayName();
        }
        if (lowerHost.contains("neetcode.io")) {
            return Platform.NEETCODE.getDisplayName();
        }
        if (lowerHost.contains("topcoder.com")) {
            return Platform.TOPCODER.getDisplayName();
        }
        if (lowerHost.contains("open.kattis.com") || lowerHost.contains("kattis.com")) {
            return Platform.KATTIS.getDisplayName();
        }

        // Return capitalized domain or "Other"
        return formatUnknownHost(host);
    }

    /**
     * Check if a URL belongs to a recognized competitive platform.
     */
    public boolean isRecognizedPlatform(String url) {
        String platform = detectPlatform(url);
        return !Platform.OTHER.getDisplayName().equalsIgnoreCase(platform) 
                && !platform.startsWith("Custom")
                && !platform.contains(".");
    }

    /**
     * Safely extract the host name from a URL, supporting protocol-less strings.
     */
    public String extractHost(String rawUrl) {
        if (rawUrl == null) return null;
        String cleanUrl = rawUrl.trim();

        if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
            cleanUrl = "https://" + cleanUrl;
        }

        try {
            URI uri = URI.create(cleanUrl);
            String host = uri.getHost();
            if (host != null) {
                // Strip leading 'www.'
                if (host.startsWith("www.")) {
                    host = host.substring(4);
                }
                return host;
            }
        } catch (Exception ignored) {
            // Fallback string extraction for slightly non-conformant URIs
            try {
                int start = cleanUrl.indexOf("://") + 3;
                int end = cleanUrl.indexOf('/', start);
                if (end == -1) end = cleanUrl.indexOf('?', start);
                if (end == -1) end = cleanUrl.indexOf('#', start);
                if (end == -1) end = cleanUrl.length();

                String host = cleanUrl.substring(start, end);
                if (host.startsWith("www.")) {
                    host = host.substring(4);
                }
                return host;
            } catch (Exception e) {
                return null;
            }
        }
        return null;
    }

    private String formatUnknownHost(String host) {
        if (host == null || host.isEmpty()) {
            return Platform.OTHER.getDisplayName();
        }
        // If it's a domain like "customjudge.org", return "Custom (customjudge.org)"
        return "Custom (" + host + ")";
    }
}
