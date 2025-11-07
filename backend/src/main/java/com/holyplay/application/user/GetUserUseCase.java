package com.holyplay.application.user;

import com.holyplay.domain.user.Role;
import com.holyplay.domain.user.User;
import com.holyplay.domain.user.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class GetUserUseCase {
    
    private final UserRepository userRepository;
    
    public GetUserUseCase(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }
    
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    public List<User> findAll() {
        return userRepository.findAll();
    }
    
    public List<User> findByRole(String roleStr) {
        Role role = Role.fromString(roleStr);
        return userRepository.findByRole(role);
    }
    
    public List<User> findByActive(boolean active) {
        return userRepository.findByActive(active);
    }
}
