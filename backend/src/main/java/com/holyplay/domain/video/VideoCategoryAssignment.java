package com.holyplay.domain.video;

import java.time.LocalDateTime;

public class VideoCategoryAssignment {
    private String videoId;
    private Long categoryId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public VideoCategoryAssignment(String videoId, Long categoryId, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.videoId = videoId;
        this.categoryId = categoryId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public String getVideoId() { return videoId; }
    public Long getCategoryId() { return categoryId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
