package com.holyplay.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

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
                // Permitir acesso público para LEITURA das configurações da home
                .requestMatchers("GET", "/api/home/configurations/**").permitAll()
                // Permitir acesso público ao endpoint da home page
                .requestMatchers("GET", "/api/home/configurations/home-page").permitAll()
                // Permitir acesso público aos endpoints de vídeos (descrições)
                .requestMatchers("/api/videos/**").permitAll()
                // Todos os outros endpoints requerem autenticação
                .anyRequest().authenticated()
            )
            // Adicionar o filtro JWT antes do filtro de autenticação padrão
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
