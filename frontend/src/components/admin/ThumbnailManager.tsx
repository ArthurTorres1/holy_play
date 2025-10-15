import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Upload, X, Crop, Crosshair, Image as ImageIcon } from 'lucide-react';
import bunnyStreamService, { Video } from '../../services/bunnyStreamApi';
import { useAlert } from '../../hooks/useAlert';

interface ThumbnailManagerProps {
  video: Video;
  isOpen: boolean;
  onClose: () => void;
  onThumbnailUpdated: () => void;
}

const ThumbnailManager: React.FC<ThumbnailManagerProps> = ({
  video,
  isOpen,
  onClose,
  onThumbnailUpdated
}) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showSuccess, showError } = useAlert();

  type ThumbPrefs = {
    mode: 'cover';
    posX: number; // 0..100
    posY: number; // 0..100
  };

  const loadPrefs = (): ThumbPrefs => {
    try {
      const raw = localStorage.getItem(`thumb_prefs_${video.videoId}`);
      if (raw) return JSON.parse(raw);
    } catch {}
    return { mode: 'cover', posX: 50, posY: 50 };
  };

  const [prefs, setPrefs] = useState<ThumbPrefs>(loadPrefs());
  useEffect(() => {
    setPrefs(loadPrefs());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video.videoId]);

  if (!isOpen) return null;

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('🎯 handleFileUpload chamado!', event.target.files);
    
    const file = event.target.files?.[0];
    if (!file) {
      console.log('❌ Nenhum arquivo selecionado');
      return;
    }

    console.log('📁 Arquivo selecionado:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    });

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      console.log('❌ Tipo de arquivo inválido:', file.type);
      showError('Arquivo inválido', 'Por favor, selecione uma imagem (JPG, PNG, etc.)');
      return;
    }

    // Remover validação de tamanho - API não especifica limite

    console.log('✅ Validações passaram, iniciando upload...');
    setUploading(true);
    
    try {
      console.log('📸 Chamando bunnyStreamService.uploadThumbnail...', {
        videoId: video.videoId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });
      
      // Chamar a API real do Bunny.net
      await bunnyStreamService.uploadThumbnail(video.videoId, file);
      
      console.log('✅ Upload API concluído com sucesso!');
      showSuccess('Upload concluído!', 'Thumbnail enviada com sucesso. Aguardando processamento...');
      
      // Aguarda processamento no Bunny antes de recarregar (3.5s)
      setTimeout(() => {
        console.log('🔄 Chamando onThumbnailUpdated...');
        onThumbnailUpdated();
        showSuccess('Thumbnail atualizada!', 'A nova thumbnail foi aplicada com sucesso.');
        onClose();
      }, 3500);
      
    } catch (error: any) {
      console.error('❌ Erro completo no upload:', error);
      showError('Erro no upload', `Falha: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Gera uma nova imagem 1280x720 aplicando o enquadramento atual (cover + focal point) e envia para o Bunny
  const cropAndUpload = async () => {
    try {
      setUploading(true);
      showSuccess('Processando...', 'Gerando imagem com o enquadramento escolhido...');
      // 1) Obter uma imagem de origem segura (preferir API blob para evitar CORS)
      let srcUrl: string | null = null;
      try {
        const apiBlobUrl = await bunnyStreamService.getThumbnailObjectUrl(video.videoId, 1280);
        if (apiBlobUrl) srcUrl = apiBlobUrl;
      } catch {}
      if (!srcUrl) {
        // Fallback: usar a primeira URL de preview atual
        const urls = bunnyStreamService.getPreferredThumbnailUrlsFromVideo(video);
        srcUrl = urls[0] || '';
      }
      if (!srcUrl) throw new Error('Não foi possível obter a imagem de origem');

      // 2) Carregar a imagem
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('Falha ao carregar imagem de origem'));
        image.src = srcUrl as string;
      });

      // 3) Calcular retângulo de recorte (cover) com foco posX/posY
      const targetW = 1280;
      const targetH = 720;
      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas não suportado');

      const imgW = img.naturalWidth || img.width;
      const imgH = img.naturalHeight || img.height;
      const scale = Math.max(targetW / imgW, targetH / imgH);
      const drawW = imgW * scale;
      const drawH = imgH * scale;
      // foco em porcentagem
      const fx = Math.max(0, Math.min(100, prefs.posX)) / 100;
      const fy = Math.max(0, Math.min(100, prefs.posY)) / 100;
      // posição para centralizar o foco desejado
      let dx = -(drawW - targetW) * fx;
      let dy = -(drawH - targetH) * fy;
      // clamp para não deixar bordas vazias
      dx = Math.min(0, Math.max(dx, targetW - drawW));
      dy = Math.min(0, Math.max(dy, targetH - drawH));

      ctx.drawImage(img, dx, dy, drawW, drawH);

      // 4) Converter para blob e enviar
      const blob: Blob = await new Promise((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Falha ao gerar imagem'))), 'image/jpeg', 0.9);
      });
      const file = new File([blob], `thumb_${Date.now()}.jpg`, { type: 'image/jpeg' });

      await bunnyStreamService.uploadThumbnail(video.videoId, file);

      // 5) Limpeza e feedback
      localStorage.removeItem(`thumb_prefs_${video.videoId}`);
      showSuccess('Thumbnail atualizada!', 'O enquadramento foi aplicado e enviado.');
      // Dar tempo para o Bunny propagar
      setTimeout(() => {
        onThumbnailUpdated();
        onClose();
      }, 3500);
    } catch (e: any) {
      console.error(e);
      showError('Erro ao aplicar enquadramento', e?.message || 'Tente novamente');
    } finally {
      setUploading(false);
    }
  };

  const objectFitClass = 'object-cover';
  const objectPosition = useMemo(() => `${Math.max(0, Math.min(100, prefs.posX))}% ${Math.max(0, Math.min(100, prefs.posY))}%`, [prefs.posX, prefs.posY]);

  const previewUrl = useMemo(() => {
    // Usa a melhor URL disponível atualmente para pré-visualização
    const urls = bunnyStreamService.getPreferredThumbnailUrlsFromVideo(video);
    return urls[0];
  }, [video]);

  // Drag para definir foco (posX/posY)
  const previewRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const onPointerDown = (e: React.PointerEvent) => {
    draggingRef.current = true;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    updateFromEvent(e);
  };
  const releasePointer = (e: React.PointerEvent) => {
    draggingRef.current = false;
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  };
  const onPointerUp = (e: React.PointerEvent) => releasePointer(e);
  const onPointerCancel = (e: React.PointerEvent) => releasePointer(e);
  const onPointerLeave = (e: React.PointerEvent) => releasePointer(e);
  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    updateFromEvent(e);
  };
  const updateFromEvent = (e: React.PointerEvent) => {
    const el = previewRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPrefs(p => ({ ...p, posX: Math.max(0, Math.min(100, x)), posY: Math.max(0, Math.min(100, y)) }));
  };


  // Fecha com ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative max-w-4xl w-full rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-900 to-gray-800 backdrop-blur-sm shadow-2xl animate-in fade-in zoom-in duration-300 max-h-[95vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-600/20 rounded-xl">
              <ImageIcon className="text-red-400" size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Gerenciar Thumbnail</h3>
              <p className="text-gray-400 text-sm">Configure a imagem de capa do seu vídeo</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={cropAndUpload}
              disabled={uploading}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold transition-all duration-200 shadow-lg disabled:shadow-none"
            >
              <Crop size={18} />
              {uploading ? 'Aplicando...' : 'Aplicar'}
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-all duration-200 p-2 hover:bg-gray-700/50 rounded-lg"
              aria-label="Fechar"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Video Info */}
          <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600/20 rounded-lg">
                <Crosshair className="text-blue-400" size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-white text-lg">{video.title}</h4>
                <p className="text-sm text-gray-400">ID: <span className="font-mono">{video.videoId}</span></p>
              </div>
            </div>
          </div>

          {/* Upload Custom Thumbnail */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-600/20 rounded-lg">
                <Upload className="text-red-400" size={20} />
              </div>
              <div>
                <h4 className="text-xl font-semibold text-white">Nova Thumbnail</h4>
                <p className="text-gray-400 text-sm">Faça upload de uma imagem personalizada</p>
              </div>
            </div>
            
            <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6 space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => {
                  console.log('🖱️ Botão clicado, abrindo seletor de arquivo...');
                  fileInputRef.current?.click();
                }}
                disabled={uploading}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-600 disabled:to-gray-700 px-6 py-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-200 font-semibold text-white shadow-lg disabled:shadow-none"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Enviando thumbnail...
                  </>
                ) : (
                  <>
                    <Upload size={20} />
                    Selecionar Nova Imagem
                  </>
                )}
              </button>
              <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                <span>JPG, PNG ou WebP</span>
                <span>•</span>
                <span>16:9 recomendado</span>
                <span>•</span>
                <span>1280×720 ideal</span>
              </div>
            </div>
          </div>

          {/* Enquadramento por arraste */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-600/20 rounded-lg">
                <Crosshair className="text-purple-400" size={20} />
              </div>
              <div>
                <h4 className="text-xl font-semibold text-white">Ajustar Enquadramento</h4>
                <p className="text-gray-400 text-sm">Clique e arraste na imagem para reposicionar o foco</p>
              </div>
            </div>
            
            <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Posição do foco na imagem</span>
                <button
                  onClick={() => setPrefs(p => ({ ...p, posX: 50, posY: 50 }))}
                  className="px-3 py-1.5 rounded-lg border border-gray-600/50 hover:bg-gray-700/50 text-gray-300 hover:text-white text-sm transition-all duration-200"
                >
                  Centralizar
                </button>
              </div>
              
              {/* Pré-visualização Interativa */}
              <div
                ref={previewRef}
                className="w-full aspect-video rounded-xl overflow-hidden border-2 border-gray-600/50 bg-gray-800 relative touch-none select-none cursor-crosshair hover:border-purple-500/50 transition-colors duration-200"
                onPointerDown={onPointerDown}
                onPointerUp={onPointerUp}
                onPointerMove={onPointerMove}
                onPointerCancel={onPointerCancel}
                onPointerLeave={onPointerLeave}
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Pré-visualização"
                    className={`w-full h-full ${objectFitClass}`}
                    style={{ objectPosition }}
                    draggable={false}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <div className="text-center space-y-2">
                      <ImageIcon size={48} className="mx-auto opacity-50" />
                      <p>Sem pré-visualização disponível</p>
                    </div>
                  </div>
                )}
                
                {/* Indicador de foco */}
                <div
                  className="absolute w-6 h-6 -ml-3 -mt-3 rounded-full border-2 border-white bg-red-500/80 pointer-events-none shadow-lg animate-pulse"
                  style={{ left: `${prefs.posX}%`, top: `${prefs.posY}%` }}
                />
                
                {/* Grid de ajuda */}
                <div className="absolute inset-0 pointer-events-none opacity-20">
                  <div className="w-full h-full grid grid-cols-3 grid-rows-3">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div key={i} className="border border-white/20" />
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-xs text-gray-400">
                  Clique e arraste para ajustar o ponto focal • O ponto vermelho indica onde será o centro da imagem
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThumbnailManager;
