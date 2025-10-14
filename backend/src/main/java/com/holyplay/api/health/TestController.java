package com.holyplay.api.health;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:5173", "https://holyplay.com.br"})
public class TestController {
    
    @GetMapping("/test")
    public Map<String, Object> test() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "OK");
        response.put("message", "Backend funcionando!");
        response.put("timestamp", System.currentTimeMillis());
        return response;
    }
    
    @GetMapping("/test/videos/{videoId}")
    public Map<String, Object> testVideo(@PathVariable String videoId) {
        Map<String, Object> response = new HashMap<>();
        response.put("videoId", videoId);
        response.put("message", "Endpoint de vídeo funcionando!");
        response.put("timestamp", System.currentTimeMillis());
        return response;
    }
    
    @GetMapping("/test/videos/{videoId}/description")
    public Map<String, Object> testDescription(@PathVariable String videoId) {
        Map<String, Object> response = new HashMap<>();
        response.put("videoId", videoId);
        response.put("description", "Descrição de teste para " + videoId);
        response.put("message", "Endpoint de descrição funcionando!");
        response.put("timestamp", System.currentTimeMillis());
        return response;
    }
    
    @GetMapping("/test/database")
    public Map<String, Object> testDatabase() {
        Map<String, Object> response = new HashMap<>();
        try {
            response.put("status", "OK");
            response.put("message", "Teste de conectividade com banco");
            response.put("timestamp", System.currentTimeMillis());
            // Aqui poderia testar uma query simples se necessário
        } catch (Exception e) {
            response.put("status", "ERROR");
            response.put("error", e.getMessage());
            response.put("timestamp", System.currentTimeMillis());
        }
        return response;
    }
}
