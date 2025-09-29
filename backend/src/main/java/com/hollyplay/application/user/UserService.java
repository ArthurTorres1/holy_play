package com.hollyplay.application.user;

import com.hollyplay.application.user.dto.UpdateUserRequest;
import com.hollyplay.application.user.dto.UserRequest;
import com.hollyplay.application.user.dto.UserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserService {
    UserResponse create(UserRequest request);
    UserResponse getById(Long id);
    Page<UserResponse> list(Pageable pageable);
    UserResponse update(Long id, UpdateUserRequest request);
    void delete(Long id);
}
