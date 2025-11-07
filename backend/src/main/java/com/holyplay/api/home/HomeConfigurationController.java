package com.holyplay.api.home;

import com.holyplay.api.home.dto.HomeConfigurationRequest;
import com.holyplay.api.home.dto.HomeConfigurationResponse;
import com.holyplay.api.home.dto.HomePageResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/home/configurations")
@CrossOrigin(origins = "*")
public class HomeConfigurationController {
    
    @Autowired
    private HomeConfigurationService service;
    
    /**
     * Endpoint público para a página inicial - retorna dados completos dos vídeos
     */
    @GetMapping("/home-page")
    public ResponseEntity<HomePageResponse> getHomePageData() {
        HomePageResponse homeData = service.getHomePageData();
        return ResponseEntity.ok(homeData);
    }

    /**
     * Busca todas as configurações das seções da home (apenas IDs)
     * Endpoint para administração
     */
    @GetMapping
    public ResponseEntity<List<HomeConfigurationResponse>> getAllConfigurations() {
        List<HomeConfigurationResponse> configurations = service.getAllConfigurations();
        return ResponseEntity.ok(configurations);
    }
    
    /**
     * Busca configuração de uma seção específica
     */
    @GetMapping("/{sectionId}")
    public ResponseEntity<HomeConfigurationResponse> getConfiguration(
            @PathVariable @NotBlank @Size(max = 50) String sectionId) {
        
        Optional<HomeConfigurationResponse> config = service.getConfiguration(sectionId);
        return config.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Salva ou atualiza configuração de uma seção
     * Apenas administradores podem modificar
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<HomeConfigurationResponse> saveConfiguration(
            @Valid @RequestBody HomeConfigurationRequest request) {
        
        HomeConfigurationResponse saved = service.saveConfiguration(request);
        return ResponseEntity.ok(saved);
    }
    
    /**
     * Atualiza configuração de uma seção específica
     * Apenas administradores podem modificar
     */
    @PutMapping("/{sectionId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<HomeConfigurationResponse> updateConfiguration(
            @PathVariable @NotBlank @Size(max = 50) String sectionId,
            @Valid @RequestBody HomeConfigurationRequest request) {
        
        // Garantir que o sectionId do path corresponde ao do body
        request.setSectionId(sectionId);
        
        HomeConfigurationResponse updated = service.saveConfiguration(request);
        return ResponseEntity.ok(updated);
    }
    
    /**
     * Remove configuração de uma seção
     * Apenas administradores podem modificar
     */
    @DeleteMapping("/{sectionId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteConfiguration(
            @PathVariable @NotBlank @Size(max = 50) String sectionId) {
        
        service.deleteConfiguration(sectionId);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Inicializa configurações padrão
     * Apenas administradores podem executar
     */
    @PostMapping("/initialize")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> initializeDefaults() {
        service.initializeDefaultConfigurations();
        return ResponseEntity.ok("Configurações padrão inicializadas com sucesso");
    }
}
