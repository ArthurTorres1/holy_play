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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative max-w-2xl w-full rounded-xl border border-gray-800 bg-black/90 backdrop-blur-sm p-4 shadow-2xl animate-in fade-in zoom-in duration-300 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Thumbnail</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={cropAndUpload}
              disabled={uploading}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-sm"
            >
              Aplicar
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
              onPointerCancel={onPointerCancel}
              onPointerLeave={onPointerLeave}
              aria-label="Fechar"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Video Info */}
        <div className="mb-4 p-3 bg-gray-800/50 rounded-lg">
          <h4 className="font-medium text-white mb-1">{video.title}</h4>
          <p className="text-sm text-gray-400">ID: {video.videoId}</p>
        </div>

        {/* Upload Custom Thumbnail */}
        <div className="mb-4">
          <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <ImageIcon size={20} />
            Selecione sua Thumbnail
          </h4>
          <div className="space-y-3">
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
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium text-white"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Enviando thumbnail...
                </>
              ) : (
                <>
                  <Upload size={20} />
                  Selecionar Imagem
                </>
              )}
            </button>
            <p className="text-xs text-gray-400 text-center">JPG, PNG ou WebP • 16:9 recomendado (1280×720)</p>
          </div>
        </div>

        {/* Enquadramento por arraste (sempre cover) */}
        <div className="mb-4">
          <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Crosshair size={20} />
            Enquadramento (toque/arraste na pré-visualização)
          </h4>
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
            <span>Toque e arraste (ou clique e arraste) diretamente na imagem para reposicionar.</span>
            <button
              onClick={() => setPrefs(p => ({ ...p, posX: 50, posY: 50 }))}
              className="ml-auto px-2 py-1 rounded border border-gray-600 hover:bg-gray-700 text-gray-200"
            >Centralizar</button>
          </div>
        </div>

        {/* Pré-visualização */}
        <div className="mb-4">
          <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Crop size={20} />
            Pré-visualização (16:9)
          </h4>
          <div
            ref={previewRef}
            className="w-full aspect-video rounded-lg overflow-hidden border border-gray-700 bg-gray-800 relative touch-none select-none"
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
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">Sem pré-visualização</div>
            )}
            {/* Indicador de foco */}
            <div
              className="absolute w-4 h-4 -ml-2 -mt-2 rounded-full border-2 border-white bg-white/40 pointer-events-none"
              style={{ left: `${prefs.posX}%`, top: `${prefs.posY}%` }}
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default ThumbnailManager;
