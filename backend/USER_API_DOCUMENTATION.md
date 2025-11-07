# API de Usuários - Holy Play

## Visão Geral

Esta API fornece operações CRUD completas para gerenciamento de usuários com dois tipos de roles: **ADMIN** e **USER**.

## Estrutura da Tabela

```sql
CREATE TABLE public.users (
    id BIGSERIAL PRIMARY KEY,
    name CHARACTER VARYING(255) NOT NULL,
    email CHARACTER VARYING(255) NOT NULL UNIQUE,
    password CHARACTER VARYING(255) NOT NULL,
    role CHARACTER VARYING(32) NOT NULL DEFAULT 'USER',
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);
```

## Endpoints da API

### 1. Criar Usuário
**POST** `/api/users`

**Request Body:**
```json
{
    "name": "João Silva",
    "email": "joao@example.com",
    "password": "senha123",
    "role": "USER"
}
```

**Response (201 Created):**
```json
{
    "id": 1,
    "name": "João Silva",
    "email": "joao@example.com",
    "role": "USER",
    "active": true,
    "createdAt": "2024-01-01T10:00:00"
}
```

### 2. Buscar Usuário por ID
**GET** `/api/users/{id}`

**Response (200 OK):**
```json
{
    "id": 1,
    "name": "João Silva",
    "email": "joao@example.com",
    "role": "USER",
    "active": true,
    "createdAt": "2024-01-01T10:00:00"
}
```

### 3. Buscar Usuário por Email
**GET** `/api/users/email/{email}`

**Response (200 OK):**
```json
{
    "id": 1,
    "name": "João Silva",
    "email": "joao@example.com",
    "role": "USER",
    "active": true,
    "createdAt": "2024-01-01T10:00:00"
}
```

### 4. Listar Todos os Usuários
**GET** `/api/users`

**Parâmetros opcionais:**
- `role`: Filtrar por role (ADMIN ou USER)
- `active`: Filtrar por status ativo (true ou false)

**Exemplos:**
- `/api/users` - Todos os usuários
- `/api/users?role=ADMIN` - Apenas administradores
- `/api/users?active=true` - Apenas usuários ativos

**Response (200 OK):**
```json
[
    {
        "id": 1,
        "name": "João Silva",
        "email": "joao@example.com",
        "role": "USER",
        "active": true,
        "createdAt": "2024-01-01T10:00:00"
    },
    {
        "id": 2,
        "name": "Admin",
        "email": "admin@example.com",
        "role": "ADMIN",
        "active": true,
        "createdAt": "2024-01-01T09:00:00"
    }
]
```

### 5. Atualizar Usuário
**PUT** `/api/users/{id}`

**Request Body (todos os campos são opcionais):**
```json
{
    "name": "João Silva Santos",
    "email": "joao.santos@example.com",
    "password": "novaSenha123",
    "role": "ADMIN",
    "active": false
}
```

**Response (200 OK):**
```json
{
    "id": 1,
    "name": "João Silva Santos",
    "email": "joao.santos@example.com",
    "role": "ADMIN",
    "active": false,
    "createdAt": "2024-01-01T10:00:00"
}
```

### 6. Deletar Usuário
**DELETE** `/api/users/{id}`

**Response (204 No Content)**

## Roles Disponíveis

- **ADMIN**: Administrador do sistema
- **USER**: Usuário comum

## Validações

### Criar Usuário
- `name`: Obrigatório, máximo 255 caracteres
- `email`: Obrigatório, formato válido, máximo 255 caracteres, único
- `password`: Obrigatório, máximo 255 caracteres
- `role`: Obrigatório, deve ser "ADMIN" ou "USER"

### Atualizar Usuário
- `name`: Opcional, máximo 255 caracteres
- `email`: Opcional, formato válido, máximo 255 caracteres, único
- `password`: Opcional, máximo 255 caracteres
- `role`: Opcional, deve ser "ADMIN" ou "USER"
- `active`: Opcional, boolean

## Códigos de Status HTTP

- **200 OK**: Operação realizada com sucesso
- **201 Created**: Usuário criado com sucesso
- **204 No Content**: Usuário deletado com sucesso
- **400 Bad Request**: Dados inválidos ou email já em uso
- **404 Not Found**: Usuário não encontrado

## Configuração do Banco

1. Execute o script SQL em `src/main/resources/sql/create_users_table.sql`
2. O script criará a tabela e inserirá usuários de exemplo:
   - **Admin**: admin@holyplay.com / admin123
   - **User**: user@holyplay.com / user123

## Arquitetura

O projeto segue a arquitetura hexagonal (Clean Architecture):

- **Domain**: Entidades e interfaces (`User`, `Role`, `UserRepository`)
- **Application**: Casos de uso (`CreateUserUseCase`, `GetUserUseCase`, etc.)
- **Infrastructure**: Implementações (`UserJdbcRepository`)
- **API**: Controllers e DTOs (`UserController`, `CreateUserRequest`, etc.)

## Exemplos de Uso com cURL

### Criar usuário
```bash
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste User",
    "email": "teste@example.com",
    "password": "senha123",
    "role": "USER"
  }'
```

### Listar usuários
```bash
curl http://localhost:8080/api/users
```

### Buscar usuário por ID
```bash
curl http://localhost:8080/api/users/1
```

### Atualizar usuário
```bash
curl -X PUT http://localhost:8080/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nome Atualizado",
    "active": false
  }'
```

### Deletar usuário
```bash
curl -X DELETE http://localhost:8080/api/users/1
```
