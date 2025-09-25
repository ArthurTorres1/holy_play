import React, { useState } from 'react';
import { X, ExternalLink, Copy, Download } from 'lucide-react';
import bunnyStreamService, { Video } from '../../services/bunnyStreamApi';

interface VideoPlayerProps {
  video: Video;
  onClose: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ video, onClose }) => {
  const [activeTab, setActiveTab] = useState<'player' | 'embed' | 'details'>('player');
  const [copied, setCopied] = useState(false);

  const playerUrl = bunnyStreamService.getPlayerUrl(video.videoId);
  const embedCode = `<iframe src="${playerUrl}" width="854" height="480" frameborder="0" allowfullscreen></iframe>`;
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Controle de thumbnail: índice de fallback e cache-busting
  const [thumbIdx, setThumbIdx] = useState(0);
  const [thumbCb, setThumbCb] = useState<number>(() => Date.now());

  const formatFileSize = (bytes?: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes == null) return '—';
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
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

  const getAvailableResolutions = (resolutions?: string): string[] => {
    if (!resolutions) return [];
    return resolutions
      .split(',')
      .map((r) => r.trim())
      .filter((r) => r);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white">{video.title}</h2>
            {video.description && (
              <p className="text-gray-400 mt-1">{video.description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('player')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'player'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Player
          </button>
          <button
            onClick={() => setActiveTab('embed')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'embed'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Embed
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'details'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Detalhes
          </button>
        </div>

        <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          {activeTab === 'player' && (
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

              {/* Player Controls */}
              <div className="flex gap-4">
                <button
                  onClick={() => window.open(playerUrl, '_blank')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <ExternalLink size={16} />
                  Abrir em Nova Aba
                </button>
                <button
                  onClick={() => copyToClipboard(playerUrl)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  <Copy size={16} />
                  {copied ? 'Copiado!' : 'Copiar URL'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'embed' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Código de Incorporação</h3>
                <div className="bg-gray-900 rounded-lg p-4">
                  <code className="text-green-400 text-sm break-all">
                    {embedCode}
                  </code>
                </div>
                <button
                  onClick={() => copyToClipboard(embedCode)}
                  className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Copy size={16} />
                  {copied ? 'Copiado!' : 'Copiar Código'}
                </button>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-4">URLs Diretas</h3>
                <div className="space-y-3">
                  {getAvailableResolutions(video.availableResolutions).map((resolution) => (
                    <div key={resolution} className="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
                      <span className="text-white font-medium">{resolution}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyToClipboard(bunnyStreamService.getVideoUrl(video.videoId, resolution))}
                          className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm transition-colors"
                        >
                          <Copy size={14} />
                        </button>
                        <a
                          href={bunnyStreamService.getVideoUrl(video.videoId, resolution)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                        >
                          <Download size={14} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Informações Básicas</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-400">ID do Vídeo</label>
                      <p className="text-white font-mono">{video.videoId}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Título</label>
                      <p className="text-white">{video.title}</p>
                    </div>
                    {video.description && (
                      <div>
                        <label className="text-sm text-gray-400">Descrição</label>
                        <p className="text-white">{video.description}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm text-gray-400">Data de Upload</label>
                      <p className="text-white">
                        {new Date(video.dateUploaded).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Technical Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Informações Técnicas</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-400">Duração</label>
                      <p className="text-white">{formatDuration(video.length)}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Resolução</label>
                      <p className="text-white">{video.width} x {video.height}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Taxa de Quadros</label>
                      <p className="text-white">{video.framerate} fps</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Tamanho do Arquivo</label>
                      <p className="text-white">{formatFileSize(video.storageSize)}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Resoluções Disponíveis</label>
                      <p className="text-white">
                        {getAvailableResolutions(video.availableResolutions).join(', ') || 'Nenhuma'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Estatísticas</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <p className="text-2xl font-bold text-blue-400">{video.views.toLocaleString()}</p>
                    <p className="text-gray-400">Visualizações</p>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <p className="text-2xl font-bold text-green-400">
                      {video.status === 3 ? 'Pronto' : 'Processando'}
                    </p>
                    <p className="text-gray-400">Status</p>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <p className="text-2xl font-bold text-purple-400">
                      {formatFileSize(video.storageSize)}
                    </p>
                    <p className="text-gray-400">Armazenamento</p>
                  </div>
                </div>
              </div>

              {/* Thumbnail */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Thumbnail</h3>
                <div className="flex items-start gap-4">
                  {(() => {
                    const candidates = bunnyStreamService.getPreferredThumbnailUrlsFromVideo(video);
                    const safeIdx = Math.min(thumbIdx, Math.max(0, candidates.length - 1));
                    const rawThumb = candidates[safeIdx] || bunnyStreamService.getThumbnailUrlFromVideo(video, 320);
                    const cacheBusted = `${rawThumb}${rawThumb.includes('?') ? '&' : '?'}cb=${thumbCb}`;
                    return (
                      <img
                        src={cacheBusted}
                        alt={video.title}
                        className="w-48 h-27 object-cover rounded-lg"
                        onError={() => {
                          // Tentar próximo candidato; se não houver, deixar placeholder embutido
                          setThumbIdx((idx) => idx + 1);
                        }}
                        onLoad={() => {
                          // Se carregou, não fazer nada — mantém candidato atual
                        }}
                      />
                    );
                  })()}
                  <div className="flex-1">
                    <button
                      onClick={() => copyToClipboard(bunnyStreamService.getThumbnailUrlFromVideo(video, 640))}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                      <Copy size={16} />
                      {copied ? 'URL Copiada!' : 'Copiar URL da Thumbnail'}
                    </button>
                    <button
                      onClick={() => {
                        // Forçar recarregamento ignorando cache
                        setThumbCb(Date.now());
                        setThumbIdx(0);
                      }}
                      className="mt-3 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Atualizar thumbnail
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
