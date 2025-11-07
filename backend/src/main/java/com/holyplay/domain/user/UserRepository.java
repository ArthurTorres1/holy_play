package com.holyplay.domain.user;

import java.util.List;
import java.util.Optional;

public interface UserRepository {
    User save(User user);
    Optional<User> findById(Long id);
    Optional<User> findByEmail(String email);
    List<User> findAll();
    List<User> findByRole(Role role);
    List<User> findByActive(boolean active);
    User update(User user);
    void deleteById(Long id);
    boolean existsByEmail(String email);
}
