package com.hollyplay.domain.user;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(min = 2, max = 120)
    @Column(name = "nome", nullable = false, length = 120)
    private String nome;

    @NotNull
    @Past
    @Column(name = "data_nascimento", nullable = false)
    private LocalDate dataNascimento;

    @NotBlank
    @Size(min = 8, max = 9)
    @Column(name = "cep", nullable = false, length = 9)
    private String cep;

    @NotBlank
    @Size(max = 180)
    @Column(name = "logradouro", nullable = false, length = 180)
    private String logradouro;

    @NotBlank
    @Size(max = 120)
    @Column(name = "bairro", nullable = false, length = 120)
    private String bairro;

    @NotBlank
    @Size(max = 120)
    @Column(name = "cidade", nullable = false, length = 120)
    private String cidade;

    @NotBlank
    @Size(max = 20)
    @Column(name = "numero", nullable = false, length = 20)
    private String numero;

    @NotBlank
    @Size(max = 20)
    @Column(name = "telefone", nullable = false, length = 20)
    private String telefone;

    @Column(name = "data_cadastro", nullable = false, updatable = false)
    private Instant dataCadastro;

    @Column(name = "data_expiracao")
    private Instant dataExpiracao;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 30)
    private Role role;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private Status status;

    @PrePersist
    public void prePersist() {
        if (this.dataCadastro == null) {
            this.dataCadastro = Instant.now();
        }
    }
}
