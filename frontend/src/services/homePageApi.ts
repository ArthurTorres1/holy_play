// API para buscar dados da página inicial
const API_BASE_URL = 'http://localhost:7695/api/home/configurations';

export interface HomeVideo {
  videoId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: number;
  views: number;
  category: string;
  new: boolean;
  featured: boolean;
}

export interface HomeSection {
  sectionId: string;
  sectionName: string;
  videos: HomeVideo[];
}

export interface HomePageData {
  sections: HomeSection[];
}

/**
 * Busca dados completos da página inicial (público - não precisa de token)
 */
export const getHomePageData = async (): Promise<HomePageData> => {
  try {
    console.log('🏠 Buscando dados da página inicial...');
    
    const response = await fetch(`${API_BASE_URL}/home-page`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Dados da home carregados:', data);
    
    return data;
    
  } catch (error: any) {
    console.error('❌ Erro ao buscar dados da home:', error);
    throw new Error(`Erro ao carregar dados da página inicial: ${error.message}`);
  }
};

/**
 * Formatar duração em segundos para MM:SS
 */
export const formatDuration = (seconds: number): string => {
  if (!seconds || seconds === 0) return '0:00';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Formatar número de visualizações
 */
export const formatViews = (views: number): string => {
  if (!views || views === 0) return '0 visualizações';
  
  if (views < 1000) {
    return `${views} visualizações`;
  } else if (views < 1000000) {
    return `${(views / 1000).toFixed(1)}K visualizações`;
  } else {
    return `${(views / 1000000).toFixed(1)}M visualizações`;
  }
};

/**
 * Gerar URL do player para um vídeo
 */
export const getVideoPlayerUrl = (videoId: string): string => {
  return `/video/${videoId}`;
};

/**
 * Verificar se uma URL de thumbnail é válida (não é placeholder)
 */
export const isValidThumbnail = (thumbnailUrl: string): boolean => {
  return !!(thumbnailUrl && !thumbnailUrl.includes('/api/placeholder'));
};
