package com.holyplay.api.home.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public class HomeConfigurationRequest {
    
    @NotBlank(message = "ID da seção é obrigatório")
    @Size(max = 50, message = "ID da seção deve ter no máximo 50 caracteres")
    private String sectionId;
    
    @NotBlank(message = "Nome da seção é obrigatório")
    @Size(max = 100, message = "Nome da seção deve ter no máximo 100 caracteres")
    private String sectionName;
    
    @NotNull(message = "Lista de vídeos é obrigatória")
    @Size(max = 10, message = "Máximo de 10 vídeos por seção")
    private List<String> videoIds;
    
    @NotNull(message = "Número máximo de vídeos é obrigatório")
    private Integer maxVideos;
    
    // Constructors
    public HomeConfigurationRequest() {}
    
    public HomeConfigurationRequest(String sectionId, String sectionName, List<String> videoIds, Integer maxVideos) {
        this.sectionId = sectionId;
        this.sectionName = sectionName;
        this.videoIds = videoIds;
        this.maxVideos = maxVideos;
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
}
