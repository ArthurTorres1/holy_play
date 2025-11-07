package com.holyplay.api.home.dto;

import java.time.LocalDateTime;
import java.util.List;

public class HomeConfigurationResponse {
    
    private String sectionId;
    private String sectionName;
    private List<String> videoIds;
    private Integer maxVideos;
    private LocalDateTime updatedAt;
    
    // Constructors
    public HomeConfigurationResponse() {}
    
    public HomeConfigurationResponse(String sectionId, String sectionName, List<String> videoIds, Integer maxVideos, LocalDateTime updatedAt) {
        this.sectionId = sectionId;
        this.sectionName = sectionName;
        this.videoIds = videoIds;
        this.maxVideos = maxVideos;
        this.updatedAt = updatedAt;
    }
    
    // Getters and Setters
    public String getSectionId() {
        return sectionId;
    }
    
    public void setSectionId(String sectionId) {
        this.sectionId = sectionId;
    }
    
    public String getSectionName() {
        return sectionName;
    }
    
    public void setSectionName(String sectionName) {
        this.sectionName = sectionName;
    }
    
    public List<String> getVideoIds() {
        return videoIds;
    }
    
    public void setVideoIds(List<String> videoIds) {
        this.videoIds = videoIds;
    }
    
    public Integer getMaxVideos() {
        return maxVideos;
    }
    
    public void setMaxVideos(Integer maxVideos) {
        this.maxVideos = maxVideos;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
