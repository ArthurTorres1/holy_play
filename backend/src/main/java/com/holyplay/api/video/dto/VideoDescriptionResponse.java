package com.holyplay.api.video.dto;

import java.time.LocalDateTime;

public class VideoDescriptionResponse {
    private String videoId;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public VideoDescriptionResponse() {}

    public VideoDescriptionResponse(String videoId, String description, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.videoId = videoId;
        this.description = description;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public String getVideoId() { return videoId; }
    public String getDescription() { return description; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public void setVideoId(String videoId) { this.videoId = videoId; }
    public void setDescription(String description) { this.description = description; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
