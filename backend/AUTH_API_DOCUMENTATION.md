# API de Autenticação - Holy Play

## Visão Geral

Sistema de autenticação JWT (JSON Web Token) para a aplicação Holy Play com hash de senhas usando BCrypt.

## Endpoint de Login

### POST `/api/auth/login`

Autentica um usuário e retorna um token JWT.

**Request Body:**
```json
{
    "email": "admin@holyplay.com",
    "password": "admin123"
}
```

**Response (200 OK):**
```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 86400,
    "user": {
        "id": 1,
        "name": "Administrador",
        "email": "admin@holyplay.com",
        "role": "ADMIN",
        "createdAt": "2024-01-01T10:00:00"
    }
}
```

**Response (400 Bad Request):**
```json
{
    "error": "Credenciais inválidas"
}
```

## Usando o Token JWT

### Incluir o token no cabeçalho Authorization:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Endpoints públicos (não requerem token):
- `POST /api/auth/login` - Login
- `POST /api/users` - Criar usuário (cadastro público)
- `GET /api/users/test/connection` - Teste de conexão
- `GET /api/health/**` - Endpoints de saúde

### Endpoints que requerem autenticação:
- `GET /api/users` - Listar usuários
- `GET /api/users/{id}` - Buscar usuário por ID
- `PUT /api/users/{id}` - Atualizar usuário
- `DELETE /api/users/{id}` - Deletar usuário

## Configuração JWT

### Variáveis de ambiente (application.properties):
```properties
# Chave secreta JWT (mude em produção!)
jwt.secret=holyplay-super-secret-key-that-should-be-changed-in-production

# Tempo de expiração em horas (padrão: 24h)
jwt.expiration-hours=24
```

## Usuários Padrão

Após executar os scripts SQL, você terá:

### Administrador:
- **Email:** admin@holyplay.com
- **Senha:** admin123
- **Role:** ADMIN

### Usuário Comum:
- **Email:** user@holyplay.com  
- **Senha:** user123
- **Role:** USER

## Exemplos de Uso

### 1. Fazer Login
```bash
curl -X POST http://localhost:7695/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@holyplay.com",
    "password": "admin123"
  }'
```

### 2. Usar Token para Acessar Endpoint Protegido
```bash
# Primeiro, faça login e copie o token
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Use o token para acessar endpoints protegidos
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:7695/api/users
```

### 3. Criar Usuário (com token de admin)
```bash
curl -X POST http://localhost:7695/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Novo Usuário",
    "email": "novo@example.com",
    "password": "senha123",
    "role": "USER"
  }'
```

## Códigos de Status HTTP

- **200 OK**: Login realizado com sucesso
- **400 Bad Request**: Credenciais inválidas ou usuário inativo
- **401 Unauthorized**: Token inválido ou expirado
- **403 Forbidden**: Acesso negado (role insuficiente)

## Segurança

### Hash de Senhas:
- Todas as senhas são hasheadas com BCrypt
- Senhas em texto plano nunca são armazenadas
- Salt automático para cada senha

### Token JWT:
- Expira em 24 horas (configurável)
- Contém informações do usuário (id, email, role)
- Assinado com chave secreta HMAC-SHA256

### Configuração de Segurança:
- CSRF desabilitado (API stateless)
- Sessões desabilitadas (JWT stateless)
- Endpoints públicos configurados
- Todos os outros endpoints requerem autenticação

## Estrutura do Token JWT

O token contém as seguintes informações:
```json
{
    "userId": 1,
    "email": "admin@holyplay.com",
    "name": "Administrador",
    "role": "ADMIN",
    "active": true,
    "sub": "admin@holyplay.com",
    "iat": 1699123456,
    "exp": 1699209856
}
```

## Próximos Passos

1. **Execute o script de atualização de senhas:**
   ```sql
   -- Execute: src/main/resources/sql/update_passwords_hash.sql
   ```

2. **Reinicie a aplicação:**
   ```bash
   mvn spring-boot:run
   ```

3. **Teste o login:**
   ```bash
   curl -X POST http://localhost:7695/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "admin@holyplay.com", "password": "admin123"}'
   ```

4. **Use o token retornado para acessar endpoints protegidos**

## Troubleshooting

### Erro 401 Unauthorized:
- Verifique se o token está no cabeçalho Authorization
- Verifique se o token não expirou
- Verifique se o formato é: `Bearer <token>`

### Erro 400 Bad Request no login:
- Verifique email e senha
- Verifique se o usuário está ativo
- Verifique se as senhas foram atualizadas com hash

### Erro 403 Forbidden:
- Usuário autenticado mas sem permissão
- Verifique o role do usuário
