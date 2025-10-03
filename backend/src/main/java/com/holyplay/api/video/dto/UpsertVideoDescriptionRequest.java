package com.holyplay.api.video.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UpsertVideoDescriptionRequest {

    @NotBlank
    @Size(max = 10000)
    private String description;

    public UpsertVideoDescriptionRequest() {}

    public UpsertVideoDescriptionRequest(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
