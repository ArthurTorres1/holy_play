package com.holyplay.domain.video;

import java.time.LocalDateTime;
import java.util.Objects;

/**
 * Entidade de domínio para descrição de vídeo.
 */
public class VideoDescription {
    private Long id;
    private String videoId;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public VideoDescription(Long id, String videoId, String description, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.videoId = videoId;
        this.description = description;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static VideoDescription newForCreate(String videoId, String description) {
        return new VideoDescription(null, videoId, description, null, null);
    }

    public Long getId() { return id; }
    public String getVideoId() { return videoId; }
    public String getDescription() { return description; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public VideoDescription withId(Long id) { this.id = id; return this; }
    public VideoDescription withTimestamps(LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        return this;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        VideoDescription that = (VideoDescription) o;
        return Objects.equals(videoId, that.videoId);
    }

    @Override
    public int hashCode() { return Objects.hash(videoId); }
}
