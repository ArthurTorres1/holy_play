import React, { useEffect, useState } from 'react';
import { Play, Eye } from 'lucide-react';
import { getHomePageData, formatDuration, formatViews, getVideoPlayerUrl, isValidThumbnail } from '../../services/homePageApi';
import type { HomePageData, HomeSection, HomeVideo } from '../../services/homePageApi';
import bunnyStreamService from '../../services/bunnyStreamApi';

const HomeSections: React.FC = () => {
  const [homeData, setHomeData] = useState<HomePageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getHomePageData();
      
      // Buscar dados reais da Bunny Stream para cada vídeo em cada seção
      const sectionsWithRealData = await Promise.all(
        data.sections.map(async (section) => {
          if (section.videos && section.videos.length > 0) {
            const videosWithThumbnails = await Promise.all(
              section.videos.map(async (video) => {
                try {
                  // Buscar dados completos do vídeo na Bunny Stream
                  const bunnyVideo = await bunnyStreamService.getVideo(video.videoId);
                  
                  // Usar a mesma lógica de thumbnail do Hero
                  const thumbnailUrl = bunnyVideo.thumbnailUrl || 
                                     bunnyStreamService.getThumbnailUrlFromVideo(bunnyVideo, 480) ||
                                     bunnyStreamService.getThumbnailUrl(video.videoId, 480);
                  
                  console.log(`🖼️ Thumbnail para ${video.videoId}:`, thumbnailUrl);
                  
                  return {
                    ...video,
                    title: bunnyVideo.title || video.title,
                    description: bunnyVideo.description || video.description,
                    thumbnailUrl: thumbnailUrl,
                    duration: bunnyVideo.length || video.duration,
                    views: bunnyVideo.views || video.views
                  };
                } catch (error) {
                  console.warn(`⚠️ Erro ao buscar dados da Bunny para ${video.videoId}:`, error);
                  // Usar dados do backend como fallback
                  return video;
                }
              })
            );
            
            return {
              ...section,
              videos: videosWithThumbnails
            };
          }
          return section;
        })
      );
      
      setHomeData({
        ...data,
        sections: sectionsWithRealData
      });
      
    } catch (error: any) {
      console.error('❌ Erro ao carregar dados da home:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoClick = (video: HomeVideo) => {
    const playerUrl = getVideoPlayerUrl(video.videoId);
    window.location.href = playerUrl;
  };

  if (loading) {
    return (
      <div className="bg-black py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-white">Carregando vídeos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-black py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-red-400 mb-4">❌ {error}</p>
          <button
            onClick={loadHomeData}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (!homeData || !homeData.sections || homeData.sections.length === 0) {
    return (
      <div className="bg-black py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400 mb-4">Nenhuma seção configurada</p>
          <p className="text-sm text-gray-500">Configure as seções no painel administrativo</p>
        </div>
      </div>
    );
  }

  // Filtrar seção hero (já tratada pelo componente Hero)
  const sectionsToShow = homeData.sections.filter(section => section.sectionId !== 'hero');

  if (sectionsToShow.length === 0) {
    return null; // Não mostra nada se só tiver seção hero
  }

  return (
    <div className="bg-black py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Seções de vídeos (exceto hero) */}
        {sectionsToShow.map((section) => (
          <HomeSection key={section.sectionId} section={section} onVideoClick={handleVideoClick} />
        ))}
        
      </div>
    </div>
  );
};

// Componente para uma seção individual
interface HomeSectionProps {
  section: HomeSection;
  onVideoClick: (video: HomeVideo) => void;
}

const HomeSection: React.FC<HomeSectionProps> = ({ section, onVideoClick }) => {
  if (!section.videos || section.videos.length === 0) {
    return null; // Não exibe seções vazias
  }

  return (
    <div className="mb-12">
      {/* Título da seção */}
      <h2 className="text-2xl font-bold text-white mb-6">{section.sectionName}</h2>
      
      {/* Grid de vídeos - Layout tipo YouTube Shorts */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {section.videos.map((video) => (
          <VideoCard key={video.videoId} video={video} onClick={() => onVideoClick(video)} />
        ))}
      </div>
    </div>
  );
};

// Componente para um card de vídeo
interface VideoCardProps {
  video: HomeVideo;
  onClick: () => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onClick }) => {
  return (
    <div 
      className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-xl"
      onClick={onClick}
    >
      {/* Thumbnail - Proporção mais equilibrada */}
      <div className="relative aspect-[4/5] bg-gray-700">
        {isValidThumbnail(video.thumbnailUrl) ? (
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback para placeholder se a imagem falhar
              const target = e.target as HTMLImageElement;
              target.src = '/api/placeholder/400/225';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
            <Play className="w-12 h-12 text-gray-400" />
          </div>
        )}
        
        {/* Overlay com informações */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent">
          {/* Botão play no centro */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
            <Play className="w-12 h-12 text-white" />
          </div>
          
          {/* Badge "Novo" no topo */}
          {video.new && (
            <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
              Novo
            </div>
          )}
          
          {/* Duração no topo direito */}
          {video.duration > 0 && (
            <div className="absolute top-2 right-2 bg-black/75 text-white text-xs px-2 py-1 rounded">
              {formatDuration(video.duration)}
            </div>
          )}
          
          {/* Informações na parte inferior */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2 leading-tight">
              {video.title}
            </h3>
            
            {video.views > 0 && (
              <div className="flex items-center space-x-1 text-xs text-gray-300">
                <Eye className="w-3 h-3" />
                <span>{formatViews(video.views)} visualizações</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeSections;
