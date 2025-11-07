package com.holyplay.application.user;

import com.holyplay.domain.user.Role;
import com.holyplay.domain.user.User;
import com.holyplay.domain.user.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class CreateUserUseCase {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    public CreateUserUseCase(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }
    
    public User execute(String name, String email, String password, String roleStr) {
        // Verificar se email já existe
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email já está em uso: " + email);
        }
        
        // Validar role
        Role role;
        try {
            role = Role.fromString(roleStr);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Role inválido: " + roleStr + ". Valores aceitos: ADMIN, USER");
        }
        
        // Criar usuário com senha hasheada
        String hashedPassword = passwordEncoder.encode(password);
        User user = new User(name, email, hashedPassword, role);
        
        return userRepository.save(user);
    }
}
