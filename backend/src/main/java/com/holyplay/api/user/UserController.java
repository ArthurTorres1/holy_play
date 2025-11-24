package com.holyplay.api.user;

import com.holyplay.api.user.dto.CreateUserRequest;
import com.holyplay.api.user.dto.CreateAdminRequest;
import com.holyplay.api.user.dto.UpdateUserRequest;
import com.holyplay.api.user.dto.UserResponse;
import com.holyplay.application.user.CreateUserUseCase;
import com.holyplay.application.user.DeleteUserUseCase;
import com.holyplay.application.user.GetUserUseCase;
import com.holyplay.application.user.UpdateUserUseCase;
import com.holyplay.domain.user.User;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final CreateUserUseCase createUserUseCase;
    private final GetUserUseCase getUserUseCase;
    private final UpdateUserUseCase updateUserUseCase;
    private final DeleteUserUseCase deleteUserUseCase;

    public UserController(CreateUserUseCase createUserUseCase,
                         GetUserUseCase getUserUseCase,
                         UpdateUserUseCase updateUserUseCase,
                         DeleteUserUseCase deleteUserUseCase) {
        this.createUserUseCase = createUserUseCase;
        this.getUserUseCase = getUserUseCase;
        this.updateUserUseCase = updateUserUseCase;
        this.deleteUserUseCase = deleteUserUseCase;
    }

    @PostMapping
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody CreateUserRequest request) {
        try {
            User user = createUserUseCase.execute(
                request.getName(),
                request.getEmail(),
                request.getPassword(),
                request.getRole()
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(user));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> createAdmin(@Valid @RequestBody CreateAdminRequest request) {
        try {
            User user = createUserUseCase.execute(
                request.getName(),
                request.getEmail(),
                request.getPassword(),
                "ADMIN"
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(user));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        Optional<User> user = getUserUseCase.findById(id);
        return user.map(u -> ResponseEntity.ok(toResponse(u)))
                  .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<UserResponse> getUserByEmail(@PathVariable String email) {
        Optional<User> user = getUserUseCase.findByEmail(email);
        return user.map(u -> ResponseEntity.ok(toResponse(u)))
                  .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Boolean active) {
        
        List<User> users;
        
        if (role != null && !role.trim().isEmpty()) {
            try {
                users = getUserUseCase.findByRole(role);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().build();
            }
        } else if (active != null) {
            users = getUserUseCase.findByActive(active);
        } else {
            users = getUserUseCase.findAll();
        }
        
        List<UserResponse> responses = users.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(responses);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(@PathVariable Long id, 
                                                  @Valid @RequestBody UpdateUserRequest request) {
        try {
            User user = updateUserUseCase.execute(
                id,
                request.getName(),
                request.getEmail(),
                request.getPassword(),
                request.getRole(),
                request.getActive()
            );
            return ResponseEntity.ok(toResponse(user));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        try {
            deleteUserUseCase.execute(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getRole().getValue(),
            user.isActive(),
            user.getCreatedAt()
        );
    }
}
