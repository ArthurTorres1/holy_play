package com.holyplay.application.user;

import com.holyplay.domain.user.User;
import com.holyplay.domain.user.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class DeleteUserUseCase {
    
    private final UserRepository userRepository;
    
    public DeleteUserUseCase(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    public void execute(Long id) {
        Optional<User> optionalUser = userRepository.findById(id);
        
        if (optionalUser.isEmpty()) {
            throw new IllegalArgumentException("Usuário não encontrado com ID: " + id);
        }
        
        userRepository.deleteById(id);
    }
}
