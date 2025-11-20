package com.holyplay.api.video.dto;

public class VideoCategoryResponse {
    private Long id;
    private String name;
    private String slug;

    public VideoCategoryResponse() {}

    public VideoCategoryResponse(Long id, String name, String slug) {
        this.id = id;
        this.name = name;
        this.slug = slug;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getSlug() { return slug; }

    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setSlug(String slug) { this.slug = slug; }
}
