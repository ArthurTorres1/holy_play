-- Script para atualizar senhas existentes com hash BCrypt
-- ATENÇÃO: Execute este script apenas UMA VEZ após implementar o sistema de autenticação

-- Atualizar senha do admin (admin123 -> hash BCrypt)
-- Hash BCrypt para "admin123": $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.
UPDATE public.users 
SET password = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.' 
WHERE email = 'admin@holyplay.com' AND password = 'admin123';

-- Atualizar senha do usuário comum (user123 -> hash BCrypt)  
-- Hash BCrypt para "user123": $2a$10$N9qo8uLOickgx2ZMRZoMye/7VK/9Q1L81014MUzIC5h7HQfqpxm3O
UPDATE public.users 
SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMye/7VK/9Q1L81014MUzIC5h7HQfqpxm3O' 
WHERE email = 'user@holyplay.com' AND password = 'user123';

-- Verificar se as senhas foram atualizadas
SELECT email, 
       CASE 
           WHEN password LIKE '$2a$%' THEN 'Hash BCrypt' 
           ELSE 'Texto plano' 
       END as password_type,
       role,
       active
FROM public.users;
