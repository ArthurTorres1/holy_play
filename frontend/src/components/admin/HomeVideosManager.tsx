import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Plus, 
  Trash2, 
  Save, 
  X, 
  Eye,
  Star,
  Clock,
  Users,
  RefreshCw
} from 'lucide-react';
import bunnyStreamService, { Video as BunnyVideo } from '../../services/bunnyStreamApi';
import { homeConfigApi, HomeConfigurationRequest } from '../../services/homeConfigApi';

interface HomeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  category: string;
  isNew?: boolean;
  isFeatured?: boolean;
  isVisible?: boolean;
}

interface HomeSection {
  id: string;
  name: string;
  title: string;
  videos: HomeVideo[];
  maxVideos: number;
}

const HomeVideosManager: React.FC = () => {
  const [sections, setSections] = useState<HomeSection[]>([
    {
      id: 'hero',
      name: 'Vídeo Principal (Hero)',
      title: 'Vídeo em Destaque',
      videos: [],
      maxVideos: 1
    },
    {
      id: 'new',
      name: 'Novos Lançamentos',
      title: 'Novos Conteúdos',
      videos: [],
      maxVideos: 6
    },
    {
      id: 'popular',
      name: 'Populares',
      title: 'Mais Assistidos',
      videos: [],
      maxVideos: 6
    },
    {
      id: 'featured',
      name: 'Em Destaque',
      title: 'Conteúdo em Destaque',
      videos: [],
      maxVideos: 6
    }
  ]);

  const [availableVideos, setAvailableVideos] = useState<HomeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedSection, setSelectedSection] = useState<string>('hero');
  const [isAddingVideo, setIsAddingVideo] = useState(false);

  // Função para carregar vídeos da API
  useEffect(() => {
    loadVideos();
  }, []);

  // Carregar configurações após vídeos estarem disponíveis
  useEffect(() => {
    if (availableVideos.length > 0) {
      loadHomeConfigurations();
    }
  }, [availableVideos]);

  const loadHomeConfigurations = async () => {
    try {
      setLoading(true);
      setError(null);
      const configurations = await homeConfigApi.getAllConfigurations();
      
      if (configurations.length > 0) {
        // Atualizar seções com dados do backend
        setSections(prev => prev.map(section => {
          const backendConfig = configurations.find(c => c.sectionId === section.id);
          if (backendConfig) {
            // Converter IDs de vídeos para objetos HomeVideo
            const sectionVideos = backendConfig.videoIds
              .map(videoId => availableVideos.find(v => v.id === videoId))
              .filter(video => video !== undefined) as HomeVideo[];
            
            return {
              ...section,
              name: backendConfig.sectionName,
              videos: sectionVideos,
              maxVideos: backendConfig.maxVideos
            };
          }
          return section;
        }));
      } else {
        // Nenhuma configuração encontrada, usando padrões
      }
    } catch (error: any) {
      console.error('❌ Erro ao carregar configurações da home:', error);
      setError(`Erro ao carregar configurações da home: ${error?.message || 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const loadVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await bunnyStreamService.getVideos();
      
      // Converter vídeos da API para o formato HomeVideo
      // Por enquanto, vamos mostrar TODOS os vídeos para debug
      const homeVideos: HomeVideo[] = response.items
        .map(video => ({
          id: video.videoId,
          title: video.title,
          description: video.description || '',
          thumbnail: getThumbnailUrl(video),
          duration: formatDuration(video.length),
          category: getVideoCategory(video),
          isNew: isNewVideo(video),
          isFeatured: false,
          isVisible: true
        }));

      setAvailableVideos(homeVideos);
    } catch (error: any) {
      console.error('❌ Erro ao carregar vídeos:', error);
      setError(`Erro ao carregar vídeos: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  // Função para obter URL da thumbnail
  const getThumbnailUrl = (video: BunnyVideo): string => {
    const urls = bunnyStreamService.getPreferredThumbnailUrlsFromVideo(video);
    return urls.length > 0 ? urls[0] : '/api/placeholder/300/200';
  };

  // Função para formatar duração
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
  };

  // Função para determinar categoria baseada no título ou outras propriedades
  const getVideoCategory = (video: BunnyVideo): string => {
    const title = video.title.toLowerCase();
    if (title.includes('filme') || title.includes('movie')) return 'Filme';
    if (title.includes('série') || title.includes('series')) return 'Série';
    if (title.includes('documentário') || title.includes('documentary')) return 'Documentário';
    if (title.includes('musical') || title.includes('louvor')) return 'Musical';
    if (title.includes('biografia')) return 'Biografia';
    return 'Vídeo';
  };

  // Função para determinar se é um vídeo novo (últimos 30 dias)
  const isNewVideo = (video: BunnyVideo): boolean => {
    const uploadDate = new Date(video.dateUploaded);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return uploadDate > thirtyDaysAgo;
  };

  const addVideoToSection = (sectionId: string, video: HomeVideo) => {
    setSections(prev => prev.map(section => {
      if (section.id === sectionId && section.videos.length < section.maxVideos) {
        // Verificar se o vídeo já está na seção
        const videoExists = section.videos.some(v => v.id === video.id);
        if (!videoExists) {
          return {
            ...section,
            videos: [...section.videos, video]
          };
        }
      }
      return section;
    }));
    setIsAddingVideo(false);
  };

  const removeVideoFromSection = (sectionId: string, videoId: string) => {
    setSections(prev => prev.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          videos: section.videos.filter(v => v.id !== videoId)
        };
      }
      return section;
    }));
  };

  const moveVideo = (sectionId: string, videoIndex: number, direction: 'up' | 'down') => {
    setSections(prev => prev.map(section => {
      if (section.id === sectionId) {
        const newVideos = [...section.videos];
        const targetIndex = direction === 'up' ? videoIndex - 1 : videoIndex + 1;
        
        if (targetIndex >= 0 && targetIndex < newVideos.length) {
          [newVideos[videoIndex], newVideos[targetIndex]] = [newVideos[targetIndex], newVideos[videoIndex]];
        }
        
        return {
          ...section,
          videos: newVideos
        };
      }
      return section;
    }));
  };

  const getCurrentSection = () => {
    return sections.find(s => s.id === selectedSection);
  };

  const getAvailableVideosForSection = () => {
    const currentSection = getCurrentSection();
    if (!currentSection) return [];
    
    return availableVideos.filter(video => 
      !currentSection.videos.some(v => v.id === video.id)
    );
  };

  // Função para salvar todas as configurações no backend
  const saveAllConfigurations = async () => {
    try {
      setLoading(true);

      // Salvar cada seção
      for (const section of sections) {
        const configRequest: HomeConfigurationRequest = {
          sectionId: section.id,
          sectionName: section.name,
          videoIds: section.videos.map(v => v.id),
          maxVideos: section.maxVideos
        };

        await homeConfigApi.saveConfiguration(configRequest);
      }

      alert('Configurações salvas com sucesso!');
      
    } catch (error: any) {
      console.error('❌ Erro ao salvar configurações:', error);
      alert(`Erro ao salvar configurações: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Função para inicializar configurações padrão
  const initializeDefaults = async () => {
    try {
      setLoading(true);
      
      await homeConfigApi.initializeDefaults();

      // Recarregar configurações após inicializar
      await loadHomeConfigurations();
      
      alert('Configurações padrão inicializadas com sucesso!');
      
    } catch (error: any) {
      console.error('❌ Erro ao inicializar configurações:', error);
      alert(`Erro ao inicializar configurações: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-2">Gerenciar Vídeos da Home</h2>
          <p className="text-gray-400">Carregando vídeos disponíveis...</p>
        </div>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900 rounded-lg p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Gerenciar Vídeos da Home</h2>
            <p className="text-gray-400">Configure quais vídeos aparecem nos carrosséis da página inicial</p>
            <p className="text-gray-500 text-sm mt-1">
              {availableVideos.length} vídeos disponíveis
              {availableVideos.length === 0 && !error && (
                <span className="text-yellow-400 ml-2">
                  (Verifique o console do navegador para logs de debug)
                </span>
              )}
            </p>
            {error && (
              <div className="mt-3 p-3 bg-red-900/50 border border-red-500/50 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={loadVideos}
              disabled={loading}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Recarregar</span>
            </button>
            <button
              onClick={initializeDefaults}
              disabled={loading}
              className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Inicializar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Seletor de Seção */}
      <div className="bg-gray-900 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Selecionar Seção</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setSelectedSection(section.id)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedSection === section.id
                  ? 'border-red-500 bg-red-500/10 text-white'
                  : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
              }`}
            >
              <div className="text-left">
                <h4 className="font-semibold">{section.name}</h4>
                <p className="text-sm opacity-75 mt-1">
                  {section.videos.length}/{section.maxVideos} vídeos
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Gerenciador da Seção Selecionada */}
      {getCurrentSection() && (
        <div className="bg-gray-900 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-white">
                {getCurrentSection()?.name}
              </h3>
              <p className="text-gray-400 mt-1">
                {getCurrentSection()?.videos.length}/{getCurrentSection()?.maxVideos} vídeos configurados
              </p>
            </div>
            <button
              onClick={() => setIsAddingVideo(true)}
              disabled={(getCurrentSection()?.videos.length || 0) >= (getCurrentSection()?.maxVideos || 0)}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Vídeo</span>
            </button>
          </div>

          {/* Lista de Vídeos da Seção */}
          <div className="space-y-4">
            {getCurrentSection()?.videos.map((video, index) => (
              <div key={video.id} className="bg-gray-800 rounded-lg p-4 flex items-center space-x-4">
                {/* Thumbnail */}
                <div className="relative w-24 h-16 bg-gray-700 rounded overflow-hidden flex-shrink-0">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Info do Vídeo */}
                <div className="flex-1">
                  <h4 className="text-white font-semibold">{video.title}</h4>
                  <p className="text-gray-400 text-sm mt-1">{video.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{video.duration}</span>
                    </span>
                    <span>{video.category}</span>
                    {video.isNew && (
                      <span className="bg-red-600 text-white px-2 py-1 rounded">Novo</span>
                    )}
                    {video.isFeatured && (
                      <span className="bg-yellow-600 text-white px-2 py-1 rounded flex items-center space-x-1">
                        <Star className="w-3 h-3" />
                        <span>Destaque</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Controles */}
                <div className="flex items-center space-x-2">
                  {/* Mover para cima */}
                  <button
                    onClick={() => moveVideo(selectedSection, index, 'up')}
                    disabled={index === 0}
                    className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Mover para cima"
                  >
                    ↑
                  </button>

                  {/* Mover para baixo */}
                  <button
                    onClick={() => moveVideo(selectedSection, index, 'down')}
                    disabled={index === (getCurrentSection()?.videos.length || 0) - 1}
                    className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Mover para baixo"
                  >
                    ↓
                  </button>

                  {/* Remover */}
                  <button
                    onClick={() => removeVideoFromSection(selectedSection, video.id)}
                    className="p-2 text-red-400 hover:text-red-300 transition-colors"
                    title="Remover da seção"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {getCurrentSection()?.videos.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum vídeo configurado para esta seção</p>
                <p className="text-sm mt-1">Clique em "Adicionar Vídeo" para começar</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal para Adicionar Vídeo */}
      {isAddingVideo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">
                  Adicionar Vídeo - {getCurrentSection()?.name}
                </h3>
                <button
                  onClick={() => setIsAddingVideo(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getAvailableVideosForSection().map(video => (
                  <div key={video.id} className="bg-gray-800 rounded-lg p-4">
                    <div className="relative w-full h-32 bg-gray-700 rounded overflow-hidden mb-3">
                      <img 
                        src={video.thumbnail} 
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Play className="w-8 h-8 text-white" />
                      </div>
                    </div>

                    <h4 className="text-white font-semibold mb-2">{video.title}</h4>
                    <p className="text-gray-400 text-sm mb-3">{video.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{video.duration}</span>
                        </span>
                        <span>{video.category}</span>
                      </div>

                      <button
                        onClick={() => addVideoToSection(selectedSection, video)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        Adicionar
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {getAvailableVideosForSection().length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  {availableVideos.length === 0 ? (
                    <div>
                      <p>Nenhum vídeo disponível</p>
                      <p className="text-sm mt-1">Faça upload de vídeos primeiro no painel "Gerenciar Vídeos"</p>
                    </div>
                  ) : (
                    <p>Todos os vídeos disponíveis já foram adicionados a esta seção</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Botão Salvar */}
      <div className="flex justify-end">
        <button 
          onClick={saveAllConfigurations}
          disabled={loading}
          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          <Save className="w-5 h-5" />
          <span>Salvar Configurações</span>
        </button>
      </div>
    </div>
  );
};

export default HomeVideosManager;
