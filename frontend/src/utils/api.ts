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

// Função helper para requisições fetch (compatibilidade)
export const apiFetch = (path: string, options?: RequestInit) => {
  return fetch(getApiUrl(path), options);
};

// Cliente HTTP padronizado
type HttpOptions = {
  headers?: Record<string, string>;
  body?: any;
  auth?: boolean;
};

const parseBody = (body: any) => {
  if (body === undefined || body === null) return undefined;
  if (typeof body === 'string') return body;
  return JSON.stringify(body);
};

const buildHeaders = (headers: Record<string, string> | undefined, auth?: boolean) => {
  const base: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers || {}),
  };

  if (auth) {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Token de autenticação não encontrado. Faça login.');
    }
    base['Authorization'] = `Bearer ${token}`;
  }
  return base;
};

const handleResponse = async (res: Response) => {
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const payload = isJson ? await res.json().catch(() => undefined) : await res.text();
  if (!res.ok) {
    const message = typeof payload === 'string' && payload ? payload : (payload && (payload as any).message) || res.statusText;
    const err: any = new Error(message || `HTTP ${res.status}`);
    err.status = res.status;
    err.payload = payload;
    throw err;
  }
  return payload as any;
};

export const http = {
  get: (path: string, opts: HttpOptions = {}) => {
    return fetch(getApiUrl(path), {
      method: 'GET',
      headers: buildHeaders(opts.headers, opts.auth),
    }).then(handleResponse);
  },
  post: (path: string, opts: HttpOptions = {}) => {
    return fetch(getApiUrl(path), {
      method: 'POST',
      headers: buildHeaders(opts.headers, opts.auth),
      body: parseBody(opts.body),
    }).then(handleResponse);
  },
  put: (path: string, opts: HttpOptions = {}) => {
    return fetch(getApiUrl(path), {
      method: 'PUT',
      headers: buildHeaders(opts.headers, opts.auth),
      body: parseBody(opts.body),
    }).then(handleResponse);
  },
  delete: (path: string, opts: HttpOptions = {}) => {
    return fetch(getApiUrl(path), {
      method: 'DELETE',
      headers: buildHeaders(opts.headers, opts.auth),
    }).then(handleResponse);
  },
};

// Log para debug apenas em desenvolvimento
const isDev = () => typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
if (isDev()) {
  console.log('🔧 VITE_API_BASE:', import.meta.env.VITE_API_BASE);
  console.log('🔧 API_BASE:', import.meta.env.API_BASE);
  console.log('🔧 API_BASE final:', API_BASE);
  console.log('🔧 Exemplo de URL:', getApiUrl('api/test'));
}
