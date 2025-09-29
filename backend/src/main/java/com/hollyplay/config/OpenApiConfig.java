package com.hollyplay.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.context.annotation.Configuration;

@OpenAPIDefinition(
        info = @Info(
                title = "Holly Play - API",
                version = "v1",
                description = "API para gerenciamento de usuários (DDD + SOLID)",
                contact = @Contact(name = "Holly Play", email = "support@hollyplay.com")
        )
)
@Configuration
public class OpenApiConfig {
    // Caso futuramente seja necessário adicionar segurança (JWT), podemos definir um SecurityScheme aqui
}
