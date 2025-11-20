package com.holyplay.api.video.dto;

public class VideoCategoryAssignmentResponse {
    private String videoId;
    private Long categoryId;
    private String categoryName;
    private String categorySlug;

    public VideoCategoryAssignmentResponse() {}

    public VideoCategoryAssignmentResponse(String videoId, Long categoryId, String categoryName, String categorySlug) {
        this.videoId = videoId;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.categorySlug = categorySlug;
    }

    public String getVideoId() { return videoId; }
    public Long getCategoryId() { return categoryId; }
    public String getCategoryName() { return categoryName; }
    public String getCategorySlug() { return categorySlug; }

    public void setVideoId(String videoId) { this.videoId = videoId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    public void setCategorySlug(String categorySlug) { this.categorySlug = categorySlug; }
}
