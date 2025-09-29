package com.hollyplay.application.user.dto;

import com.hollyplay.domain.user.Role;
import com.hollyplay.domain.user.Status;

import java.time.Instant;
import java.time.LocalDate;

public record UserResponse(
        Long id,
        String nome,
        LocalDate dataNascimento,
        String cep,
        String logradouro,
        String bairro,
        String cidade,
        String numero,
        String telefone,
        Instant dataCadastro,
        Instant dataExpiracao,
        Role role,
        Status status
) {}
