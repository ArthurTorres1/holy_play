# Como configurar application.properties para ler variáveis do EasyPanel

## Problema
O Spring Boot não lê automaticamente as variáveis de ambiente do EasyPanel.
Você define `server.port=7695` no EasyPanel, mas o Spring Boot roda na porta 8080.

## Solução
Edite seu arquivo `src/main/resources/application.properties` e adicione:

```properties
# Porta do servidor - lê da variável de ambiente SERVER_PORT
server.port=${SERVER_PORT:8080}

# Configurações do banco de dados
spring.datasource.url=${SPRING_DATASOURCE_URL:jdbc:postgresql://localhost:5432/holyplay}
spring.datasource.username=${SPRING_DATASOURCE_USERNAME:postgres}
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD:password}

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=${SPRING_JPA_HIBERNATE_DDL_AUTO:none}
spring.jpa.show-sql=${SPRING_JPA_SHOW_SQL:false}
spring.jpa.properties.hibernate.jdbc.lob.non_contextual_creation=${SPRING_JPA_PROPERTIES_HIBERNATE_JDBC_LOB_NON_CONTEXTUAL_CREATION:true}

# Logs
logging.level.com.holyplay=${LOGGING_LEVEL_HOLYPLAY:INFO}
logging.level.org.springframework.web=${LOGGING_LEVEL_SPRING_WEB:INFO}
```

## Como funciona
- `${SERVER_PORT:8080}` = lê a variável `SERVER_PORT` do ambiente, se não existir usa `8080`
- No EasyPanel você tem `server.port=7695`, mas o Spring Boot espera `SERVER_PORT=7695`

## Variáveis no EasyPanel
Mude no EasyPanel de:
```
server.port=7695
```

Para:
```
SERVER_PORT=7695
```

## Resultado esperado
Após essa mudança, os logs devem mostrar:
```
Tomcat started on port 7695 (http) with context path ''
```

## Alternativa rápida
Se não quiser mexer no código agora, mude a porta do domínio de 7695 para 8080.
