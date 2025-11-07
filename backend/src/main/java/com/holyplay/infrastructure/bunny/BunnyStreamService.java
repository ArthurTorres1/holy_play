package com.holyplay.infrastructure.bunny;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;

import java.util.Collections;
import java.util.Optional;

@Service
public class BunnyStreamService {

    private final RestTemplate restTemplate;
    private final String apiKey;
    private final String libraryId;
    private final String cdnHost;

    public BunnyStreamService(
            @Value("${bunny.api.key:}") String apiKey,
            @Value("${bunny.library.id:}") String libraryId,
            @Value("${bunny.cdn.host:}") String cdnHost
    ) {
        this.restTemplate = new RestTemplate();
        this.apiKey = apiKey;
        this.libraryId = libraryId;
        this.cdnHost = cdnHost;
    }

    /**
     * Busca informações de um vídeo específico na Bunny Stream API
     */
    public Optional<BunnyVideo> getVideoById(String videoId) {
        if (apiKey == null || apiKey.isEmpty() || libraryId == null || libraryId.isEmpty()) {
            System.out.println("⚠️ Bunny Stream API não configurada - usando dados mock");
            return Optional.of(createMockVideo(videoId));
        }

        try {
            String url = "https://video.bunnycdn.com/library/" + libraryId + "/videos/" + videoId;
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("AccessKey", apiKey);
            headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<BunnyVideo> response = restTemplate.exchange(
                url, 
                HttpMethod.GET, 
                entity, 
                BunnyVideo.class
            );
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                BunnyVideo video = response.getBody();
                // Adicionar URL da thumbnail se não estiver presente
                if (video.thumbnailFileName != null && !video.thumbnailFileName.isEmpty()) {
                    video.thumbnailUrl = generateThumbnailUrl(videoId, video.thumbnailFileName);
                }
                return Optional.of(video);
            }
            
        } catch (HttpClientErrorException e) {
            System.err.println("❌ Erro ao buscar vídeo " + videoId + " na Bunny Stream: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("❌ Erro inesperado ao buscar vídeo " + videoId + ": " + e.getMessage());
        }
        
        // Retorna dados mock em caso de erro
        return Optional.of(createMockVideo(videoId));
    }

    /**
     * Gera URL da thumbnail baseado no videoId e nome do arquivo
     */
    private String generateThumbnailUrl(String videoId, String thumbnailFileName) {
        if (cdnHost != null && !cdnHost.isEmpty()) {
            return "https://" + cdnHost + "/" + videoId + "/" + thumbnailFileName;
        }
        // URL padrão se CDN host não estiver configurado
        return "https://vz-" + libraryId + ".b-cdn.net/" + videoId + "/" + thumbnailFileName;
    }

    /**
     * Cria um vídeo mock para casos onde a API não está disponível
     */
    private BunnyVideo createMockVideo(String videoId) {
        BunnyVideo mockVideo = new BunnyVideo();
        mockVideo.videoId = videoId;
        mockVideo.title = "Vídeo " + videoId.substring(0, 8);
        mockVideo.description = "Descrição do vídeo";
        mockVideo.length = 300; // 5 minutos
        mockVideo.views = 1000L;
        mockVideo.status = 4; // Processado
        mockVideo.thumbnailFileName = "thumbnail.jpg";
        mockVideo.thumbnailUrl = "/api/placeholder/400/225"; // Placeholder
        return mockVideo;
    }

    /**
     * Classe para mapear a resposta da API do Bunny Stream
     */
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class BunnyVideo {
        @JsonProperty("guid")
        public String videoId;
        
        public String title;
        public String description;
        public Integer length; // duração em segundos
        public Long views;
        public Integer status;
        
        @JsonProperty("thumbnailFileName")
        public String thumbnailFileName;
        
        // Campo calculado
        public String thumbnailUrl;
        
        @JsonProperty("dateUploaded")
        public String dateUploaded;
        
        @JsonProperty("category")
        public String category;

        // Getters e Setters
        public String getVideoId() { return videoId; }
        public void setVideoId(String videoId) { this.videoId = videoId; }
        
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        
        public Integer getLength() { return length; }
        public void setLength(Integer length) { this.length = length; }
        
        public Long getViews() { return views; }
        public void setViews(Long views) { this.views = views; }
        
        public Integer getStatus() { return status; }
        public void setStatus(Integer status) { this.status = status; }
        
        public String getThumbnailFileName() { return thumbnailFileName; }
        public void setThumbnailFileName(String thumbnailFileName) { this.thumbnailFileName = thumbnailFileName; }
        
        public String getThumbnailUrl() { return thumbnailUrl; }
        public void setThumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; }
        
        public String getDateUploaded() { return dateUploaded; }
        public void setDateUploaded(String dateUploaded) { this.dateUploaded = dateUploaded; }
        
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
    }
}
