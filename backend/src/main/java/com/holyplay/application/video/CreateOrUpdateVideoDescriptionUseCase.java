package com.holyplay.application.video;

import com.holyplay.domain.video.VideoDescription;
import com.holyplay.domain.video.VideoDescriptionRepository;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CreateOrUpdateVideoDescriptionUseCase {

    private final VideoDescriptionRepository repository;

    public CreateOrUpdateVideoDescriptionUseCase(VideoDescriptionRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public VideoDescription execute(
            @NotBlank @Size(max = 128) String videoId,
            @NotBlank @Size(max = 10000) String description
    ) {
        return repository.upsert(videoId, description);
    }
}
