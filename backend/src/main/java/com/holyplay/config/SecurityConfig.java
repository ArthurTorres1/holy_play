package com.holyplay.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Permitir acesso público aos endpoints de autenticação
                .requestMatchers("/api/auth/**").permitAll()
                // Permitir acesso público ao cadastro de usuários (POST)
                .requestMatchers("POST", "/api/users").permitAll()
                // Permitir acesso público aos endpoints de teste
                .requestMatchers("/api/users/test/**").permitAll()
                // Permitir acesso público aos endpoints de saúde
                .requestMatchers("/api/health/**").permitAll()
                // Todos os outros endpoints requerem autenticação
                .anyRequest().authenticated()
            );

        return http.build();
    }
}
