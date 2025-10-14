// Utilitário para construir URLs da API
const API_BASE = import.meta.env.VITE_API_BASE || '';

export const getApiUrl = (path: string): string => {
  // Remove barra inicial se existir
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Se não há API_BASE configurado, usa caminho relativo (desenvolvimento)
  if (!API_BASE) {
    return `/${cleanPath}`;
  }
  
  // Em produção, usa URL completa
  return `${API_BASE}/${cleanPath}`;
};

// Função helper para requisições fetch
export const apiFetch = (path: string, options?: RequestInit) => {
  return fetch(getApiUrl(path), options);
};

// Log para debug
console.log('🔧 API_BASE configurado:', API_BASE);
console.log('🔧 Exemplo de URL:', getApiUrl('api/test'));
