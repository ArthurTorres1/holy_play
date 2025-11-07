package com.holyplay.application.user;

import com.holyplay.domain.user.Role;
import com.holyplay.domain.user.User;
import com.holyplay.domain.user.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UpdateUserUseCase {
    
    private final UserRepository userRepository;
    
    public UpdateUserUseCase(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    public User execute(Long id, String name, String email, String password, String roleStr, Boolean active) {
        Optional<User> optionalUser = userRepository.findById(id);
        
        if (optionalUser.isEmpty()) {
            throw new IllegalArgumentException("Usuário não encontrado com ID: " + id);
        }
        
        User user = optionalUser.get();
        
        // Atualizar campos se fornecidos
        if (name != null && !name.trim().isEmpty()) {
            user.setName(name);
        }
        
        if (email != null && !email.trim().isEmpty()) {
            // Verificar se o novo email já está em uso por outro usuário
            Optional<User> existingUser = userRepository.findByEmail(email);
            if (existingUser.isPresent() && !existingUser.get().getId().equals(id)) {
                throw new IllegalArgumentException("Email já está em uso por outro usuário: " + email);
            }
            user.setEmail(email);
        }
        
        if (password != null && !password.trim().isEmpty()) {
            user.setPassword(password);
        }
        
        if (roleStr != null && !roleStr.trim().isEmpty()) {
            try {
                Role role = Role.fromString(roleStr);
                user.setRole(role);
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Role inválido: " + roleStr + ". Valores aceitos: ADMIN, USER");
            }
        }
        
        if (active != null) {
            user.setActive(active);
        }
        
        return userRepository.update(user);
    }
}
