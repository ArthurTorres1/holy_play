package com.holyplay.application.auth;

import com.holyplay.domain.user.User;
import com.holyplay.domain.user.UserRepository;
import com.holyplay.infrastructure.auth.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthenticateUserUseCase {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthenticateUserUseCase(UserRepository userRepository, 
                                  PasswordEncoder passwordEncoder,
                                  JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthenticationResult execute(String email, String password) {
        // Buscar usuário por email
        Optional<User> optionalUser = userRepository.findByEmail(email);
        
        if (optionalUser.isEmpty()) {
            throw new IllegalArgumentException("Credenciais inválidas");
        }
        
        User user = optionalUser.get();
        
        // Verificar se o usuário está ativo
        if (!user.isActive()) {
            throw new IllegalArgumentException("Usuário inativo");
        }
        
        // Verificar senha
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("Credenciais inválidas");
        }
        
        // Gerar token JWT
        String token = jwtService.generateToken(user);
        long expiresIn = jwtService.getExpirationTimeInSeconds();
        
        return new AuthenticationResult(token, "Bearer", expiresIn, user);
    }

    public static class AuthenticationResult {
        private final String token;
        private final String tokenType;
        private final long expiresIn;
        private final User user;

        public AuthenticationResult(String token, String tokenType, long expiresIn, User user) {
            this.token = token;
            this.tokenType = tokenType;
            this.expiresIn = expiresIn;
            this.user = user;
        }

        public String getToken() {
            return token;
        }

        public String getTokenType() {
            return tokenType;
        }

        public long getExpiresIn() {
            return expiresIn;
        }

        public User getUser() {
            return user;
        }
    }
}
