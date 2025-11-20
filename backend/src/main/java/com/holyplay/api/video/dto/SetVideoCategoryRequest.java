package com.holyplay.api.video.dto;

import jakarta.validation.constraints.NotNull;

public class SetVideoCategoryRequest {

    @NotNull(message = "categoryId é obrigatório")
    private Long categoryId;

    public SetVideoCategoryRequest() {}

    public SetVideoCategoryRequest(Long categoryId) {
        this.categoryId = categoryId;
    }

    public Long getCategoryId() { return categoryId; }

    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
}
