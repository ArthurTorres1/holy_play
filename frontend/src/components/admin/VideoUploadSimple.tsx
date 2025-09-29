import React, { useState, useRef, useMemo } from 'react';
import { X, Upload, CheckCircle, AlertCircle, Crosshair, Image as ImageIcon } from 'lucide-react';
import bunnyStreamService from '../../services/bunnyStreamApi';

interface VideoUploadSimpleProps {
  onClose: () => void;
  onSuccess: () => void;
}

const VideoUploadSimple: React.FC<VideoUploadSimpleProps> = ({ onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState<'form' | 'uploading' | 'success' | 'error'>('form');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Thumbnail opcional
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [posX, setPosX] = useState(50); // 0..100
  const [posY, setPosY] = useState(50); // 0..100
  const thumbInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Validação de tipo de arquivo (ampla, cobrindo iOS/Android e formatos comuns) kspsaodfoodoadapddaabdoa
      // Observação: alguns dispositivos retornam type vazio, então fazemos fallback por extensão
      const allowedMimeTypes = [
        'video/mp4',
        'video/quicktime',        // MOV (iOS)
        'video/x-msvideo',        // AVI
        'video/x-ms-wmv',         // WMV
        'video/x-flv',            // FLV
        'video/webm',
        'video/3gpp',             // 3GP (Android)
        'video/3gpp2',            // 3G2
        'video/x-matroska',       // MKV
      ];

      const allowedExtensions = [
        '.mp4', '.m4v', '.mov', '.avi', '.wmv', '.flv', '.webm', '.3gp', '.3g2', '.mkv'
      ];

      const fileType = selectedFile.type?.toLowerCase();
      const fileName = selectedFile.name?.toLowerCase() || '';
      const hasAllowedMime = !!fileType && (fileType.startsWith('video/') || allowedMimeTypes.includes(fileType));
      const hasAllowedExt = allowedExtensions.some(ext => fileName.endsWith(ext));

      if (!hasAllowedMime && !hasAllowedExt) {
        alert('Tipo de arquivo não suportado. Formatos aceitos: MP4, MOV, M4V, AVI, WMV, FLV, WebM, 3GP, 3G2, MKV.');
        return;
      }

      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleThumbSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const f = event.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      alert('Selecione uma imagem válida para a thumbnail.');
      return;
    }
    setThumbFile(f);
    // centraliza por padrão
    setPosX(50);
    setPosY(50);
  };

  const thumbPreviewUrl = useMemo(() => (thumbFile ? URL.createObjectURL(thumbFile) : ''), [thumbFile]);

  const onPointerDown = (e: React.PointerEvent) => {
    draggingRef.current = true;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    updateFromEvent(e);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    draggingRef.current = false;
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  };
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
    setPosX(Math.max(0, Math.min(100, x)));
    setPosY(Math.max(0, Math.min(100, y)));
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile && fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(droppedFile);
      fileInputRef.current.files = dataTransfer.files;
      
      const fakeEvent = {
        target: fileInputRef.current
      } as React.ChangeEvent<HTMLInputElement>;
      handleFileSelect(fakeEvent);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!title.trim()) {
      alert('Por favor, insira um título para o vídeo.');
      return;
    }

    if (!file) {
      alert('Por favor, selecione um arquivo de vídeo.');
      return;
    }

    try {
      setUploading(true);
      setStep('uploading');
      // reset states visuais se necessário

      // Passo 1: Criar o vídeo na API (apenas metadados) usando o serviço (usa .env)
      const created = await bunnyStreamService.createVideo(title.trim(), description.trim() || undefined);
      const videoId = created.videoId;

      // Passo 2: Upload do arquivo usando o serviço
      await bunnyStreamService.uploadVideoFile(videoId, file);

      // Passo 2.1: Garantir metadados (description) persistidos
      try {
        await bunnyStreamService.updateVideo(videoId, title.trim(), description.trim() || undefined);
      } catch (e) {
        console.warn('Não foi possível confirmar atualização de metadados, seguindo assim mesmo:', e);
      }

      // Passo 3 (opcional): se usuário escolheu uma thumb, gerar e enviar como thumbnail do vídeo
      if (thumbFile) {
        try {
          const targetW = 1280;
          const targetH = 720;
          const img = await new Promise<HTMLImageElement>((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = () => reject(new Error('Falha ao carregar a thumbnail'));
            image.src = URL.createObjectURL(thumbFile);
          });
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
          const fx = Math.max(0, Math.min(100, posX)) / 100;
          const fy = Math.max(0, Math.min(100, posY)) / 100;
          let dx = -(drawW - targetW) * fx;
          let dy = -(drawH - targetH) * fy;
          dx = Math.min(0, Math.max(dx, targetW - drawW));
          dy = Math.min(0, Math.max(dy, targetH - drawH));
          ctx.drawImage(img, dx, dy, drawW, drawH);
          const blob: Blob = await new Promise((resolve, reject) => {
            canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Falha ao gerar imagem'))), 'image/jpeg', 0.9);
          });
          const outFile = new File([blob], `thumb_${Date.now()}.jpg`, { type: 'image/jpeg' });
          await bunnyStreamService.uploadThumbnail(videoId, outFile);
        } catch (err) {
          console.warn('Falha ao aplicar thumbnail customizada, seguindo sem ela:', err);
        }
      }

      setStep('success');
      // Dar um tempo para a API propagar metadados e a thumb
      setTimeout(() => {
        onSuccess();
      }, 3000);

    } catch (error) {
      console.error('Erro no upload:', error);
      setError(`Erro ao fazer upload do vídeo: ${error}`);
      setStep('error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Upload de Vídeo</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {step === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* File Upload Area */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Arquivo de Vídeo *
                </label>
                <div
                  className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-gray-500 transition-colors cursor-pointer"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  {file ? (
                    <div className="space-y-2">
                      <CheckCircle className="mx-auto text-green-400" size={48} />
                      <p className="text-white font-medium">{file.name}</p>
                      <p className="text-gray-400">{formatFileSize(file.size)}</p>
                      <p className="text-sm text-gray-500">Clique para alterar o arquivo</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="mx-auto text-gray-400" size={48} />
                      <p className="text-white">Arraste e solte seu vídeo aqui</p>
                      <p className="text-gray-400">ou clique para selecionar</p>
                      <p className="text-sm text-gray-500">
                        Formatos suportados: MP4, MOV, M4V, AVI, WMV, FLV, WebM, 3GP, 3G2, MKV
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Thumbnail opcional (fora do container do vídeo) */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ImageIcon size={18} className="text-gray-300" />
                  <label className="block text-sm font-medium text-gray-300">Thumbnail (opcional)</label>
                </div>
                <div className="space-y-3">
                  <input
                    ref={thumbInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleThumbSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => thumbInputRef.current?.click()}
                    className="w-full bg-red-600 hover:bg-red-700 px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 text-white"
                  >
                    <Upload size={18} /> Selecionar Imagem
                  </button>
                  <p className="text-xs text-gray-400 text-center">JPG, PNG, WebP • 16:9 recomendado (1280×720)</p>

                  {/* Pré-visualização com arraste */}
                  {thumbFile && (
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2"><Crosshair size={16} />Pré-visualização (arraste para enquadrar)</h4>
                      <div
                        ref={previewRef}
                        className="w-full aspect-video rounded-lg overflow-hidden border border-gray-700 bg-gray-800 relative touch-none select-none"
                        onPointerDown={onPointerDown}
                        onPointerUp={onPointerUp}
                        onPointerMove={onPointerMove}
                      >
                        <img
                          src={thumbPreviewUrl}
                          alt="Pré-visualização"
                          className="w-full h-full object-cover"
                          style={{ objectPosition: `${posX}% ${posY}%` }}
                        />
                        <div
                          className="absolute w-3 h-3 -ml-1.5 -mt-1.5 rounded-full border-2 border-white bg-white/40 pointer-events-none"
                          style={{ left: `${posX}%`, top: `${posY}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Digite o título do vídeo"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descrição
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Digite uma descrição para o vídeo (opcional)"
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!file || !title.trim() || uploading}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  Fazer Upload
                </button>
              </div>
            </form>
          )}

          {step === 'uploading' && (
            <div className="text-center space-y-6">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Fazendo Upload...</h3>
                <p className="text-gray-400 mb-4">Por favor, não feche esta janela</p>
                <p className="text-sm text-gray-400">Enviando arquivo para o Bunny.net...</p>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center space-y-6">
              <CheckCircle className="mx-auto text-green-400" size={64} />
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Upload Concluído!</h3>
                <p className="text-gray-400">
                  Seu vídeo foi enviado com sucesso e está sendo processado.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  O processamento pode levar alguns minutos dependendo do tamanho do arquivo.
                </p>
              </div>
            </div>
          )}

          {step === 'error' && (
            <div className="text-center space-y-6">
              <AlertCircle className="mx-auto text-red-400" size={64} />
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Erro no Upload</h3>
                <p className="text-gray-400 mb-4">{error}</p>
                <div className="flex gap-4">
                  <button
                    onClick={onClose}
                    className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    Fechar
                  </button>
                  <button
                    onClick={() => setStep('form')}
                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Tentar Novamente
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoUploadSimple;
