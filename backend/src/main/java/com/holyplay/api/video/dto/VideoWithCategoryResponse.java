package com.holyplay.api.video.dto;

public class VideoWithCategoryResponse {
    private String videoId;
    private String title;
    private String description;
    private Long categoryId;
    private String categoryName;
    private String categorySlug;

    public VideoWithCategoryResponse(String videoId, String title, String description, 
                                   Long categoryId, String categoryName, String categorySlug) {
        this.videoId = videoId;
        this.title = title;
        this.description = description;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.categorySlug = categorySlug;
    }

    public String getVideoId() { return videoId; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public Long getCategoryId() { return categoryId; }
    public String getCategoryName() { return categoryName; }
    public String getCategorySlug() { return categorySlug; }
}
