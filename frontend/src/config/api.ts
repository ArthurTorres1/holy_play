// Configuração da API - detecta automaticamente o ambiente
const isProduction = () => {
  return window.location.hostname !== 'localhost' && 
         window.location.hostname !== '127.0.0.1' &&
         !window.location.hostname.includes('dev');
};

const getBaseUrl = (): string => {
  // Tenta pegar das variáveis de ambiente primeiro
  const envBase = import.meta.env.VITE_API_BASE || import.meta.env.API_BASE;
  if (envBase) {
    console.log('🔧 Usando API_BASE das variáveis:', envBase);
    return envBase;
  }
  
  // Se não tem variável, detecta automaticamente
  if (isProduction()) {
    const prodUrl = 'https://back.holyplay.com.br';
    console.log('🔧 Produção detectada, usando:', prodUrl);
    return prodUrl;
  }
  
  // Desenvolvimento - usa proxy
  console.log('🔧 Desenvolvimento detectado, usando proxy');
  return '';
};

export const API_CONFIG = {
  baseUrl: getBaseUrl(),
  isProduction: isProduction()
};

export const buildApiUrl = (endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  if (API_CONFIG.baseUrl) {
    return `${API_CONFIG.baseUrl}/${cleanEndpoint}`;
  }
  
  return `/${cleanEndpoint}`;
};

// Log de debug
console.log('🌐 Configuração da API:', API_CONFIG);
console.log('🌐 Hostname atual:', window.location.hostname);
console.log('🌐 URL de teste:', buildApiUrl('api/test'));
