package com.holyplay.application.video;

import com.holyplay.domain.video.VideoDescription;
import com.holyplay.domain.video.VideoDescriptionRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class GetVideoDescriptionUseCase {
    private final VideoDescriptionRepository repository;

    public GetVideoDescriptionUseCase(VideoDescriptionRepository repository) {
        this.repository = repository;
    }

    public Optional<VideoDescription> execute(String videoId) {
        return repository.findByVideoId(videoId);
    }
}
