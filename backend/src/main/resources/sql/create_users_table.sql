-- Script para criar a tabela de usuários
-- Execute este script no seu banco PostgreSQL

CREATE TABLE IF NOT EXISTS public.users (
    id BIGSERIAL PRIMARY KEY,
    name CHARACTER VARYING(255) NOT NULL,
    email CHARACTER VARYING(255) NOT NULL UNIQUE,
    password CHARACTER VARYING(255) NOT NULL,
    role CHARACTER VARYING(32) NOT NULL DEFAULT 'USER',
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON public.users(active);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);

-- Inserir usuário administrador padrão (senha: admin123)
INSERT INTO public.users (name, email, password, role, active, created_at) 
VALUES ('Administrador', 'admin@holyplay.com', 'admin123', 'ADMIN', true, NOW())
ON CONFLICT (email) DO NOTHING;

-- Inserir usuário comum de exemplo (senha: user123)
INSERT INTO public.users (name, email, password, role, active, created_at) 
VALUES ('Usuário Teste', 'user@holyplay.com', 'user123', 'USER', true, NOW())
ON CONFLICT (email) DO NOTHING;
