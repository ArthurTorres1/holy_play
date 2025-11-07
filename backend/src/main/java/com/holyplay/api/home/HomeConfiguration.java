package com.holyplay.api.home;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "home_configurations")
public class HomeConfiguration {
    
    @Id
    @Column(name = "section_id")
    private String sectionId;
    
    @Column(name = "section_name", nullable = false)
    private String sectionName;
    
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
        name = "home_section_videos", 
        joinColumns = @JoinColumn(name = "section_id")
    )
    @Column(name = "video_id")
    @OrderColumn(name = "video_order")
    private List<String> videoIds;
    
    @Column(name = "max_videos")
    private Integer maxVideos;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Constructors
    public HomeConfiguration() {}
    
    public HomeConfiguration(String sectionId, String sectionName, List<String> videoIds, Integer maxVideos) {
        this.sectionId = sectionId;
        this.sectionName = sectionName;
        this.videoIds = videoIds;
        this.maxVideos = maxVideos;
        this.updatedAt = LocalDateTime.now();
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
        this.updatedAt = LocalDateTime.now();
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
