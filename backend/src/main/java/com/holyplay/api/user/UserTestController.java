package com.holyplay.api.user;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users/test")
public class UserTestController {

    private final JdbcTemplate jdbcTemplate;

    public UserTestController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/connection")
    public Map<String, Object> testConnection() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // Testar conexão básica
            String version = jdbcTemplate.queryForObject("SELECT version()", String.class);
            result.put("status", "success");
            result.put("database_version", version);
            
            // Verificar se a tabela users existe
            Integer tableExists = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users'", 
                Integer.class
            );
            result.put("users_table_exists", tableExists > 0);
            
            if (tableExists > 0) {
                // Contar usuários existentes
                Integer userCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM public.users", Integer.class);
                result.put("user_count", userCount);
            }
            
        } catch (Exception e) {
            result.put("status", "error");
            result.put("error_message", e.getMessage());
            result.put("error_class", e.getClass().getSimpleName());
        }
        
        return result;
    }
}
