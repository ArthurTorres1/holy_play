package com.holyplay.api.home.dto;

import java.util.List;

public class HomePageResponse {
    
    private List<HomeSectionResponse> sections;
    
    public HomePageResponse() {}
    
    public HomePageResponse(List<HomeSectionResponse> sections) {
        this.sections = sections;
    }
    
    public List<HomeSectionResponse> getSections() {
        return sections;
    }
    
    public void setSections(List<HomeSectionResponse> sections) {
        this.sections = sections;
    }
    
    public static class HomeSectionResponse {
        private String sectionId;
        private String sectionName;
        private List<HomeVideoResponse> videos;
        
        public HomeSectionResponse() {}
        
        public HomeSectionResponse(String sectionId, String sectionName, List<HomeVideoResponse> videos) {
            this.sectionId = sectionId;
            this.sectionName = sectionName;
            this.videos = videos;
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
        
        public List<HomeVideoResponse> getVideos() {
            return videos;
        }
        
        public void setVideos(List<HomeVideoResponse> videos) {
            this.videos = videos;
        }
    }
    
    public static class HomeVideoResponse {
        private String videoId;
        private String title;
        private String description;
        private String thumbnailUrl;
        private Integer duration;
        private Long views;
        private String category;
        private boolean isNew;
        private boolean isFeatured;
        
        public HomeVideoResponse() {}
        
        public HomeVideoResponse(String videoId, String title, String description, String thumbnailUrl, 
                               Integer duration, Long views, String category, boolean isNew, boolean isFeatured) {
            this.videoId = videoId;
            this.title = title;
            this.description = description;
            this.thumbnailUrl = thumbnailUrl;
            this.duration = duration;
            this.views = views;
            this.category = category;
            this.isNew = isNew;
            this.isFeatured = isFeatured;
        }
        
        // Getters and Setters
        public String getVideoId() {
            return videoId;
        }
        
        public void setVideoId(String videoId) {
            this.videoId = videoId;
        }
        
        public String getTitle() {
            return title;
        }
        
        public void setTitle(String title) {
            this.title = title;
        }
        
        public String getDescription() {
            return description;
        }
        
        public void setDescription(String description) {
            this.description = description;
        }
        
        public String getThumbnailUrl() {
            return thumbnailUrl;
        }
        
        public void setThumbnailUrl(String thumbnailUrl) {
            this.thumbnailUrl = thumbnailUrl;
        }
        
        public Integer getDuration() {
            return duration;
        }
        
        public void setDuration(Integer duration) {
            this.duration = duration;
        }
        
        public Long getViews() {
            return views;
        }
        
        public void setViews(Long views) {
            this.views = views;
        }
        
        public String getCategory() {
            return category;
        }
        
        public void setCategory(String category) {
            this.category = category;
        }
        
        public boolean isNew() {
            return isNew;
        }
        
        public void setNew(boolean isNew) {
            this.isNew = isNew;
        }
        
        public boolean isFeatured() {
            return isFeatured;
        }
        
        public void setFeatured(boolean isFeatured) {
            this.isFeatured = isFeatured;
        }
    }
}
