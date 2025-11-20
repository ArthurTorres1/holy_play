import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Play, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import bunnyStreamService, { Video as BunnyVideo } from '../services/bunnyStreamApi';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getFriendlyErrorMessage } from '../utils/errorMessages';
import { apiFetch } from '../utils/api';

interface CatalogVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  categoryId?: number | null;
  categoryName?: string | null;
}

interface VideoCategory {
  id: number;
  name: string;
  slug: string;
}

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }
  return `${minutes}min`;
};

const VIDEOS_PER_PAGE = 20;

const CatalogPage: React.FC = () => {
  const [allVideos, setAllVideos] = useState<CatalogVideo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [categories, setCategories] = useState<VideoCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        // Carregar vídeos da Bunny e categorias do backend em paralelo
        const [bunnyResponse, videosWithCategoriesRes] = await Promise.all([
          bunnyStreamService.getVideos(),
          apiFetch('/api/videos/videos-with-categories')
        ]);

        // Criar mapa de categorias por videoId
        const categoryMap = new Map<string, { categoryId: number | null; categoryName: string | null }>();
        if (videosWithCategoriesRes.ok) {
          const videosWithCategories = await videosWithCategoriesRes.json();
          console.log('🔍 Vídeos com categorias do backend:', videosWithCategories.length);
          videosWithCategories.forEach((item: any) => {
            categoryMap.set(item.videoId, {
              categoryId: item.categoryId,
              categoryName: item.categoryName
            });
            if (item.categoryId) {
              console.log(`📂 Vídeo ${item.videoId} tem categoria: ${item.categoryName} (ID: ${item.categoryId})`);
            }
          });
        }

        console.log('🎬 Vídeos da Bunny Stream:', bunnyResponse.items.length);

        const mapped: CatalogVideo[] = bunnyResponse.items.map((video: BunnyVideo) => {
          const thumbs = bunnyStreamService.getPreferredThumbnailUrlsFromVideo(video);
          const thumbnail = thumbs[0] ?? '/api/placeholder/400/225';
          const categoryInfo = categoryMap.get(video.videoId);
          
          const result = {
            id: video.videoId,
            title: video.title,
            description: video.description || '',
            thumbnail,
            duration: formatDuration(video.length || 0),
            categoryId: categoryInfo?.categoryId || null,
            categoryName: categoryInfo?.categoryName || null,
          };
          
          if (categoryInfo?.categoryId) {
            console.log(`✅ Mapeado vídeo ${video.videoId} (${video.title}) com categoria ${categoryInfo.categoryName}`);
          }
          
          return result;
        });

        setAllVideos(mapped);
      } catch (err: any) {
        setError(getFriendlyErrorMessage(err, 'Erro ao carregar vídeos. Tente novamente em instantes.'));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // Carregar lista de categorias para o filtro
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const res = await apiFetch('/api/videos/categories');
        if (!res.ok) {
          return;
        }
        const data: VideoCategory[] = await res.json();
        setCategories(data);
      } catch {
        // Erro em categorias não deve quebrar o catálogo; apenas não mostra o filtro
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  // Removido: agora as categorias já vêm junto com os vídeos no carregamento inicial

  // Função para remover acentos
  const removeAccents = (str: string): string => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  };

  // Filtrar vídeos por busca e categoria
  const filteredVideos = useMemo(() => {
    const q = query.trim().toLowerCase();
    const qWithoutAccents = removeAccents(q);
    
    const filtered = allVideos.filter((v: CatalogVideo) => {
      const titleLower = v.title.toLowerCase();
      const titleWithoutAccents = removeAccents(titleLower);
      
      // Busca com e sem acentos
      const matchesQuery = !q || 
        titleLower.includes(q) || 
        titleWithoutAccents.includes(q) ||
        titleLower.includes(qWithoutAccents) ||
        titleWithoutAccents.includes(qWithoutAccents);
        
      const matchesCategory = !selectedCategoryId || v.categoryId === selectedCategoryId;
      return matchesQuery && matchesCategory;
    });
    
    if (selectedCategoryId) {
      const selectedCategory = categories.find(c => c.id === selectedCategoryId);
      console.log(`🔍 Filtro ativo para categoria "${selectedCategory?.name}" (ID: ${selectedCategoryId})`);
      console.log(`📊 Vídeos com essa categoria: ${filtered.length} de ${allVideos.length} total`);
      
      const videosWithSelectedCategory = allVideos.filter((v: CatalogVideo) => v.categoryId === selectedCategoryId);
      console.log('🎯 Vídeos que deveriam aparecer:', videosWithSelectedCategory.map((v: CatalogVideo) => `${v.title} (${v.id})`));
    }
    
    return filtered;
  }, [allVideos, query, selectedCategoryId, categories]);

  // Calcular paginação
  const totalPages = Math.ceil(filteredVideos.length / VIDEOS_PER_PAGE);
  const startIndex = (currentPage - 1) * VIDEOS_PER_PAGE;
  const endIndex = startIndex + VIDEOS_PER_PAGE;
  const currentVideos = filteredVideos.slice(startIndex, endIndex);

  // Reset página quando filtros mudam
  useEffect(() => {
    setCurrentPage(1);
  }, [query, selectedCategoryId]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenVideo = (id: string) => {
    navigate(`/video/${id}`);
  };

  return (
    <div className="bg-black min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <section className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">Catálogo de Vídeos</h1>
          <p className="text-sm sm:text-base text-gray-400 mb-4">
            Explore todos os conteúdos disponíveis na HolyPlay. Use a busca para encontrar um vídeo pelo título.
          </p>

          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-end">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-900 border border-gray-700 text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                placeholder="Buscar por título..."
              />
            </div>

            {categories.length > 0 && (
              <div className="w-full md:w-64">
                <label className="block text-xs text-gray-400 mb-1">Filtrar por categoria</label>
                <select
                  value={selectedCategoryId ?? ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedCategoryId(value ? Number(value) : null);
                  }}
                  disabled={loadingCategories}
                  className="w-full px-3 py-2.5 rounded-lg bg-gray-900 border border-gray-700 text-sm text-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                >
                  <option value="">Todas as categorias</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </section>

        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-900/40 border border-red-700 text-red-200 rounded-lg p-4 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && (
          <section>
            {filteredVideos.length === 0 ? (
              <div className="text-center text-gray-400 py-16">
                <p className="text-lg mb-2">Nenhum vídeo encontrado.</p>
                {query && <p className="text-sm">Tente buscar por outro título.</p>}
              </div>
            ) : (
              <>
                {/* Informações da paginação */}
                <div className="flex justify-between items-center mb-6 text-sm text-gray-400">
                  <p>
                    Mostrando {startIndex + 1}-{Math.min(endIndex, filteredVideos.length)} de {filteredVideos.length} vídeos
                    {query && ` para "${query}"`}
                    {selectedCategoryId && ` na categoria "${categories.find(c => c.id === selectedCategoryId)?.name}"`}
                  </p>
                  <p>Página {currentPage} de {totalPages}</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                  {currentVideos.map((video: CatalogVideo) => (
                  <button
                    key={video.id}
                    type="button"
                    onClick={() => handleOpenVideo(video.id)}
                    className="group text-left bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-red-600 transition-all hover:-translate-y-1 hover:shadow-lg/50 shadow-lg/10 flex flex-col"
                  >
                    <div className="relative aspect-[4/5] bg-gray-800 overflow-hidden">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/20" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
                          <Play className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="absolute bottom-2 right-2 flex items-center space-x-1 bg-black/70 px-2 py-0.5 rounded text-[11px] text-gray-200">
                        <Clock className="w-3 h-3" />
                        <span>{video.duration}</span>
                      </div>
                    </div>
                    <div className="p-3 flex-1 flex flex-col">
                      <h2 className="text-xs sm:text-sm font-semibold text-white mb-1 line-clamp-2">
                        {video.title}
                      </h2>
                      {(video.categoryName || video.description) && (
                        <div className="space-y-0.5">
                          {video.categoryName && (
                            <p className="text-[11px] text-red-300 font-medium line-clamp-1">
                              {video.categoryName}
                            </p>
                          )}
                          {video.description && (
                            <p className="text-[11px] text-gray-400 line-clamp-2">
                              {video.description}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                  ))}
                </div>

                {/* Controles de Paginação */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center mt-8 space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Anterior
                    </button>

                    <div className="flex space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-2 text-sm font-medium rounded-lg ${
                              currentPage === pageNum
                                ? 'text-white bg-red-600 border border-red-600'
                                : 'text-gray-300 bg-gray-800 border border-gray-700 hover:bg-gray-700 hover:text-white'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Próxima
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CatalogPage;
