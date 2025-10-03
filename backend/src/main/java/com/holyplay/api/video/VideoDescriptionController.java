package com.holyplay.api.video;

import com.holyplay.api.video.dto.UpsertVideoDescriptionRequest;
import com.holyplay.api.video.dto.VideoDescriptionResponse;
import com.holyplay.application.video.CreateOrUpdateVideoDescriptionUseCase;
import com.holyplay.application.video.GetVideoDescriptionUseCase;
import com.holyplay.domain.video.VideoDescription;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/videos")
public class VideoDescriptionController {

    private final CreateOrUpdateVideoDescriptionUseCase createOrUpdate;
    private final GetVideoDescriptionUseCase getByVideoId;

    public VideoDescriptionController(CreateOrUpdateVideoDescriptionUseCase createOrUpdate,
                                      GetVideoDescriptionUseCase getByVideoId) {
        this.createOrUpdate = createOrUpdate;
        this.getByVideoId = getByVideoId;
    }

    @PostMapping("/{videoId}/description")
    public ResponseEntity<VideoDescriptionResponse> upsert(
            @PathVariable @NotBlank @Size(max = 128) String videoId,
            @Valid @RequestBody UpsertVideoDescriptionRequest request
    ) {
        VideoDescription saved = createOrUpdate.execute(videoId, request.getDescription());
        return ResponseEntity.ok(toResponse(saved));
    }

    @GetMapping("/{videoId}/description")
    public ResponseEntity<VideoDescriptionResponse> get(
            @PathVariable @NotBlank @Size(max = 128) String videoId
    ) {
        Optional<VideoDescription> opt = getByVideoId.execute(videoId);
        return opt.map(v -> ResponseEntity.ok(toResponse(v)))
                  .orElseGet(() -> ResponseEntity.notFound().build());
    }

    private static VideoDescriptionResponse toResponse(VideoDescription vd) {
        return new VideoDescriptionResponse(
                vd.getVideoId(),
                vd.getDescription(),
                vd.getCreatedAt(),
                vd.getUpdatedAt()
        );
    }
}
