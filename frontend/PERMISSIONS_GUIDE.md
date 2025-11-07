# Sistema de Permissões - Holy Play

## 🔐 **Controle de Acesso Implementado**

### ✅ **Componentes Criados:**

1. **ProtectedRoute** - Componente para proteger rotas por role
2. **usePermissions** - Hook para verificar permissões do usuário
3. **Proteção da rota /admin** - Apenas usuários ADMIN podem acessar

## 🎯 **Funcionalidades**

### **Roles Disponíveis:**
- **USER** - Usuário comum
- **ADMIN** - Administrador com privilégios especiais

### **Proteções Implementadas:**

#### **1. Rota /admin Protegida:**
```tsx
<ProtectedRoute requiredRole="ADMIN">
  <AdminPanel />
</ProtectedRoute>
```

#### **2. Botão Admin no Header:**
- Só aparece para usuários ADMIN
- Link direto para `/admin`
- Ícone Settings + texto "Admin"

#### **3. Menu do Usuário:**
- Link "Painel Admin" só aparece para ADMIN
- Ícone Shield + texto "Painel Admin"

## 🔧 **Como Usar**

### **Hook usePermissions:**
```tsx
import { usePermissions } from '../hooks/usePermissions';

const MyComponent = () => {
  const { 
    isAdmin,
    canAccessAdmin,
    canUploadVideos,
    canManageUsers 
  } = usePermissions();

  return (
    <div>
      {isAdmin() && <AdminButton />}
      {canUploadVideos() && <UploadButton />}
    </div>
  );
};
```

### **Componente ProtectedRoute:**
```tsx
import ProtectedRoute from './components/auth/ProtectedRoute';

// Proteger rota para ADMIN
<ProtectedRoute requiredRole="ADMIN">
  <AdminComponent />
</ProtectedRoute>

// Proteger rota para qualquer usuário logado
<ProtectedRoute requiredRole="USER">
  <UserComponent />
</ProtectedRoute>

// Redirecionar para página customizada
<ProtectedRoute 
  requiredRole="ADMIN" 
  redirectTo="/unauthorized"
>
  <AdminComponent />
</ProtectedRoute>
```

## 🎨 **Telas de Erro**

### **Usuário Não Autenticado:**
- Redireciona automaticamente para `/auth`

### **Usuário Sem Permissão:**
- Tela de "Acesso Negado" com:
  - Ícone de aviso
  - Mensagem explicativa
  - Botão "Voltar"
  - Botão "Ir para Home"
  - Informações do usuário logado

## 🚀 **Fluxo de Verificação**

### **1. Verificação de Autenticação:**
```
Usuário acessa /admin
↓
ProtectedRoute verifica se está logado
↓
Se não → Redireciona para /auth
Se sim → Continua verificação
```

### **2. Verificação de Role:**
```
Usuário logado acessa /admin
↓
ProtectedRoute verifica role
↓
Se USER → Mostra tela "Acesso Negado"
Se ADMIN → Permite acesso
```

### **3. Loading State:**
```
Enquanto verifica autenticação
↓
Mostra spinner de loading
↓
"Verificando permissões..."
```

## 📋 **Permissões por Role**

### **USER (Usuário Comum):**
- ✅ Acessar home
- ✅ Fazer login/logout
- ✅ Ver próprio perfil
- ❌ Acessar painel admin
- ❌ Fazer upload de vídeos
- ❌ Gerenciar usuários

### **ADMIN (Administrador):**
- ✅ Todas as permissões de USER
- ✅ Acessar painel admin (`/admin`)
- ✅ Fazer upload de vídeos
- ✅ Gerenciar usuários
- ✅ Ver botão Admin no header
- ✅ Ver link "Painel Admin" no menu

## 🔒 **Segurança**

### **Frontend (Proteção de UI):**
- Componentes condicionais baseados em role
- Rotas protegidas com ProtectedRoute
- Verificação em tempo real

### **Backend (Proteção de API):**
- JWT contém informações de role
- Endpoints protegidos por Spring Security
- Validação de permissões no servidor

## 🧪 **Como Testar**

### **1. Teste com Usuário Comum:**
```bash
# Login como USER
Email: user@holyplay.com
Senha: user123

# Verificar:
- Não vê botão "Admin" no header
- Não vê "Painel Admin" no menu
- Acesso direto a /admin mostra "Acesso Negado"
```

### **2. Teste com Administrador:**
```bash
# Login como ADMIN
Email: admin@holyplay.com
Senha: admin123

# Verificar:
- Vê botão "Admin" no header
- Vê "Painel Admin" no menu
- Acesso a /admin funciona normalmente
```

### **3. Teste sem Login:**
```bash
# Acessar /admin sem estar logado
- Redireciona automaticamente para /auth
```

## 🎯 **Próximas Melhorias**

### **Possíveis Expansões:**
- [ ] Role MODERATOR (moderador)
- [ ] Permissões granulares (ex: can_upload, can_delete)
- [ ] Grupos de usuários
- [ ] Permissões temporárias
- [ ] Auditoria de acessos

### **Melhorias de UX:**
- [ ] Toast notification ao tentar acessar área restrita
- [ ] Página de "Em breve" para funcionalidades futuras
- [ ] Tutorial para novos admins

O sistema de permissões está **100% funcional** e seguro! 🔐
