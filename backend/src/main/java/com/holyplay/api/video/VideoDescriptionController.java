package com.holyplay.api.video;

import com.holyplay.api.video.dto.UpsertVideoDescriptionRequest;
import com.holyplay.api.video.dto.VideoDescriptionResponse;
import com.holyplay.api.video.dto.VideoCategoryResponse;
import com.holyplay.api.video.dto.VideoCategoryAssignmentResponse;
import com.holyplay.api.video.dto.SetVideoCategoryRequest;
import com.holyplay.api.video.dto.CreateVideoCategoryRequest;
import com.holyplay.api.video.dto.VideoWithCategoryResponse;
import com.holyplay.application.video.CreateOrUpdateVideoDescriptionUseCase;
import com.holyplay.application.video.GetVideoDescriptionUseCase;
import com.holyplay.domain.video.VideoCategory;
import com.holyplay.domain.video.VideoCategoryAssignment;
import com.holyplay.infrastructure.video.VideoCategoryJdbcRepository;
import com.holyplay.domain.video.VideoDescription;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.text.Normalizer;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/videos")
public class VideoDescriptionController {

    private final CreateOrUpdateVideoDescriptionUseCase createOrUpdate;
    private final GetVideoDescriptionUseCase getByVideoId;
    private final VideoCategoryJdbcRepository categoryRepository;

    public VideoDescriptionController(CreateOrUpdateVideoDescriptionUseCase createOrUpdate,
                                      GetVideoDescriptionUseCase getByVideoId,
                                      VideoCategoryJdbcRepository categoryRepository) {
        this.createOrUpdate = createOrUpdate;
        this.getByVideoId = getByVideoId;
        this.categoryRepository = categoryRepository;
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

    // ========================== CATEGORIAS ==============================

    /**
     * Lista todas as categorias de vídeo disponíveis.
     */
    @GetMapping("/categories")
    public ResponseEntity<java.util.List<VideoCategoryResponse>> listCategories() {
        java.util.List<VideoCategory> categories = categoryRepository.findAllCategories();
        java.util.List<VideoCategoryResponse> response = categories.stream()
                .map(c -> new VideoCategoryResponse(c.getId(), c.getName(), c.getSlug()))
                .toList();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/categories")
    public ResponseEntity<VideoCategory> createCategory(@RequestBody CreateVideoCategoryRequest request) {
        try {
            String name = request.getName();
            if (name == null || name.trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            String slug = slugify(name.trim());
            VideoCategory created = categoryRepository.createCategory(name.trim(), slug);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/videos-with-categories")
    public ResponseEntity<List<VideoWithCategoryResponse>> getVideosWithCategories() {
        try {
            List<VideoCategoryJdbcRepository.VideoWithCategoryInfo> videosWithCategories =
                    categoryRepository.findAllVideosWithCategories();

            List<VideoWithCategoryResponse> response = videosWithCategories.stream()
                    .map(info -> new VideoWithCategoryResponse(
                            info.getVideoId(),
                            null, // título será preenchido pelo frontend via Bunny
                            info.getDescription(),
                            info.getCategoryId(),
                            info.getCategoryName(),
                            info.getCategorySlug()
                    ))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Obtém a categoria atual associada a um vídeo (se existir).
     */
    @GetMapping("/{videoId}/category")
    public ResponseEntity<VideoCategoryAssignmentResponse> getCategoryForVideo(
            @PathVariable @NotBlank @Size(max = 128) String videoId
    ) {
        var assignmentOpt = categoryRepository.findAssignmentByVideoId(videoId);
        if (assignmentOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        VideoCategoryAssignment assignment = assignmentOpt.get();
        var categoryOpt = categoryRepository.findCategoryById(assignment.getCategoryId());
        if (categoryOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        VideoCategory category = categoryOpt.get();
        var response = new VideoCategoryAssignmentResponse(
                assignment.getVideoId(),
                category.getId(),
                category.getName(),
                category.getSlug()
        );

        return ResponseEntity.ok(response);
    }

    /**
     * Define ou altera a categoria de um vídeo específico.
     */
    @PutMapping("/{videoId}/category")
    public ResponseEntity<VideoCategoryAssignmentResponse> setCategoryForVideo(
            @PathVariable @NotBlank @Size(max = 128) String videoId,
            @Valid @RequestBody SetVideoCategoryRequest request
    ) {
        Long categoryId = request.getCategoryId();
        var categoryOpt = categoryRepository.findCategoryById(categoryId);
        if (categoryOpt.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        VideoCategory category = categoryOpt.get();
        VideoCategoryAssignment assignment = categoryRepository.upsertAssignment(videoId, categoryId);

        var response = new VideoCategoryAssignmentResponse(
                assignment.getVideoId(),
                category.getId(),
                category.getName(),
                category.getSlug()
        );

        return ResponseEntity.ok(response);
    }

    private static String slugify(String input) {
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        String slug = normalized
                .toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
        if (slug.isEmpty()) {
            slug = "categoria";
        }
        return slug;
    }
}
