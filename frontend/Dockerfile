# Multi-stage build para otimizar o tamanho da imagem
FROM node:18-alpine AS builder

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar todas as dependências (incluindo devDependencies para o build)
RUN npm ci

# Copiar código fonte
COPY . .

# Variáveis de ambiente para o Vite (expostas no build)
ARG VITE_BUNNY_LIBRARY_ID
ARG VITE_BUNNY_API_KEY
ARG VITE_BUNNY_CDN_HOST
ENV VITE_BUNNY_LIBRARY_ID=${VITE_BUNNY_LIBRARY_ID}
ENV VITE_BUNNY_API_KEY=${VITE_BUNNY_API_KEY}
ENV VITE_BUNNY_CDN_HOST=${VITE_BUNNY_CDN_HOST}

# Build da aplicação
RUN npm run build

# Stage de produção - usar nginx para servir os arquivos estáticos
FROM nginx:alpine AS production

# Copiar arquivos buildados do stage anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuração customizada do nginx para SPA (fallback para index.html)
COPY nginx.conf /etc/nginx/nginx.conf

# Expor porta 80
EXPOSE 5333

# Comando para iniciar o nginx
CMD ["nginx", "-g", "daemon off;"]