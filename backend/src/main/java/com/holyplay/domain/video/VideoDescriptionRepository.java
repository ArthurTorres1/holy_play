package com.holyplay.domain.video;

import java.util.Optional;

/**
 * Porta de repositório do domínio para VideoDescription (DDD - Domain -> Port).
 */
public interface VideoDescriptionRepository {
    Optional<VideoDescription> findByVideoId(String videoId);
    VideoDescription upsert(String videoId, String description);
}
