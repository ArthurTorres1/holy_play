import React, { useState, useEffect } from 'react';
import { Play, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { getHomePageData } from '../services/homePageApi';
import type { HomeVideo } from '../services/homePageApi';
import bunnyStreamService from '../services/bunnyStreamApi';

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroVideos, setHeroVideos] = useState<HomeVideo[]>([]);
  const [loading, setLoading] = useState(true);

  // Máximo de 3 vídeos no carrossel
  const MAX_HERO_VIDEOS = 3;

  useEffect(() => {
    loadHeroVideos();
  }, []);

  const loadHeroVideos = async () => {
    try {
      setLoading(true);
      const homeData = await getHomePageData();
      
      // Buscar seção hero
      const heroSection = homeData.sections.find(section => section.sectionId === 'hero');
      
      if (heroSection && heroSection.videos.length > 0) {
        console.log('✅ Vídeos hero carregados:', heroSection.videos);
        
        // Limitar a 3 vídeos e buscar dados completos da Bunny Stream
        const limitedVideos = heroSection.videos.slice(0, MAX_HERO_VIDEOS);
        const videosWithThumbnails = await Promise.all(
          limitedVideos.map(async (video) => {
            try {
              // Buscar dados completos do vídeo na Bunny Stream
              const bunnyVideo = await bunnyStreamService.getVideo(video.videoId);
              
              // Usar a mesma lógica de thumbnail do admin
              const thumbnailUrl = bunnyVideo.thumbnailUrl || 
                                 bunnyStreamService.getThumbnailUrlFromVideo(bunnyVideo, 640) ||
                                 bunnyStreamService.getThumbnailUrl(video.videoId, 640);
              
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
        
        console.log(`🖼️ ${videosWithThumbnails.length} vídeos com thumbnails da Bunny:`, videosWithThumbnails);
        setHeroVideos(videosWithThumbnails);
      } else {
        console.log('⚠️ Nenhum vídeo hero configurado');
        setHeroVideos([]);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar vídeos hero:', error);
      setHeroVideos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (heroVideos.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % heroVideos.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [heroVideos.length]);

  const nextSlide = () => {
    if (heroVideos.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % heroVideos.length);
    }
  };

  const prevSlide = () => {
    if (heroVideos.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + heroVideos.length) % heroVideos.length);
    }
  };

  const handleWatchNow = (video: HomeVideo) => {
    // Navegar para o player
    window.location.href = `/video/${video.videoId}`;
  };

  // Se não há vídeos configurados, não mostrar o carrossel
  if (heroVideos.length === 0) {
    return null;
  }

  return (
    <section id="inicio" className="relative h-screen overflow-hidden">
      {heroVideos.map((video: HomeVideo, index: number) => (
        <div
          key={video.videoId}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent z-10" />
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback para imagem padrão se a thumbnail falhar
              const target = e.target as HTMLImageElement;
              target.src = '/01.png';
            }}
          />
          <div className="absolute inset-0 flex items-center z-20">
            <div className="max-w-7xl mx-auto px-6 w-full">
              <div className="max-w-2xl">
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight">
                  {video.title}
                </h1>
                <div className="flex space-x-4">
                  <button 
                    onClick={() => handleWatchNow(video)}
                    className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg flex items-center space-x-2 transition-colors text-lg font-semibold"
                  >
                    <Play className="h-6 w-6" />
                    <span>Assistir Agora</span>
                  </button>
                  <button className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-4 rounded-lg flex items-center space-x-2 transition-colors text-lg font-semibold">
                    <Info className="h-6 w-6" />
                    <span>Mais Informações</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      <button
        onClick={prevSlide}
        className="absolute left-6 md:top-1/2 md:transform md:-translate-y-1/2 bottom-32 md:bottom-auto z-30 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-6 md:top-1/2 md:transform md:-translate-y-1/2 bottom-32 md:bottom-auto z-30 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex space-x-2">
        {heroVideos.map((_, index: number) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentSlide ? 'bg-red-600' : 'bg-gray-400'
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;