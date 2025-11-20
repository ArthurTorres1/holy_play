import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Play, Clock } from 'lucide-react';
import bunnyStreamService, { Video as BunnyVideo } from '../services/bunnyStreamApi';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getFriendlyErrorMessage } from '../utils/errorMessages';

interface CatalogVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
}

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }
  return `${minutes}min`;
};

const CatalogPage: React.FC = () => {
  const [videos, setVideos] = useState<CatalogVideo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await bunnyStreamService.getVideos();
        const mapped: CatalogVideo[] = response.items.map((video: BunnyVideo) => {
          const thumbs = bunnyStreamService.getPreferredThumbnailUrlsFromVideo(video);
          const thumbnail = thumbs[0] ?? '/api/placeholder/400/225';
          return {
            id: video.videoId,
            title: video.title,
            description: video.description || '',
            thumbnail,
            duration: formatDuration(video.length || 0),
          };
        });

        setVideos(mapped);
      } catch (err: any) {
        setError(getFriendlyErrorMessage(err, 'Erro ao carregar vídeos. Tente novamente em instantes.'));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filteredVideos = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return videos;
    return videos.filter((v) => v.title.toLowerCase().includes(q));
  }, [videos, query]);

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

          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-900 border border-gray-700 text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
              placeholder="Buscar por título..."
            />
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                {filteredVideos.map((video) => (
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
                      {video.description && (
                        <p className="text-[11px] text-gray-400 line-clamp-2">
                          {video.description}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CatalogPage;
