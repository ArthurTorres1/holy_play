package com.holyplay.domain.video;

import java.time.LocalDateTime;

public class VideoCategory {
    private Long id;
    private String name;
    private String slug;
    private LocalDateTime createdAt;

    public VideoCategory(Long id, String name, String slug, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getSlug() { return slug; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
