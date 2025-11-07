package com.holyplay.api.home;

import com.holyplay.api.home.dto.HomeConfigurationRequest;
import com.holyplay.api.home.dto.HomeConfigurationResponse;
import com.holyplay.api.home.dto.HomePageResponse;
import com.holyplay.infrastructure.bunny.BunnyStreamService;
import com.holyplay.domain.video.VideoDescription;
import com.holyplay.domain.video.VideoDescriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class HomeConfigurationService {
    
    @Autowired
    private HomeConfigurationRepository repository;
    
    @Autowired
    private BunnyStreamService bunnyStreamService;
    
    @Autowired
    private VideoDescriptionRepository videoDescriptionRepository;
    
    /**
     * Busca todas as configurações das seções da home
     */
    public List<HomeConfigurationResponse> getAllConfigurations() {
        return repository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Busca configuração de uma seção específica
     */
    public Optional<HomeConfigurationResponse> getConfiguration(String sectionId) {
        return repository.findById(sectionId)
                .map(this::toResponse);
    }
    
    /**
     * Salva ou atualiza configuração de uma seção
     */
    @Transactional
    public HomeConfigurationResponse saveConfiguration(HomeConfigurationRequest request) {
        HomeConfiguration config = repository.findById(request.getSectionId())
                .orElse(new HomeConfiguration());
        
        config.setSectionId(request.getSectionId());
        config.setSectionName(request.getSectionName());
        config.setVideoIds(request.getVideoIds());
        config.setMaxVideos(request.getMaxVideos());
        config.setUpdatedAt(LocalDateTime.now());
        
        HomeConfiguration saved = repository.save(config);
        return toResponse(saved);
    }
    
    /**
     * Remove configuração de uma seção
     */
    @Transactional
    public void deleteConfiguration(String sectionId) {
        repository.deleteById(sectionId);
    }
    
    /**
     * Inicializa configurações padrão se não existirem
     */
    @Transactional
    public void initializeDefaultConfigurations() {
        if (repository.count() == 0) {
            // Criar configurações padrão vazias
            List<HomeConfiguration> defaultConfigs = List.of(
                new HomeConfiguration("hero", "Vídeo Principal (Hero)", List.of(), 1),
                new HomeConfiguration("new", "Novos Lançamentos", List.of(), 6),
                new HomeConfiguration("popular", "Populares", List.of(), 6),
                new HomeConfiguration("featured", "Em Destaque", List.of(), 6)
            );
            
            repository.saveAll(defaultConfigs);
        }
    }
    
    /**
     * Busca dados completos para a página inicial (público)
     * Integra com API do Bunny Stream para buscar dados reais dos vídeos
     */
    public HomePageResponse getHomePageData() {
        List<HomeConfiguration> configurations = repository.findAll();
        
        List<HomePageResponse.HomeSectionResponse> sections = configurations.stream()
            .map(config -> {
                System.out.println("🏠 Processando seção: " + config.getSectionId() + " com " + config.getVideoIds().size() + " vídeos");
                
                // Para cada videoId, buscar dados reais na API do Bunny Stream
                List<HomePageResponse.HomeVideoResponse> videos = config.getVideoIds().stream()
                    .map(videoId -> {
                        System.out.println("🎬 Buscando dados do vídeo: " + videoId);
                        
                        Optional<BunnyStreamService.BunnyVideo> bunnyVideo = bunnyStreamService.getVideoById(videoId);
                        
                        if (bunnyVideo.isPresent()) {
                            BunnyStreamService.BunnyVideo video = bunnyVideo.get();
                            
                            // Buscar descrição local se não tiver da Bunny
                            String description = video.getDescription();
                            if (description == null || description.isEmpty()) {
                                Optional<VideoDescription> localDesc = videoDescriptionRepository.findByVideoId(videoId);
                                description = localDesc.map(VideoDescription::getDescription).orElse("");
                            }
                            
                            return new HomePageResponse.HomeVideoResponse(
                                videoId,
                                video.getTitle() != null ? video.getTitle() : "Vídeo sem título",
                                description,
                                video.getThumbnailUrl() != null ? video.getThumbnailUrl() : "/api/placeholder/400/225",
                                video.getLength() != null ? video.getLength() : 0,
                                video.getViews() != null ? video.getViews() : 0L,
                                video.getCategory() != null ? video.getCategory() : "Geral",
                                isNewVideo(video.getDateUploaded()),
                                config.getSectionId().equals("featured")
                            );
                        } else {
                            System.err.println("❌ Não foi possível buscar dados do vídeo: " + videoId);
                            
                            // Buscar descrição local como fallback
                            Optional<VideoDescription> localDesc = videoDescriptionRepository.findByVideoId(videoId);
                            String localDescription = localDesc.map(VideoDescription::getDescription).orElse("Descrição não disponível");
                            
                            return new HomePageResponse.HomeVideoResponse(
                                videoId,
                                "Vídeo " + videoId.substring(0, 8),
                                localDescription,
                                "/api/placeholder/400/225",
                                0,
                                0L,
                                "Geral",
                                false,
                                false
                            );
                        }
                    })
                    .collect(Collectors.toList());
                
                return new HomePageResponse.HomeSectionResponse(
                    config.getSectionId(),
                    config.getSectionName(),
                    videos
                );
            })
            .collect(Collectors.toList());
        
        return new HomePageResponse(sections);
    }

    /**
     * Verifica se um vídeo é considerado "novo" (últimos 30 dias)
     */
    private boolean isNewVideo(String dateUploaded) {
        if (dateUploaded == null || dateUploaded.isEmpty()) {
            return false;
        }
        
        try {
            // Implementar lógica de data se necessário
            // Por enquanto, retorna false
            return false;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Converte entidade para response
     */
    private HomeConfigurationResponse toResponse(HomeConfiguration config) {
        return new HomeConfigurationResponse(
            config.getSectionId(),
            config.getSectionName(),
            config.getVideoIds(),
            config.getMaxVideos(),
            config.getUpdatedAt()
        );
    }
}
