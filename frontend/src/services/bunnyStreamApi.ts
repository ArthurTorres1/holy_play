// Serviço para integração com Bunny.net Stream API
import axios from 'axios';

// Configurações da API (somente via .env do Vite)
const BUNNY_STREAM_API_BASE = 'https://video.bunnycdn.com';
const { VITE_BUNNY_LIBRARY_ID, VITE_BUNNY_API_KEY, VITE_BUNNY_CDN_HOST } = (import.meta as any).env ?? {};

// Validação das variáveis obrigatórias
function mask(val?: string) {
  if (!val) return 'AUSENTE';
  if (val.length <= 8) return `${val[0]}***`;
  return `${val.slice(0, 6)}...`;
}

if (!VITE_BUNNY_LIBRARY_ID || !VITE_BUNNY_API_KEY) {
  // Nunca exponha a chave completa nos logs
  // Dê instruções claras para configurar o .env corretamente
  const libMask = mask(VITE_BUNNY_LIBRARY_ID);
  const keyMask = mask(VITE_BUNNY_API_KEY);
  throw new Error(
    `[Config Bunny] Variáveis de ambiente ausentes. ` +
    `VITE_BUNNY_LIBRARY_ID=${libMask} | VITE_BUNNY_API_KEY=${keyMask}. ` +
    `Defina-as no arquivo .env (prefixo VITE_) e reinicie o dev server.`
  );
}

const BUNNY_LIBRARY_ID: string = VITE_BUNNY_LIBRARY_ID as string;
const BUNNY_API_KEY: string = VITE_BUNNY_API_KEY as string;
// Host CDN opcional (igual ao exibido no painel: ex.: vz-xxxx.b-cdn.net)
const BUNNY_CDN_HOST: string | undefined = VITE_BUNNY_CDN_HOST as string | undefined;

// Configuração do axios
const bunnyApi = axios.create({
  baseURL: BUNNY_STREAM_API_BASE,
  headers: {
    'AccessKey': BUNNY_API_KEY,
    'Content-Type': 'application/json',
  },
});

// Tipos TypeScript
export interface Video {
  videoId: string;
  title: string;
  description?: string;
  dateUploaded: string;
  views: number;
  isPublic: boolean;
  length: number;
  status: number;
  framerate?: number;
  width?: number;
  height?: number;
  availableResolutions?: string;
  thumbnailUrl?: string;
  thumbnailFileName?: string; // Nome do arquivo de thumbnail customizado
  storageSize?: number;
  encodeProgress?: number;
}

export interface VideoUploadResponse {
  videoId: string;
  title: string;
  status: number;
}

export interface VideoListResponse {
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  items: Video[];
}

// Classe do serviço
// Tipos crus retornados pela API do Bunny
type RawVideo = {
  guid: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  thumbnailFileName?: string;
  status: number;
  views: number;
  isPublic: boolean;
  length: number;
  dateUploaded: string;
  framerate?: number;
  width?: number;
  height?: number;
  availableResolutions?: string;
  storageSize: number;
};

type RawVideoListResponse = {
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  items: RawVideo[];
};

class BunnyStreamService {
  private normalize(raw: RawVideo): Video {
    const video: Video = {
      videoId: raw.guid,
      title: raw.title || 'Sem título',
      description: raw.description,
      thumbnailUrl: this.generateThumbnailUrl(raw.guid, raw.thumbnailFileName),
      thumbnailFileName: raw.thumbnailFileName,
      status: raw.status,
      views: raw.views || 0,
      isPublic: raw.isPublic || false,
      length: raw.length || 0,
      dateUploaded: raw.dateUploaded,
      framerate: raw.framerate,
      width: raw.width,
      height: raw.height,
      availableResolutions: raw.availableResolutions,
      storageSize: raw.storageSize,
    };
    return video;
  }

  // Gera URL de thumbnail priorizando o host CDN configurado (igual ao painel), com fallback para mediadelivery
  private generateThumbnailUrl(videoId: string, _thumbnailFileName?: string): string {
    // 1) Se existir host CDN configurado, usar ele (recomendado pelo painel)
    if (BUNNY_CDN_HOST) {
      const cdnUrl = `https://${BUNNY_CDN_HOST}/${videoId}/thumbnail.jpg`;
      return cdnUrl;
    }

    // 2) Fallback: usar mediadelivery (thumbnail endpoint)
    const mdUrl = `https://iframe.mediadelivery.net/thumbnail/${BUNNY_LIBRARY_ID}/${videoId}?width=320`;
    return mdUrl;
  }

  // Helper público para obter a URL de thumbnail pelo mediadelivery, com tamanho configurável
  getMediadeliveryThumbnailUrl(videoId: string, width: number = 640): string {
    const params = width ? `?width=${width}` : '';
    return `https://iframe.mediadelivery.net/thumbnail/${BUNNY_LIBRARY_ID}/${videoId}${params}`;
  }

  // Helper público para obter a URL do CDN configurado, se existir
  getCdnThumbnailUrl(videoId: string, width: number = 640): string | undefined {
    if (!BUNNY_CDN_HOST) return undefined;
    const base = `https://${BUNNY_CDN_HOST}/${videoId}/thumbnail.jpg`;
    return width ? `${base}?width=${width}` : base;
  }

  // Helper público para obter a URL do CDN usando o arquivo exato da thumbnail, quando disponível
  getCdnThumbnailByFileName(videoId: string, fileName: string, width?: number): string | undefined {
    if (!BUNNY_CDN_HOST) return undefined;
    const base = `https://${BUNNY_CDN_HOST}/${videoId}/${fileName}`;
    return width ? `${base}?width=${width}` : base;
  }

  // Retorna uma lista priorizada de URLs de thumbnail para tentar (sem frames; somente thumbnails)
  getPreferredThumbnailUrls(videoId: string): string[] {
    const urls: (string | undefined)[] = [
      this.getCdnThumbnailUrl(videoId, 640),
      this.getCdnThumbnailUrl(videoId, 480),
      this.getMediadeliveryThumbnailUrl(videoId, 640),
      this.getMediadeliveryThumbnailUrl(videoId, 480),
    ];
    const filtered = urls.filter(Boolean) as string[];
    return filtered;
  }

  // Versão orientada ao Video para priorizar o arquivo exato quando existir
  getPreferredThumbnailUrlsFromVideo(video: Video): string[] {
    const urls: (string | undefined)[] = [];
    // 1) Se houver arquivo específico, prioriza-o no CDN
    if (video.thumbnailFileName) {
      urls.push(this.getCdnThumbnailByFileName(video.videoId, video.thumbnailFileName, 640));
      urls.push(this.getCdnThumbnailByFileName(video.videoId, video.thumbnailFileName, 480));
    }
    // 2) Thumbnail padrão do CDN
    urls.push(this.getCdnThumbnailUrl(video.videoId, 640));
    urls.push(this.getCdnThumbnailUrl(video.videoId, 480));
    // 3) Fallback mediadelivery
    urls.push(this.getMediadeliveryThumbnailUrl(video.videoId, 640));
    urls.push(this.getMediadeliveryThumbnailUrl(video.videoId, 480));

    const filtered = urls.filter(Boolean) as string[];
    return filtered;
  }

  // =============== Fallback via API (blob/objectURL) ===============
  // Tenta obter a thumbnail diretamente da API com AccessKey e retorna um ObjectURL utilizável em <img>
  async getThumbnailObjectUrl(videoId: string, width: number = 640): Promise<string | null> {
    try {
      // Endpoint experimental: muitas contas permitem GET no mesmo caminho do POST de set thumbnail
      // Se a API suportar, este GET retornará a imagem já gerada
      const apiUrl = `${BUNNY_STREAM_API_BASE}/library/${BUNNY_LIBRARY_ID}/videos/${videoId}/thumbnail?width=${width}`;
      const res = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'AccessKey': BUNNY_API_KEY,
          'accept': 'image/*'
        }
      });
      if (!res.ok) {
        console.warn(`⚠️ GET thumbnail via API falhou (${res.status}) para ${videoId}`);
        return null;
      }
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      return objectUrl;
    } catch (err) {
      console.error(`❌ Erro ao obter thumbnail via API para ${videoId}:`, err);
      return null;
    }
  }
  // Listar todos os vídeos
  async getVideos(page: number = 1, itemsPerPage: number = 100): Promise<VideoListResponse> {
    try {
      const response = await fetch(`https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos?page=${page}&itemsPerPage=${itemsPerPage}&orderBy=date`, {
        method: 'GET',
        headers: {
          'AccessKey': BUNNY_API_KEY,
          'accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: RawVideoListResponse = await response.json();
      
      const videos = data.items.map(item => this.normalize(item));
      
      return {
        totalItems: data.totalItems,
        currentPage: data.currentPage,
        itemsPerPage: data.itemsPerPage,
        items: videos,
      };
    } catch (error) {
      console.error('Erro ao buscar vídeos:', error);
      throw error;
    }
  }

  // Obter detalhes de um vídeo específico
  async getVideo(videoId: string): Promise<Video> {
    try {
      const response = await fetch(`https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos/${videoId}`, {
        method: 'GET',
        headers: {
          'AccessKey': BUNNY_API_KEY,
          'accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: RawVideo = await response.json();
      return this.normalize(data);
    } catch (error) {
      console.error('Erro ao buscar vídeo:', error);
      throw error;
    }
  }

  // Criar um novo vídeo (apenas metadados)
  async createVideo(title: string, description?: string): Promise<VideoUploadResponse> {
    try {
      const response = await fetch(`https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos`, {
        method: 'POST',
        headers: {
          'AccessKey': BUNNY_API_KEY,
          'Content-Type': 'application/json',
          'accept': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: RawVideo = await response.json();
      return {
        videoId: data.guid,
        title: data.title,
        status: data.status,
      };
    } catch (error) {
      console.error('Erro ao criar vídeo:', error);
      throw error;
    }
  }

  // Upload do arquivo de vídeo
  async uploadVideoFile(videoId: string, file: File, onProgress?: (progress: number) => void): Promise<void> {
    try {
      const uploadUrl = `${BUNNY_STREAM_API_BASE}/library/${BUNNY_LIBRARY_ID}/videos/${videoId}`;
      
      await axios.put(uploadUrl, file, {
        headers: {
          'AccessKey': BUNNY_API_KEY,
          'Content-Type': 'application/octet-stream',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      });
    } catch (error) {
      console.error('Erro ao fazer upload do vídeo:', error);
      throw error;
    }
  }

  // Atualizar metadados do vídeo
  async updateVideo(videoId: string, title: string, description?: string): Promise<Video> {
    try {
      const response = await bunnyApi.post(`/library/${BUNNY_LIBRARY_ID}/videos/${videoId}`, {
        title,
        description,
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar vídeo:', error);
      throw error;
    }
  }

  // Deletar vídeo
  async deleteVideo(videoId: string): Promise<void> {
    try {
      const response = await fetch(`https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos/${videoId}`, {
        method: 'DELETE',
        headers: {
          'AccessKey': BUNNY_API_KEY,
          'accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao deletar vídeo:', error);
      throw error;
    }
  }

  // Obter URL do player
  getPlayerUrl(videoId: string): string {
    return `https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${videoId}`;
  }

  // Obter URL da thumbnail
  getThumbnailUrl(videoId: string, width: number = 256, time?: number): string {
    const base = `https://vz-${BUNNY_LIBRARY_ID}.b-cdn.net/${videoId}/thumbnail.jpg`;
    const params = new URLSearchParams();
    if (width) params.set('width', String(width));
    if (time) params.set('time', String(time));
    return params.toString() ? `${base}?${params.toString()}` : base;
  }

  // Obter URL da thumbnail usando thumbnailFileName (para thumbnails customizadas)
  getThumbnailUrlFromVideo(video: Video, width: number = 320): string {
    if (video.thumbnailFileName) {
      // Se tem thumbnail customizada, usar o nome do arquivo
      const base = `https://vz-${BUNNY_LIBRARY_ID}.b-cdn.net/${video.videoId}/${video.thumbnailFileName}`;
      return width ? `${base}?width=${width}` : base;
    }
    // Fallback para thumbnail padrão
    return this.getThumbnailUrl(video.videoId, width);
  }

  // Candidatos alternativos de thumbnail
  getThumbnailCandidates(videoId: string, width: number = 320): string[] {
    return [
      // URLs diretas do CDN (mais confiáveis)
      this.getThumbnailUrl(videoId, width),
      this.getThumbnailUrl(videoId, width, 1),
      this.getThumbnailUrl(videoId, width, 5),
      this.getThumbnailUrl(videoId, width, 10),
      // Sem parâmetros (thumbnail padrão)
      `https://vz-${BUNNY_LIBRARY_ID}.b-cdn.net/${videoId}/thumbnail.jpg`,
      // Endpoint do mediadelivery (pode não estar habilitado)
      `https://iframe.mediadelivery.net/thumbnail/${BUNNY_LIBRARY_ID}/${videoId}?width=${width}`,
      // Variações de tamanho
      this.getThumbnailUrl(videoId, 256),
      this.getThumbnailUrl(videoId, 480),
    ];
  }

  // Gerar thumbnail a partir de frame do vídeo (alternativa quando thumbnails não existem)
  getVideoFrameUrl(videoId: string, time: number = 1): string {
    return `https://vz-${BUNNY_LIBRARY_ID}.b-cdn.net/${videoId}/preview.webp?time=${time}`;
  }

  // Obter URL direta do vídeo
  getVideoUrl(videoId: string, resolution: string = '720p'): string {
    return `https://vz-${BUNNY_LIBRARY_ID}.b-cdn.net/${videoId}/play_${resolution}.mp4`;
  }

  // Upload de thumbnail personalizada
  async uploadThumbnail(videoId: string, thumbnailFile: File): Promise<void> {
    const url = `${BUNNY_STREAM_API_BASE}/library/${BUNNY_LIBRARY_ID}/videos/${videoId}/thumbnail`;
    
    try {
      // Tentativa 1: POST RAW BINÁRIO com timeout reduzido
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos timeout
      
      let response = await fetch(url, {
        method: 'POST',
        headers: {
          'AccessKey': BUNNY_API_KEY,
          'accept': 'application/json',
          'Content-Type': thumbnailFile.type || 'application/octet-stream',
        },
        body: thumbnailFile,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      // Tentativa 2: se não OK, tentar multipart com campo 'thumbnail' (nome esperado em algumas contas)
      if (!response.ok) {
        console.warn(`⚠️ RAW upload falhou (${response.status}). Tentando multipart 'thumbnail'...`);
        const formData2 = new FormData();
        formData2.append('thumbnail', thumbnailFile, thumbnailFile.name);

        response = await fetch(url, {
          method: 'POST',
          headers: {
            'AccessKey': BUNNY_API_KEY,
            'accept': 'application/json',
            // Não setar Content-Type manualmente!
          } as any,
          body: formData2,
        });
      }

      // Tentativa 3: se 401, usar Authorization Bearer
      if (response.status === 401) {
        const formData3 = new FormData();
        formData3.append('thumbnail', thumbnailFile, thumbnailFile.name);
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${BUNNY_API_KEY}`,
            'accept': 'application/json',
          } as any,
          body: formData3,
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Erro HTTP ${response.status}:`, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
      }

    } catch (error: any) {
      console.error(`❌ Erro ao enviar thumbnail para ${videoId}:`, error);
      
      // Se for erro de CORS, tentar abordagem alternativa
      if (error.message.includes('CORS') || error.name === 'TypeError') {
        return this.uploadThumbnailXHR(videoId, thumbnailFile);
      }
      
      throw new Error(`Erro ao enviar thumbnail: ${error.message}`);
    }
  }

  // Método alternativo usando XMLHttpRequest (fallback para CORS)
  private async uploadThumbnailXHR(videoId: string, thumbnailFile: File): Promise<void> {
    const url = `${BUNNY_STREAM_API_BASE}/library/${BUNNY_LIBRARY_ID}/videos/${videoId}/thumbnail`;
    
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.open('POST', url);
      xhr.setRequestHeader('AccessKey', BUNNY_API_KEY);
      xhr.setRequestHeader('accept', 'application/json');
      // Não definir Content-Type para FormData - deixar o browser definir automaticamente
      
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          console.error(`❌ Erro XHR ${xhr.status}:`, xhr.responseText);
          reject(new Error(`HTTP ${xhr.status}: ${xhr.responseText || xhr.statusText}`));
        }
      };
      
      xhr.onerror = (event) => {
        console.error(`❌ Erro de rede XHR:`, event);
        reject(new Error('Erro de rede ao enviar thumbnail via XHR'));
      };
      
      // Usar FormData para envio correto do arquivo
      const formData = new FormData();
      formData.append('file', thumbnailFile);

      xhr.send(formData);
    });
  }

  // Definir thumbnail a partir de um momento específico do vídeo
  async setThumbnailFromVideo(videoId: string, timeInSeconds: number): Promise<void> {
    const url = `${BUNNY_STREAM_API_BASE}/library/${BUNNY_LIBRARY_ID}/videos/${videoId}/thumbnail?thumbnailTime=${timeInSeconds}`;
    
    try {
      // Usar XMLHttpRequest para melhor controle
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.open('POST', url);
        xhr.setRequestHeader('AccessKey', BUNNY_API_KEY);
        xhr.setRequestHeader('Content-Type', 'application/json');
        
        xhr.onreadystatechange = () => {
          // noop
        };
        
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            console.error(`❌ Erro HTTP ${xhr.status}:`, xhr.responseText);
            reject(new Error(`HTTP ${xhr.status}: ${xhr.responseText || xhr.statusText}`));
          }
        };
        
        xhr.onerror = (event) => {
          console.error(`❌ Erro de rede ao definir thumbnail:`, event);
          reject(new Error('Erro de rede ao definir thumbnail. Verifique CORS e conectividade.'));
        };
        
        xhr.ontimeout = () => {
          console.error(`❌ Timeout ao definir thumbnail`);
          reject(new Error('Timeout na requisição'));
        };
        
        xhr.timeout = 30000; // 30 segundos de timeout

        xhr.send();
      });
      
    } catch (error: any) {
      console.error(`❌ Erro ao definir thumbnail do vídeo ${videoId}:`, error);
      throw new Error(`Erro ao definir thumbnail: ${error.message}`);
    }
  }

  // Verificar se thumbnail personalizada existe
  async hasThumbnail(videoId: string): Promise<boolean> {
    try {
      const response = await fetch(this.getThumbnailUrl(videoId), { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // Deletar thumbnail personalizada (volta para thumbnail automática)
  async deleteThumbnail(videoId: string): Promise<void> {
    try {
      const response = await bunnyApi.delete(
        `/library/${BUNNY_LIBRARY_ID}/videos/${videoId}/thumbnail`
      );
      return response.data;
    } catch (error: any) {
      console.error(`❌ Erro ao remover thumbnail do vídeo ${videoId}:`, error);
      throw new Error(`Erro ao remover thumbnail: ${error.response?.data?.message || error.message}`);
    }
  }
}

export default new BunnyStreamService();
