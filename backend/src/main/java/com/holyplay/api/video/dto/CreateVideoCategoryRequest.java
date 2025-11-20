package com.holyplay.api.video.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateVideoCategoryRequest {

    @NotBlank
    @Size(max = 255)
    private String name;

    public CreateVideoCategoryRequest() {
    }

    public CreateVideoCategoryRequest(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
