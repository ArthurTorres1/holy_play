package com.hollyplay.infrastructure.repository;

import com.hollyplay.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}
