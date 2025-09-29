package com.hollyplay.application.user.dto;

import com.hollyplay.domain.user.Role;
import com.hollyplay.domain.user.Status;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.time.LocalDate;

public record UserRequest(
        @NotBlank @Size(min = 2, max = 120) String nome,
        @NotNull @Past LocalDate dataNascimento,
        @NotBlank @Size(min = 8, max = 9) String cep,
        @NotBlank @Size(max = 180) String logradouro,
        @NotBlank @Size(max = 120) String bairro,
        @NotBlank @Size(max = 120) String cidade,
        @NotBlank @Size(max = 20) String numero,
        @NotBlank @Size(max = 20) String telefone,
        Instant dataExpiracao,
        @NotNull Role role,
        @NotNull Status status
) {}
