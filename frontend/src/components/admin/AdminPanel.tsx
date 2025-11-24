import React, { useState, useEffect } from 'react';
import { Upload, Play, Trash2, Edit, Plus, RefreshCw, Home } from 'lucide-react';
import bunnyStreamService, { Video } from '../../services/bunnyStreamApi';
import VideoUploadSimple from './VideoUploadSimple';
import VideoPlayerSimple from './VideoPlayerSimple';
import VideoEditor from './VideoEditor';
import HomeVideosManager from './HomeVideosManager';
import Alert from '../common/Alert';
import ConfirmDialog from '../common/ConfirmDialog';
import { useAlert } from '../../hooks/useAlert';
import { useConfirm } from '../../hooks/useConfirm';
import { apiService, User as ApiUser } from '../../services/api';

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

  // Lista de URLs de thumbnail priorizadas pelo serviço (usa fileName quando disponível)
  const thumbnailUrls = bunnyStreamService
    .getPreferredThumbnailUrlsFromVideo(video)
    .map((url) => (url.includes('?') ? `${url}&cb=${forceRefresh}` : `${url}?cb=${forceRefresh}`));

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
          onError={() => {
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
            if (currentThumbnailIndex < thumbnailUrls.length - 1) {
              setCurrentThumbnailIndex(prev => prev + 1);
            } else {
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
  const [activeTab, setActiveTab] = useState<'videos' | 'home'>('videos');
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [showVideoEditor, setShowVideoEditor] = useState(false);
  const [selectedVideoForEdit, setSelectedVideoForEdit] = useState<Video | null>(null);
  const { alert, showSuccess, showError, hideAlert } = useAlert();
  const { confirm, showConfirm } = useConfirm();
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [adminForm, setAdminForm] = useState({ name: '', email: '', password: '' });
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [admins, setAdmins] = useState<ApiUser[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);

  useEffect(() => {
    loadVideos();
    loadAdmins();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const response = await bunnyStreamService.getVideos();
      setVideos(response.items);
    } catch (error) {
      console.error('Erro ao carregar vídeos:', error);
      showError('Erro ao carregar vídeos', 'Verifique suas credenciais da API.');
    } finally {
      setLoading(false);
    }
  };

  const loadAdmins = async () => {
    try {
      setLoadingAdmins(true);
      const list = await apiService.getAdmins();
      setAdmins(list);
    } catch (error) {
      // silencioso na UI principal; erros serão tratados quando tentar criar admin
      console.error('Erro ao carregar admins:', error);
    } finally {
      setLoadingAdmins(false);
    }
  };

  const handleCreateAdmin = async () => {
    try {
      setCreatingAdmin(true);
      await apiService.createAdmin(adminForm);
      showSuccess('Administrador criado', 'O novo administrador foi cadastrado com sucesso.');
      setShowCreateAdmin(false);
      setAdminForm({ name: '', email: '', password: '' });
    } catch (error: any) {
      const message = error?.payload?.message || error?.message || 'Erro ao criar administrador';
      showError('Erro', message);
    } finally {
      setCreatingAdmin(false);
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
          showError('Erro ao deletar', 'Não foi possível deletar o vídeo.');
        }
      },
      {
        confirmText: 'Deletar',
        cancelText: 'Cancelar',
        type: 'danger'
      }
    );
  };

  const getRealVideoStatus = (video: Video) => {
    const hasResolutions = !!(video.availableResolutions && video.availableResolutions.trim().length > 0);

    if (hasResolutions) {
      return { status: 3, text: 'Pronto', color: 'text-green-500', bgColor: 'bg-green-500/90' };
    }

    switch (video.status) {
      case 0: return { status: 0, text: 'Aguardando Upload', color: 'text-gray-500', bgColor: 'bg-gray-500/90' };
      case 1: return { status: 1, text: 'Processando Vídeo', color: 'text-blue-500', bgColor: 'bg-blue-500/90' };
      case 2: return { status: 2, text: 'Falha no Processamento', color: 'text-red-500', bgColor: 'bg-red-500/90' };
      case 3: return { status: 4, text: 'Criando Resoluções', color: 'text-purple-500', bgColor: 'bg-purple-500/90' };
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

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
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
      
      {/* Header Moderno */}
      <div className="relative z-10 container mx-auto px-6 py-8">
        <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-6">
            <div className="text-center lg:text-left">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent mb-2">
                HOLYPLAY
              </h1>
              <p className="text-gray-400 text-lg">Painel de Administração de Conteúdo</p>
              <p className="text-gray-500 text-sm mt-1">Gerencie seus vídeos e configure sua biblioteca</p>
            </div>
            
            {activeTab === 'videos' && (
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setShowUpload(true)}
                  className="group bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-4 rounded-xl flex items-center gap-3 transition-all duration-200 font-semibold shadow-lg hover:shadow-red-500/25 transform hover:scale-105"
                >
                  <div className="p-1 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                    <Plus size={20} />
                  </div>
                  <span>Adicionar Vídeo</span>
                </button>
                <button
                  onClick={() => setShowCreateAdmin(true)}
                  className="group bg-gray-700/50 hover:bg-gray-600 text-gray-300 hover:text-white px-8 py-4 rounded-xl flex items-center gap-3 transition-all duration-200 font-semibold border border-gray-600/50 hover:border-gray-500"
                >
                  <div className="p-1 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                    <Plus size={20} />
                  </div>
                  <span>Adicionar Admin</span>
                </button>
                <button
                  onClick={loadVideos}
                  disabled={loading}
                  className="group bg-gray-700/50 hover:bg-gray-600 text-gray-300 hover:text-white px-6 py-4 rounded-xl flex items-center gap-3 transition-all duration-200 font-medium border border-gray-600/50 hover:border-gray-500"
                >
                  <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                  <span>Atualizar Lista</span>
                </button>
              </div>
            )}
          </div>

          {/* Tabs Navigation */}
          <div className="flex space-x-1 bg-gray-800/50 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('videos')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-md font-semibold transition-all ${
                activeTab === 'videos'
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <Upload className="w-5 h-5" />
              <span>Gerenciar Vídeos</span>
            </button>
            <button
              onClick={() => setActiveTab('home')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-md font-semibold transition-all ${
                activeTab === 'home'
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <Home className="w-5 h-5" />
              <span>Configurar Home</span>
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo baseado na tab ativa */}
      <div className="relative z-10 container mx-auto px-6 pb-16">
        {activeTab === 'videos' && (
          <>
            {/* Stats Section */}
            <div className="mb-12">
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

            {/* Admins Section */}
            <div className="mb-12">
              <div className="bg-black/40 backdrop-blur-sm border border-gray-800 p-6 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-300">Administradores</h3>
                  <button
                    onClick={loadAdmins}
                    disabled={loadingAdmins}
                    className="text-sm px-3 py-1 rounded-md bg-gray-700/60 hover:bg-gray-700 text-gray-200 border border-gray-600/60 disabled:opacity-60"
                  >
                    {loadingAdmins ? 'Atualizando...' : 'Atualizar'}
                  </button>
                </div>
                {admins.length === 0 ? (
                  <div className="text-gray-500 text-sm">Nenhum administrador cadastrado.</div>
                ) : (
                  <ul className="divide-y divide-gray-800">
                    {admins.map((adm) => (
                      <li key={adm.id} className="py-2 flex items-center justify-between">
                        <div>
                          <div className="text-white font-medium">{adm.name}</div>
                          <div className="text-gray-400 text-sm">{adm.email}</div>
                        </div>
                        <span className="text-xs text-gray-400">{new Date(adm.createdAt).toLocaleDateString('pt-BR')}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Videos Grid */}
            <div>
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
                          >
                            <Play size={24} className="text-white" fill="white" />
                          </button>
                        </div>

                        {/* Action Buttons */}
                        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setSelectedVideoForEdit(video);
                              setShowVideoEditor(true);
                            }}
                            className="bg-gray-700/90 hover:bg-blue-600 p-2 rounded-full backdrop-blur-sm transition-colors"
                          >
                            <Edit size={16} className="text-white" />
                          </button>
                          <button
                            onClick={() => handleDeleteVideo(video.videoId)}
                            className="bg-gray-700/90 hover:bg-red-600 p-2 rounded-full backdrop-blur-sm transition-colors"
                          >
                            <Trash2 size={16} className="text-white" />
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h3 className="font-bold text-lg mb-2 text-white truncate">{video.title}</h3>
                        
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
          </>
        )}

        {/* Tab Configurar Home */}
        {activeTab === 'home' && (
          <HomeVideosManager />
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

      {/* Create Admin Modal */}
      {showCreateAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70" onClick={() => !creatingAdmin && setShowCreateAdmin(false)} />
          <div className="relative z-10 w-full max-w-md bg-gray-900 border border-gray-700 rounded-2xl p-6 shadow-xl">
            <h3 className="text-xl font-semibold mb-4 text-white">Adicionar Administrador</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Nome</label>
                <input
                  type="text"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                  value={adminForm.name}
                  onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                  disabled={creatingAdmin}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                  disabled={creatingAdmin}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Senha</label>
                <input
                  type="password"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                  value={adminForm.password}
                  onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                  disabled={creatingAdmin}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800"
                onClick={() => setShowCreateAdmin(false)}
                disabled={creatingAdmin}
              >
                Cancelar
              </button>
              <button
                className={`px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white ${creatingAdmin ? 'opacity-70 cursor-not-allowed' : ''}`}
                onClick={handleCreateAdmin}
                disabled={creatingAdmin}
              >
                {creatingAdmin ? 'Criando...' : 'Criar Admin'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPlayer && selectedVideo && (
        <VideoPlayerSimple
          video={selectedVideo}
          onClose={() => {
            setShowPlayer(false);
            setSelectedVideo(null);
          }}
          onStatusChange={(videoId, newStatus, newResolutions) => {
            setVideos(prevVideos => 
              prevVideos.map(v => 
                v.videoId === videoId 
                  ? { ...v, status: newStatus, availableResolutions: newResolutions }
                  : v
              )
            );
          }}
        />
      )}

      {/* Video Editor */}
      {selectedVideoForEdit && (
        <VideoEditor
          video={selectedVideoForEdit}
          isOpen={showVideoEditor}
          onClose={() => {
            setShowVideoEditor(false);
            setSelectedVideoForEdit(null);
          }}
          onVideoUpdated={(updatedVideo) => {
            setVideos(prevVideos => 
              prevVideos.map(v => 
                v.videoId === updatedVideo.videoId ? updatedVideo : v
              )
            );
            setTimeout(() => {
              loadVideos();
            }, 1000);
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
    </div>
  );
};

export default AdminPanel;
