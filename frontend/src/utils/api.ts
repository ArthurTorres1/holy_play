// Utilitário para construir URLs da API
const API_BASE = import.meta.env.VITE_API_BASE || 
                 import.meta.env.API_BASE || 
                 'https://back.holyplay.com.br'; // Fallback hardcoded para produção

export const getApiUrl = (path: string): string => {
  // Remove barra inicial se existir
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Se API_BASE está vazio ou é localhost, usa caminho relativo (desenvolvimento)
  if (!API_BASE || API_BASE.includes('localhost')) {
    return `/${cleanPath}`;
  }
  
  // Em produção, usa URL completa
  return `${API_BASE}/${cleanPath}`;
};

// Função helper para requisições fetch
export const apiFetch = (path: string, options?: RequestInit) => {
  return fetch(getApiUrl(path), options);
};

// Log para debug - mostra todas as variáveis
console.log('🔧 VITE_API_BASE:', import.meta.env.VITE_API_BASE);
console.log('🔧 API_BASE:', import.meta.env.API_BASE);
console.log('🔧 API_BASE final:', API_BASE);
console.log('🔧 Exemplo de URL:', getApiUrl('api/test'));
console.log('🔧 Todas as env vars:', import.meta.env);
