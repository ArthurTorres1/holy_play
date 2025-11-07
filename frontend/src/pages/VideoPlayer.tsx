import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const VideoPlayer: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();

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
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link 
            to="/" 
            className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para Home</span>
          </Link>
        </div>
      </div>

      {/* Player Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Video Player */}
        <div className="bg-gray-900 rounded-lg overflow-hidden mb-8">
          <div className="aspect-video bg-gray-800 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                <span className="text-white text-2xl">▶</span>
              </div>
              <h2 className="text-white text-xl mb-2">Player em Desenvolvimento</h2>
              <p className="text-gray-400 mb-4">ID do Vídeo: <code className="bg-gray-700 px-2 py-1 rounded">{videoId}</code></p>
              <p className="text-sm text-gray-500">
                Aqui será integrado o player do Bunny Stream ou outro player de vídeo
              </p>
            </div>
          </div>
        </div>

        {/* Video Info */}
        <div className="bg-gray-900 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-white mb-4">
            Vídeo {videoId?.substring(0, 8)}
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Informações</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">ID do Vídeo:</span>
                  <span className="text-white font-mono">{videoId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className="text-green-400">Disponível</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Formato:</span>
                  <span className="text-white">MP4</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Próximos Passos</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Integrar player do Bunny Stream</li>
                <li>• Buscar metadados do vídeo</li>
                <li>• Adicionar controles de qualidade</li>
                <li>• Implementar legendas</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Development Info */}
        <div className="mt-8 bg-blue-900/20 border border-blue-800 rounded-lg p-4">
          <h3 className="text-blue-400 font-semibold mb-2">🔧 Modo Desenvolvimento</h3>
          <p className="text-blue-300 text-sm">
            Esta página será substituída pelo player real do Bunny Stream. 
            Por enquanto, ela serve para testar a navegação entre home e player.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
