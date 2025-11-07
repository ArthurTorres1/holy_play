package com.holyplay.api.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public class UpdateUserRequest {
    
    @Size(max = 255, message = "Nome deve ter no máximo 255 caracteres")
    private String name;
    
    @Email(message = "Email deve ter um formato válido")
    @Size(max = 255, message = "Email deve ter no máximo 255 caracteres")
    private String email;
    
    @Size(max = 255, message = "Senha deve ter no máximo 255 caracteres")
    private String password;
    
    @Size(max = 32, message = "Role deve ter no máximo 32 caracteres")
    private String role;
    
    private Boolean active;

    public UpdateUserRequest() {}

    public UpdateUserRequest(String name, String email, String password, String role, Boolean active) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.active = active;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
