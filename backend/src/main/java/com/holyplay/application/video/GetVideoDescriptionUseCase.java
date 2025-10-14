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
        try {
            System.out.println("🔍 USE CASE: Executando busca para videoId: " + videoId);
            Optional<VideoDescription> result = repository.findByVideoId(videoId);
            System.out.println("🔍 USE CASE: Resultado do repository: " + result.isPresent());
            return result;
        } catch (Exception e) {
            System.err.println("❌ ERRO no USE CASE: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}
