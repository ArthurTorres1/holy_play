import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import bunnyStreamService, { Video } from '../../services/bunnyStreamApi';

interface VideoPlayerSimpleProps {
  video: Video;
  onClose: () => void;
  onStatusChange?: (videoId: string, newStatus: number, newResolutions: string) => void;
}

const VideoPlayerSimple: React.FC<VideoPlayerSimpleProps> = ({ video, onClose, onStatusChange }) => {
  const playerUrl = bunnyStreamService.getPlayerUrl(video.videoId);

  // Estado local para refletir atualizações do Bunny
  const [status, setStatus] = useState<number>(video.status);
  const [availableResolutions, setAvailableResolutions] = useState<string>(video.availableResolutions || '');
  const [details, setDetails] = useState<Video>(video);
  const [backendDescription, setBackendDescription] = useState<string | null>(null);

  // Buscar detalhes atualizados ao abrir o modal (garante description, views, etc.)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const fresh = await bunnyStreamService.getVideo(video.videoId);
        if (!cancelled) {
          setDetails(fresh);
          // também sincroniza status/resoluções
          setStatus(fresh.status);
          setAvailableResolutions(fresh.availableResolutions || '');
        }
      } catch (e) {
        // silencioso
      }

      // Busca descrição do backend e prioriza na exibição
      try {
        const { apiFetch } = await import('../../utils/api');
        const resp = await apiFetch(`api/videos/${video.videoId}/description`);
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
        } else if (resp.status === 304) {
          if (!cancelled) setBackendDescription(null);
        } else if (!cancelled) {
          setBackendDescription(null);
        }
      } catch (_) {
        if (!cancelled) setBackendDescription(null);
      }
    })();
    return () => { cancelled = true; };
  }, [video.videoId]);

  // Polling: a cada 8s consulta o Bunny até ficar pronto
  useEffect(() => {
    let timer: number | undefined;
    const fetchStatus = async () => {
      try {
        const data = await bunnyStreamService.getVideo(video.videoId);
        setStatus(data.status);
        setAvailableResolutions(data.availableResolutions || '');
        if (onStatusChange) {
          onStatusChange(video.videoId, data.status, data.availableResolutions || '');
        }
      } catch (_) {
        // silencioso
      }
    };

    // só faz polling enquanto não estiver pronto
    if ((availableResolutions || '').trim().length === 0 && status !== 3) {
      fetchStatus();
      timer = window.setInterval(fetchStatus, 8000);
    }
    return () => {
      if (timer) window.clearInterval(timer);
    };
  }, [video.videoId, status, availableResolutions]);

  const isReady = (availableResolutions || '').trim().length > 0 || status === 3;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 p-4 overflow-y-auto">
      <div className="bg-gray-800 rounded-lg max-w-6xl w-full mx-auto my-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white">{details.title}</h2>
            {(backendDescription || details.description) && (
              <p className="text-gray-400 mt-1">{backendDescription ?? details.description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {isReady ? (
            <div className="space-y-6">
              {/* Video Player */}
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <iframe
                  src={playerUrl}
                  className="w-full h-full"
                  frameBorder="0"
                  allowFullScreen
                  title={video.title}
                />
              </div>
              <div className="text-center">
                <p className="text-green-400">✅ Vídeo pronto para reprodução</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-white mb-2">Vídeo ainda processando...</h3>
              <p className="text-gray-400 mb-4">
                O vídeo está sendo processado pelo Bunny.net. Isso pode levar alguns minutos.
              </p>
              <p className="text-sm text-gray-500">
                Status atual: {status === 1 ? 'Processando' : status === 4 ? 'Criando resoluções' : 'Aguardando'}
              </p>
              <div className="mt-6 space-y-4">
                <div className="p-4 bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => window.open(playerUrl, '_blank')}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Abrir Player (pode não funcionar ainda)
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const data = await bunnyStreamService.getVideo(video.videoId);
                          setStatus(data.status);
                          setAvailableResolutions(data.availableResolutions || '');
                          if (onStatusChange) {
                            onStatusChange(video.videoId, data.status, data.availableResolutions || '');
                          }
                          alert(`Status atualizado: ${data.status}\nResoluções: ${data.availableResolutions || '(vazio)'}`);
                        } catch (error) {
                          alert(`Erro: ${error}`);
                        }
                      }}
                      className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                    >
                      Verificar Status Atual
                    </button>
                  </div>
                </div>
                <div className="p-4 bg-red-900 border border-red-700 rounded-lg">
                  <p className="text-red-200 text-sm">
                    <strong>⚠️ Problema detectado:</strong> Um vídeo de 119MB não deveria demorar 2 dias para processar. 
                    Possíveis causas:
                  </p>
                  <ul className="text-red-200 text-sm mt-2 ml-4 list-disc">
                    <li>Erro no processamento do Bunny.net</li>
                    <li>Arquivo corrompido durante upload</li>
                    <li>Problema na biblioteca do Bunny.net</li>
                  </ul>
                  <p className="text-red-200 text-sm mt-2">
                    <strong>Recomendação:</strong> Verifique o dashboard do Bunny.net ou entre em contato com o suporte.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Descrição (prioriza backend) */}
          {(backendDescription || details.description) && (
            <div className="mt-6 bg-gray-700 p-4 rounded-lg">
              <h4 className="text-sm text-gray-300 mb-2">Descrição</h4>
              <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">
                {backendDescription ?? details.description}
              </p>
            </div>
          )}

          {/* Video Info */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-700 p-3 rounded-lg">
              <p className="text-sm text-gray-400">Duração</p>
              <p className="text-white font-semibold">
                {Math.floor((details.length || 0) / 60)}:{((details.length || 0) % 60).toString().padStart(2, '0')}
              </p>
            </div>
            <div className="bg-gray-700 p-3 rounded-lg">
              <p className="text-sm text-gray-400">Resolução</p>
              <p className="text-white font-semibold">{details.width || 0}x{details.height || 0}</p>
            </div>
            <div className="bg-gray-700 p-3 rounded-lg">
              <p className="text-sm text-gray-400">Views</p>
              <p className="text-white font-semibold">{details.views}</p>
            </div>
            <div className="bg-gray-700 p-3 rounded-lg">
              <p className="text-sm text-gray-400">Tamanho</p>
              <p className="text-white font-semibold">
                {(((details.storageSize || 0)) / (1024 * 1024)).toFixed(1)} MB
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerSimple;
