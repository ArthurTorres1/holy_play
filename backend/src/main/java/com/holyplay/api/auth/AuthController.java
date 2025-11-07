package com.holyplay.api.auth;

import com.holyplay.api.auth.dto.LoginRequest;
import com.holyplay.api.auth.dto.LoginResponse;
import com.holyplay.application.auth.AuthenticateUserUseCase;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticateUserUseCase authenticateUserUseCase;

    public AuthController(AuthenticateUserUseCase authenticateUserUseCase) {
        this.authenticateUserUseCase = authenticateUserUseCase;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthenticateUserUseCase.AuthenticationResult result = authenticateUserUseCase.execute(
                request.getEmail(),
                request.getPassword()
            );

            LoginResponse response = new LoginResponse(
                result.getToken(),
                result.getTokenType(),
                result.getExpiresIn(),
                new LoginResponse.UserInfo(
                    result.getUser().getId(),
                    result.getUser().getName(),
                    result.getUser().getEmail(),
                    result.getUser().getRole().getValue(),
                    result.getUser().getCreatedAt()
                )
            );

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
