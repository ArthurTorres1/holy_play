import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import bunnyStreamService, { Video } from '../services/bunnyStreamApi';
import { getFriendlyErrorMessage } from '../utils/errorMessages';

const VideoPlayer: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();

  const [details, setDetails] = useState<Video | null>(null);
  const [backendDescription, setBackendDescription] = useState<string | null>(null);
  const [loadingMeta, setLoadingMeta] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const playerUrl = useMemo(() => {
    if (!videoId) return '';
    return bunnyStreamService.getPlayerUrl(videoId);
  }, [videoId]);

  useEffect(() => {
    if (!videoId) return;

    let cancelled = false;
    setLoadingMeta(true);
    setError(null);

    (async () => {
      try {
        // Buscar detalhes atualizados no Bunny (título, description, views, etc.)
        const fresh = await bunnyStreamService.getVideo(videoId);
        if (!cancelled) {
          setDetails(fresh);
        }
      } catch (err) {
        if (!cancelled) {
          setDetails(null);
          setError(prev => prev ?? getFriendlyErrorMessage(err, 'Não foi possível carregar as informações do vídeo.'));
        }
      }

      // Buscar descrição do backend e priorizar na exibição (mesma ideia do VideoPlayerSimple)
      try {
        const { buildApiUrl } = await import('../config/api');
        const resp = await fetch(buildApiUrl(`api/videos/${videoId}/description`));
        if (resp.ok) {
          const ct = resp.headers.get('content-type') || '';
          if (ct.includes('application/json')) {
            const data = await resp.json();
            if (!cancelled) {
              const value = typeof data?.description === 'string' ? data.description : (typeof data === 'string' ? data : null);
              setBackendDescription(value);
            }
          } else {
            const text = (await resp.text()).trim();
            if (!cancelled) setBackendDescription(text.length > 0 ? text : null);
          }
        } else if (!cancelled) {
          setBackendDescription(null);
        }
      } catch (err) {
        if (!cancelled) {
          setBackendDescription(null);
          setError(prev => prev ?? getFriendlyErrorMessage(err, 'Não foi possível carregar a descrição do vídeo.'));
        }
      } finally {
        if (!cancelled) setLoadingMeta(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [videoId]);

  if (!videoId) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">❌ ID do vídeo não encontrado</p>
          <Link
            to="/"
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para Home</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="bg-gray-900 border-b border-gray-800 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para Home</span>
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
        <div className="bg-gray-900 rounded-lg overflow-hidden mb-6 sm:mb-8 shadow-lg">
          <div className="aspect-video bg-black">
            {playerUrl ? (
              <iframe
                src={playerUrl}
                className="w-full h-full"
                frameBorder="0"
                allowFullScreen
                allow="autoplay; fullscreen; picture-in-picture"
                title={`Player do vídeo ${videoId}`}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                Carregando player...
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-4 sm:p-6 space-y-3 sm:space-y-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
              {details?.title || `Vídeo`}
            </h1>
            {typeof details?.views === 'number' && details.views > 0 && (
              <p className="text-[11px] sm:text-xs text-gray-400">
                {details.views.toLocaleString('pt-BR')} visualizações
              </p>
            )}
          </div>

          {error && (
            <div className="text-red-400 text-xs sm:text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              {error}
            </div>
          )}

          {(backendDescription || details?.description) && (
            <div className="pt-2 border-t border-gray-800">
              <h2 className="text-sm sm:text-base font-semibold text-white mb-1 sm:mb-2">
                Descrição
              </h2>
              <p className="text-xs sm:text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
                {backendDescription ?? details?.description}
              </p>
            </div>
          )}

          {loadingMeta && (
            <p className="text-[11px] sm:text-xs text-gray-500">
              Carregando informações do vídeo...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
