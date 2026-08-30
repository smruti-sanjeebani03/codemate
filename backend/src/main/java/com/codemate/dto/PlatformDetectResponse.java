package com.codemate.dto;

public class PlatformDetectResponse {

    private String url;
    private String platform;
    private String domain;
    private boolean recognized;

    public PlatformDetectResponse() {
    }

    public PlatformDetectResponse(String url, String platform, String domain, boolean recognized) {
        this.url = url;
        this.platform = platform;
        this.domain = domain;
        this.recognized = recognized;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getPlatform() {
        return platform;
    }

    public void setPlatform(String platform) {
        this.platform = platform;
    }

    public String getDomain() {
        return domain;
    }

    public void setDomain(String domain) {
        this.domain = domain;
    }

    public boolean isRecognized() {
        return recognized;
    }

    public void setRecognized(boolean recognized) {
        this.recognized = recognized;
    }
}
