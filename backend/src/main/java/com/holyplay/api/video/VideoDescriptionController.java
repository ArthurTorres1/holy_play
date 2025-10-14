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
        try {
            System.out.println("🔍 DEBUG: Buscando descrição para videoId: " + videoId);
            System.out.println("🔍 DEBUG: Tamanho do videoId: " + videoId.length());
            
            Optional<VideoDescription> opt = getByVideoId.execute(videoId);
            System.out.println("🔍 DEBUG: Resultado encontrado: " + opt.isPresent());
            
            return opt.map(v -> {
                        System.out.println("🔍 DEBUG: Retornando descrição: " + v.getDescription());
                        return ResponseEntity.ok()
                                .header("Cache-Control", "no-cache, no-store, must-revalidate")
                                .header("Pragma", "no-cache")
                                .header("Expires", "0")
                                .body(toResponse(v));
                    })
                    .orElseGet(() -> {
                        System.out.println("🔍 DEBUG: Nenhuma descrição encontrada para videoId: " + videoId);
                        return ResponseEntity.notFound().build();
                    });
        } catch (Exception e) {
            System.err.println("❌ ERRO ao buscar descrição: " + e.getMessage());
            e.printStackTrace();
            throw e; // Re-throw para ver o stack trace completo
        }
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
