import React, { useState, useEffect } from 'react';
import { Upload, Play, Trash2, Edit, Plus, Image } from 'lucide-react';
import bunnyStreamService, { Video } from '../../services/bunnyStreamApi';
import VideoUploadSimple from './VideoUploadSimple';
import VideoPlayerSimple from './VideoPlayerSimple';
import ThumbnailManager from './ThumbnailManager';
import Alert from '../common/Alert';
import ConfirmDialog from '../common/ConfirmDialog';
import { useAlert } from '../../hooks/useAlert';
import { useConfirm } from '../../hooks/useConfirm';

// Célula de Thumbnail: renderiza a thumbnail do vídeo com fallbacks
type ThumbPrefs = {
  mode: 'cover';
  posX: number; // 0..100
  posY: number; // 0..100
};

const getThumbPrefs = (videoId: string): ThumbPrefs => {
  try {
    const raw = localStorage.getItem(`thumb_prefs_${videoId}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { mode: 'cover', posX: 50, posY: 50 };
};

const ThumbnailCell: React.FC<{ video: Video }> = ({ video }) => {
  const [currentThumbnailIndex, setCurrentThumbnailIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [forceRefresh, setForceRefresh] = useState(0);
  const [apiThumbUrl, setApiThumbUrl] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<ThumbPrefs>(getThumbPrefs(video.videoId));
  
  useEffect(() => {
    setForceRefresh(Date.now());
    setHasError(false);
    setCurrentThumbnailIndex(0);
    // Limpa blob anterior quando trocar de vídeo/thumbnail
    if (apiThumbUrl) {
      URL.revokeObjectURL(apiThumbUrl);
      setApiThumbUrl(null);
    }
    // Recarrega preferências quando trocar de vídeo
    setPrefs(getThumbPrefs(video.videoId));
  }, [video.thumbnailUrl, video.videoId]);

  // Sempre renderiza imagem estática (sem iframe) para manter visual limpo como no painel
  
  // Lista de URLs de thumbnail priorizadas pelo serviço (usa fileName quando disponível)
  const thumbnailUrls = bunnyStreamService
    .getPreferredThumbnailUrlsFromVideo(video)
    .map((url) => (url.includes('?') ? `${url}&cb=${forceRefresh}` : `${url}?cb=${forceRefresh}`));

  console.log(`🔍 URLs de thumbnail para ${video.videoId}:`, thumbnailUrls);
  

  // Fallback simples para quando não há thumbnail disponível
  if ((hasError && !apiThumbUrl) || thumbnailUrls.length === 0) {
    const isProcessing = video.status !== 3 && (!video.availableResolutions || video.availableResolutions.trim().length === 0);
    
    return (
      <div className="w-full aspect-video rounded overflow-hidden bg-gray-700 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <Play size={24} className="mx-auto mb-1" />
          <div className="text-xs">
            {isProcessing ? 'Processando...' : 'Sem thumbnail'}
          </div>
          <div className="text-xs mt-1 text-blue-400">
            Status: {video.status}
          </div>
        </div>
      </div>
    );
  }

  // TESTE: Usar uma imagem simples para debug
  if (thumbnailUrls.length === 0) {
    console.log(`⚠️ Nenhuma URL de thumbnail disponível para ${video.videoId}`);
  }

  const objectFitClass = 'object-cover';
  const objectPosition = `${Math.max(0, Math.min(100, prefs.posX))}% ${Math.max(0, Math.min(100, prefs.posY))}%`;

  return (
    <div className="w-full aspect-video rounded overflow-hidden bg-gray-800 relative border border-gray-600">
      {apiThumbUrl ? (
        <img
          key={`${video.videoId}-api-${forceRefresh}`}
          src={apiThumbUrl}
          alt={`Thumbnail ${video.title}`}
          className={`w-full h-full ${objectFitClass}`}
          style={{ objectPosition }}
          onLoad={() => console.log(`✅ Thumbnail via API (blob) carregada para ${video.videoId}`)}
          onError={() => {
            console.log(`❌ Falha ao carregar blob de thumbnail para ${video.videoId}`);
            setHasError(true);
          }}
        />
      ) : thumbnailUrls.length > 0 ? (
        <img
          key={`${video.videoId}-${currentThumbnailIndex}-${forceRefresh}`}
          src={thumbnailUrls[currentThumbnailIndex]}
          alt={`Thumbnail ${video.title}`}
          className={`w-full h-full ${objectFitClass}`}
          style={{ objectPosition }}
          onError={() => {
            console.log(`❌ Erro ao carregar thumbnail ${currentThumbnailIndex + 1}/${thumbnailUrls.length} para ${video.videoId}:`, {
              failedUrl: thumbnailUrls[currentThumbnailIndex],
              nextUrl: thumbnailUrls[currentThumbnailIndex + 1] || 'Nenhuma'
            });
            
            if (currentThumbnailIndex < thumbnailUrls.length - 1) {
              setCurrentThumbnailIndex(prev => prev + 1);
            } else {
              console.log(`❌ Todas as ${thumbnailUrls.length} URLs falharam para ${video.videoId}. Tentando fallback via API (blob)...`);
              // Tenta carregar via API (blob)
              bunnyStreamService.getThumbnailObjectUrl(video.videoId, 640)
                .then((url) => {
                  if (url) {
                    setApiThumbUrl(url);
                    setHasError(false);
                  } else {
                    setHasError(true);
                  }
                })
                .catch(() => setHasError(true));
            }
          }}
          onLoad={() => {
            console.log(`✅ Thumbnail carregada com sucesso para ${video.videoId}:`, thumbnailUrls[currentThumbnailIndex]);
            setHasError(false);
          }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          <div className="text-center">
            <Play size={20} />
            <div className="text-xs mt-1">Sem thumb</div>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminPanel: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [showThumbnailManager, setShowThumbnailManager] = useState(false);
  const [selectedVideoForThumbnail, setSelectedVideoForThumbnail] = useState<Video | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const { alert, showSuccess, showError, hideAlert } = useAlert();
  const { confirm, showConfirm } = useConfirm();

  useEffect(() => {
    loadVideos();
  }, []);

  // Busca a descrição salva no backend por videoId
  const getBackendDescription = async (videoId: string): Promise<string | null> => {
    try {
      const resp = await fetch(`/api/videos/${videoId}/description`);
      if (!resp.ok) {
        if (resp.status === 304) return null;
        return null;
      }
      const ct = resp.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const data = await resp.json();
        if (data && typeof data.description === 'string') return data.description;
        // Caso o backend envie direto a string dentro do JSON
        if (typeof data === 'string') return data || null;
        return null;
      } else {
        const text = (await resp.text()).trim();
        return text.length > 0 ? text : null;
      }
    } catch (e) {
      return null;
    }
  };

  // Função para verificar se há vídeos em processamento
  const hasProcessingVideos = (videoList: Video[]): boolean => {
    return videoList.some(video => {
      const realStatus = getRealVideoStatus(video);
      return realStatus.status === 1 || realStatus.status === 4 || realStatus.status === 0;
    });
  };

  // Função para atualizar apenas os vídeos em processamento
  const updateProcessingVideos = async () => {
    if (isPolling) return; // Evita polling simultâneo
    
    setIsPolling(true);
    try {
      const processingVideos = videos.filter(video => {
        const realStatus = getRealVideoStatus(video);
        return realStatus.status === 1 || realStatus.status === 4 || realStatus.status === 0;
      });

      if (processingVideos.length === 0) {
        setIsPolling(false);
        return;
      }

      console.log(`🔄 Verificando status de ${processingVideos.length} vídeos em processamento...`);

      // Atualiza apenas os vídeos em processamento
      const updatedVideos = await Promise.all(
        processingVideos.map(async (video) => {
          try {
            const detail = await bunnyStreamService.getVideo(video.videoId);
            const updatedVideo = {
              ...video,
              status: detail.status ?? video.status,
              availableResolutions: detail.availableResolutions || video.availableResolutions,
              thumbnailUrl: detail.thumbnailUrl || video.thumbnailUrl,
            };

            // Verifica se o vídeo ficou pronto
            const oldStatus = getRealVideoStatus(video);
            const newStatus = getRealVideoStatus(updatedVideo);
            
            if (oldStatus.status !== 3 && newStatus.status === 3) {
              console.log(`✅ Vídeo "${video.title}" ficou pronto!`);
              showSuccess('Vídeo Pronto!', `"${video.title}" foi processado com sucesso.`);
            }

            return updatedVideo;
          } catch (error) {
            console.log(`❌ Erro ao verificar status do vídeo ${video.videoId}:`, error);
            return video; // Mantém o vídeo original se der erro
          }
        })
      );

      // Atualiza a lista de vídeos
      setVideos(prevVideos => {
        const videoMap = new Map(updatedVideos.map(v => [v.videoId, v]));
        return prevVideos.map(v => videoMap.get(v.videoId) || v);
      });

    } catch (error) {
      console.error('Erro no polling de vídeos:', error);
    } finally {
      setIsPolling(false);
    }
  };

  // Effect para polling automático
  useEffect(() => {
    if (!videos.length) return;

    const shouldPoll = hasProcessingVideos(videos);
    if (!shouldPoll) return;

    console.log('🎬 Iniciando polling automático para vídeos em processamento...');

    const interval = setInterval(() => {
      updateProcessingVideos();
    }, 5000); // Verifica a cada 5 segundos

    return () => {
      console.log('⏹️ Parando polling automático');
      clearInterval(interval);
    };
  }, [videos, isPolling]);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const response = await bunnyStreamService.getVideos();
      

      // Enriquecer SEMPRE com detalhes (garante thumbnailUrl correto e status/resoluções atualizados)
      const enriched = await Promise.all(
        response.items.map(async (v) => {
          try {
            const detail = await bunnyStreamService.getVideo(v.videoId);
            // Busca descrição do backend e prioriza sobre a da Bunny
            const backendDesc = await getBackendDescription(v.videoId);
            return {
              ...v,
              title: detail.title || v.title,
              description: backendDesc ?? detail.description ?? v.description,
              thumbnailUrl: detail.thumbnailUrl || v.thumbnailUrl,
              availableResolutions: detail.availableResolutions || v.availableResolutions,
              status: detail.status ?? v.status,
              length: detail.length ?? v.length,
              width: detail.width ?? v.width,
              height: detail.height ?? v.height,
              views: detail.views ?? v.views,
              storageSize: detail.storageSize ?? v.storageSize,
              dateUploaded: detail.dateUploaded || v.dateUploaded,
            } as Video;
          } catch (error) {
            return v;
          }
        })
      );

      setVideos(enriched);
    } catch (error) {
      console.error('Erro ao carregar vídeos:', error);
      showError('Erro ao carregar vídeos', 'Verifique suas credenciais da API.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    showConfirm(
      'Deletar Vídeo',
      'Tem certeza que deseja deletar este vídeo? Esta ação não pode ser desfeita.',
      async () => {
        try {
          await bunnyStreamService.deleteVideo(videoId);
          setVideos(videos.filter(video => video.videoId !== videoId));
          showSuccess('Vídeo deletado!', 'O vídeo foi removido com sucesso.');
        } catch (error: any) {
          console.error('Erro ao deletar vídeo:', error);
          
          // Se for erro 404, remove da lista local (vídeo fantasma)
          if (error.response?.status === 404) {
            setVideos(videos.filter(video => video.videoId !== videoId));
            showSuccess('Vídeo removido', 'Vídeo fantasma removido da lista (não existia mais na API).');
          } else {
            showError('Erro ao deletar', 'Não foi possível deletar o vídeo.');
          }
        }
      },
      {
        confirmText: 'Deletar',
        cancelText: 'Cancelar',
        type: 'danger'
      }
    );
  };

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Função para determinar o status real baseado em múltiplos fatores
  const getRealVideoStatus = (video: Video) => {
    const hasResolutions = !!(video.availableResolutions && video.availableResolutions.trim().length > 0);

    // Regra principal: só é PRONTO se já houver resoluções disponíveis
    if (hasResolutions) {
      return { status: 3, text: 'Pronto', color: 'text-green-500', bgColor: 'bg-green-500/90' };
    }

    // Sem resoluções ainda: tratar como processando, mesmo que a API já reporte 3
    if (video.status === 3) {
      // Após upload, a API pode marcar 3 antes das resoluções
      return { status: 4, text: 'Criando Resoluções', color: 'text-purple-500', bgColor: 'bg-purple-500/90' };
    }

    // Se status é 2 (falha) mas muito recente, considerar ainda processando
    if (video.status === 2) {
      const uploadTime = new Date(video.dateUploaded).getTime();
      const now = new Date().getTime();
      const timeDiff = now - uploadTime;
      const thirtyMinutes = 30 * 60 * 1000;
      if (timeDiff < thirtyMinutes) {
        return { status: 1, text: 'Processando Vídeo', color: 'text-blue-500', bgColor: 'bg-blue-500/90' };
      }
      return { status: 2, text: 'Falha no Processamento', color: 'text-red-500', bgColor: 'bg-red-500/90' };
    }

    // Demais status sem resoluções
    switch (video.status) {
      case 0: return { status: 0, text: 'Aguardando Upload', color: 'text-gray-500', bgColor: 'bg-gray-500/90' };
      case 1: return { status: 1, text: 'Processando Vídeo', color: 'text-blue-500', bgColor: 'bg-blue-500/90' };
      case 4: return { status: 4, text: 'Criando Resoluções', color: 'text-purple-500', bgColor: 'bg-purple-500/90' };
      default: return { status: video.status, text: 'Status Desconhecido', color: 'text-gray-500', bgColor: 'bg-gray-500/90' };
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40"></div>
        <div className="relative z-10 text-center">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
            HOLYPLAY
          </h1>
          <div className="text-xl text-gray-300 mb-8">Carregando biblioteca...</div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background com gradiente */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40"></div>
      
      {/* Hero Section */}
      <div className="relative z-10">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
              HOLYPLAY
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto">
              Painel de Administração de Conteúdo
            </p>
            {hasProcessingVideos(videos) && (
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                <span className="text-red-400 text-sm">
                  Monitorando {videos.filter(v => {
                    const realStatus = getRealVideoStatus(v);
                    return realStatus.status === 1 || realStatus.status === 4 || realStatus.status === 0;
                  }).length} vídeo(s) em processamento...
                </span>
              </div>
            )}
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => setShowUpload(true)}
                className="bg-red-600 hover:bg-red-700 px-8 py-4 rounded-lg flex items-center gap-3 transition-all transform hover:scale-105 font-semibold text-lg"
              >
                <Plus size={24} />
                Novo Vídeo
              </button>
              <button
                onClick={() => {
                  loadVideos();
                  showSuccess('Lista atualizada!', 'Os vídeos foram recarregados com sucesso.');
                }}
                className="bg-gray-700/80 hover:bg-gray-600/80 px-8 py-4 rounded-lg flex items-center gap-3 transition-all backdrop-blur-sm font-semibold text-lg"
              >
                🔄 Atualizar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative z-10 container mx-auto px-6 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-black/40 backdrop-blur-sm border border-gray-800 p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-2 text-gray-300">Total de Vídeos</h3>
            <p className="text-3xl font-bold text-red-400">{videos.length}</p>
          </div>
          <div className="bg-black/40 backdrop-blur-sm border border-gray-800 p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-2 text-gray-300">Vídeos Prontos</h3>
            <p className="text-3xl font-bold text-red-400">
              {videos.filter(v => getRealVideoStatus(v).status === 3).length}
            </p>
          </div>
          <div className="bg-black/40 backdrop-blur-sm border border-gray-800 p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-2 text-gray-300">Processando</h3>
            <p className="text-3xl font-bold text-red-400">
              {videos.filter(v => {
                const realStatus = getRealVideoStatus(v);
                return realStatus.status === 1 || realStatus.status === 4 || realStatus.status === 0;
              }).length}
            </p>
          </div>
          <div className="bg-black/40 backdrop-blur-sm border border-gray-800 p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-2 text-gray-300">Total de Views</h3>
            <p className="text-3xl font-bold text-red-400">
              {videos.reduce((sum, v) => sum + v.views, 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Videos Grid */}
      <div className="relative z-10 container mx-auto px-6 pb-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Biblioteca de Conteúdo</h2>
        
        {videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video) => (
              <div key={video.videoId} className="group relative bg-black/40 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden hover:border-red-500/50 transition-all duration-300 hover:scale-105">
                {/* Thumbnail */}
                <div className="relative aspect-video">
                  <ThumbnailCell video={video} />
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    {(() => {
                      const realStatus = getRealVideoStatus(video);
                      const isProcessing = realStatus.status === 1 || realStatus.status === 4 || realStatus.status === 0;
                      return (
                        <div className="flex items-center gap-2">
                          <span className={`text-white text-xs px-2 py-1 rounded-full font-medium backdrop-blur-sm ${realStatus.bgColor} ${isProcessing ? 'animate-pulse' : ''}`}>
                            {realStatus.text}
                          </span>
                          {isProcessing && (
                            <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Botão de Play Central */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                    <button
                      onClick={() => {
                        setSelectedVideo(video);
                        setShowPlayer(true);
                      }}
                      className="bg-red-600/90 hover:bg-red-700 p-4 rounded-full backdrop-blur-sm transition-all transform hover:scale-110"
                      title={getRealVideoStatus(video).status === 3 ? 'Assistir' : 'Assistir (ainda processando)'}
                    >
                      <Play size={24} className="text-white" fill="white" />
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setSelectedVideoForThumbnail(video);
                        setShowThumbnailManager(true);
                      }}
                      className="bg-gray-700/90 hover:bg-blue-600 p-2 rounded-full backdrop-blur-sm transition-colors"
                      title="Gerenciar Thumbnail"
                    >
                      <Image size={16} className="text-white" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedVideo(video);
                        // Implementar modal de edição
                      }}
                      className="bg-gray-700/90 hover:bg-gray-600 p-2 rounded-full backdrop-blur-sm transition-colors"
                      title="Editar"
                    >
                      <Edit size={16} className="text-white" />
                    </button>
                    <button
                      onClick={() => handleDeleteVideo(video.videoId)}
                      className="bg-gray-700/90 hover:bg-red-600 p-2 rounded-full backdrop-blur-sm transition-colors"
                      title="Deletar"
                    >
                      <Trash2 size={16} className="text-white" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 text-white truncate">{video.title}</h3>
                  {video.description && (
                    <details className="mb-3">
                      <summary className="text-sm text-gray-300 cursor-pointer select-none">Ver descrição</summary>
                      <div className="mt-2 text-gray-400 text-sm whitespace-pre-wrap">
                        {video.description}
                      </div>
                    </details>
                  )}
                  
                  {/* Stats */}
                  <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                    <span>{formatDuration(video.length)}</span>
                    <span>{video.width || 0}x{video.height || 0}</span>
                    <span>{formatFileSize(video.storageSize || 0)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>{video.views.toLocaleString()} views</span>
                    <span>{new Date(video.dateUploaded).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-black/40 backdrop-blur-sm border border-gray-800 rounded-xl p-12 max-w-md mx-auto">
              <Upload size={64} className="mx-auto text-gray-500 mb-6" />
              <h3 className="text-2xl font-bold mb-4 text-white">Nenhum vídeo encontrado</h3>
              <p className="text-gray-400 mb-8">Comece fazendo upload do seu primeiro vídeo</p>
              <button
                onClick={() => setShowUpload(true)}
                className="bg-red-600 hover:bg-red-700 px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105"
              >
                <Plus size={20} className="inline mr-2" />
                Fazer Upload
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showUpload && (
        <VideoUploadSimple
          onClose={() => setShowUpload(false)}
          onSuccess={() => {
            setShowUpload(false);
            loadVideos();
          }}
        />
      )}

      {showPlayer && selectedVideo && (
        <VideoPlayerSimple
          video={selectedVideo!}
          onClose={() => {
            setShowPlayer(false);
            setSelectedVideo(null);
          }}
          onStatusChange={(videoId, newStatus, newResolutions) => {
            // Atualiza o vídeo na lista local
            setVideos(prevVideos => 
              prevVideos.map(v => 
                v.videoId === videoId 
                  ? { ...v, status: newStatus, availableResolutions: newResolutions }
                  : v
              )
            );
            
            // Se o vídeo ficou pronto, mostra notificação
            if (newStatus === 3 || (newResolutions && newResolutions.trim().length > 0)) {
              console.log(`✅ Vídeo ${videoId} ficou pronto!`);
            }
          }}
        />
      )}

      {/* Alert Component */}
      <Alert
        type={alert.type}
        title={alert.title}
        message={alert.message}
        isOpen={alert.isOpen}
        onClose={hideAlert}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirm.isOpen}
        title={confirm.title}
        message={confirm.message}
        confirmText={confirm.confirmText}
        cancelText={confirm.cancelText}
        type={confirm.type}
        onConfirm={confirm.onConfirm}
        onCancel={confirm.onCancel}
      />

      {/* Thumbnail Manager */}
      {selectedVideoForThumbnail && (
        <ThumbnailManager
          video={selectedVideoForThumbnail}
          isOpen={showThumbnailManager}
          onClose={() => {
            setShowThumbnailManager(false);
            setSelectedVideoForThumbnail(null);
          }}
          onThumbnailUpdated={() => {
            console.log('🔄 Thumbnail atualizada, recarregando lista de vídeos...');
            
            // Recarrega a lista completa imediatamente para pegar o thumbnailFileName atualizado
            loadVideos();
            
            // Força atualização visual com cache busting
            const timestamp = Date.now();
            setTimeout(() => {
              setVideos(prevVideos => 
                prevVideos.map(v => {
                  if (v.videoId === selectedVideoForThumbnail?.videoId) {
                    // Adiciona cache busting à URL existente
                    const currentUrl = v.thumbnailUrl || '';
                    const separator = currentUrl.includes('?') ? '&' : '?';
                    return { 
                      ...v, 
                      thumbnailUrl: `${currentUrl}${separator}cb=${timestamp}`
                    };
                  }
                  return v;
                })
              );
            }, 1000);
          }}
        />
      )}
    </div>
  );
};

export default AdminPanel;
