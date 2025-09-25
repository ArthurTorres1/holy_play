# Painel de Administrador - Bunny.net Stream API

Este painel permite gerenciar vídeos usando a API do Bunny.net Stream de forma fácil e intuitiva.

## 🚀 Funcionalidades

- ✅ **Upload de Vídeos**: Interface drag-and-drop para upload de vídeos
- ✅ **Listagem de Vídeos**: Visualize todos os vídeos com thumbnails e informações
- ✅ **Player Integrado**: Assista aos vídeos diretamente no painel
- ✅ **Gerenciamento**: Delete, edite e visualize detalhes dos vídeos
- ✅ **Códigos de Embed**: Gere códigos HTML para incorporar vídeos
- ✅ **URLs Diretas**: Acesse URLs diretas para diferentes resoluções
- ✅ **Estatísticas**: Visualize views, tamanho de arquivo e outras métricas

## 📋 Pré-requisitos

1. **Conta no Bunny.net**: Você precisa de uma conta ativa
2. **Library ID**: ID da sua biblioteca de vídeos no Bunny.net
3. **API Key**: Chave de API com permissões de leitura/escrita

## ⚙️ Configuração

### 1. Instalar Dependências

```bash
npm install react-router-dom axios @types/react-router-dom
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto frontend:

```env
REACT_APP_BUNNY_LIBRARY_ID=seu_library_id_aqui
REACT_APP_BUNNY_API_KEY=sua_api_key_aqui
```

### 3. Obter Credenciais do Bunny.net

1. **Acesse o Dashboard**: https://dash.bunny.net/
2. **Vá para Stream**: No menu lateral, clique em "Stream"
3. **Crie uma Library**: Se não tiver, crie uma nova Video Library
4. **Obtenha o Library ID**: Está na URL ou nas configurações da library
5. **Gere uma API Key**: 
   - Vá em Account → API
   - Crie uma nova API Key
   - Marque as permissões necessárias (Video Library)

### 4. Exemplo de Configuração

```env
# Exemplo real (substitua pelos seus valores)
REACT_APP_BUNNY_LIBRARY_ID=12345
REACT_APP_BUNNY_API_KEY=abcd1234-5678-90ef-ghij-klmnopqrstuv
```

## 🎯 Como Usar

### Acessar o Painel

1. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

2. Acesse o painel em: `http://localhost:5173/admin`

### Upload de Vídeos

1. Clique em "Novo Vídeo"
2. Arraste e solte o arquivo ou clique para selecionar
3. Preencha título e descrição (opcional)
4. Clique em "Fazer Upload"
5. Aguarde o processamento (pode levar alguns minutos)

### Gerenciar Vídeos

- **▶️ Assistir**: Clique no ícone de play para abrir o player
- **✏️ Editar**: Clique no ícone de edição para alterar metadados
- **🗑️ Deletar**: Clique no ícone de lixeira para remover o vídeo

### Incorporar Vídeos

1. Clique em "Assistir" em qualquer vídeo
2. Vá para a aba "Embed"
3. Copie o código HTML ou as URLs diretas

## 📁 Estrutura dos Arquivos

```
frontend/src/
├── services/
│   └── bunnyStreamApi.ts          # Serviço da API do Bunny.net
├── components/admin/
│   ├── AdminPanel.tsx             # Painel principal
│   ├── VideoUpload.tsx            # Componente de upload
│   └── VideoPlayer.tsx            # Player de vídeo
└── App.tsx                        # Roteamento atualizado
```

## 🔧 Formatos Suportados

- **Vídeo**: MP4, AVI, MOV, WMV, FLV, WebM
- **Tamanho Máximo**: 2GB por arquivo
- **Processamento**: Automático para múltiplas resoluções

## 📊 Recursos da API

### Endpoints Utilizados

- `GET /library/{libraryId}/videos` - Listar vídeos
- `GET /library/{libraryId}/videos/{videoId}` - Detalhes do vídeo
- `POST /library/{libraryId}/videos` - Criar vídeo
- `PUT /library/{libraryId}/videos/{videoId}` - Upload do arquivo
- `DELETE /library/{libraryId}/videos/{videoId}` - Deletar vídeo

### URLs Geradas

- **Player**: `https://iframe.mediadelivery.net/embed/{libraryId}/{videoId}`
- **Thumbnail**: `https://vz-{libraryId}.b-cdn.net/{videoId}/thumbnail.jpg`
- **Vídeo Direto**: `https://vz-{libraryId}.b-cdn.net/{videoId}/play_{resolution}.mp4`

## 🚨 Troubleshooting

### Erro "Verifique suas credenciais da API"
- Confirme se o `REACT_APP_BUNNY_LIBRARY_ID` está correto
- Verifique se a `REACT_APP_BUNNY_API_KEY` tem as permissões necessárias
- Certifique-se de que as variáveis estão no arquivo `.env`

### Vídeo não aparece após upload
- O processamento pode levar alguns minutos
- Recarregue a página para ver o status atualizado
- Verifique se o formato do arquivo é suportado

### Erro de CORS
- O Bunny.net permite requisições do frontend
- Se houver problemas, considere usar um proxy no backend

## 🔐 Segurança

⚠️ **IMPORTANTE**: 
- Nunca exponha sua API Key em repositórios públicos
- Use variáveis de ambiente para credenciais
- Considere implementar autenticação para o painel admin
- Para produção, implemente um backend para gerenciar as credenciais

## 📞 Suporte

- **Documentação Bunny.net**: https://docs.bunny.net/
- **API Reference**: https://docs.bunny.net/reference/video_library
- **Dashboard**: https://dash.bunny.net/

---

🎉 **Pronto!** Agora você tem um painel completo para gerenciar seus vídeos no Bunny.net!
