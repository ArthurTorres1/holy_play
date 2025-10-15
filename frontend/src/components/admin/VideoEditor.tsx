import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Upload, X, Crosshair, Image as ImageIcon, Edit, Save, Type, FileText } from 'lucide-react';
import bunnyStreamService, { Video } from '../../services/bunnyStreamApi';
import { useAlert } from '../../hooks/useAlert';
import { apiFetch } from '../../utils/api';

interface VideoEditorProps {
  video: Video;
  isOpen: boolean;
  onClose: () => void;
  onVideoUpdated: (updatedVideo: Video) => void;
}

const VideoEditor: React.FC<VideoEditorProps> = ({
  video,
  isOpen,
  onClose,
  onVideoUpdated
}) => {
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showSuccess, showError } = useAlert();

  // Estados para edição
  const [title, setTitle] = useState(video.title);
  const [description, setDescription] = useState(video.description || '');
  const [hasChanges, setHasChanges] = useState(false);

  // Estados para thumbnail
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
  
  // Estados para nova imagem selecionada
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  
  // Debug (apenas quando há mudanças importantes)
  useEffect(() => {
    if (selectedFile) {
      console.log('🔍 Nova imagem selecionada:', selectedFile.name);
    }
  }, [selectedFile]);

  // Detectar mudanças
  useEffect(() => {
    const titleChanged = title.trim() !== video.title;
    const descChanged = description.trim() !== (video.description || '');
    const hasChanges = titleChanged || descChanged;
    
    console.log('🔍 Detectando mudanças:', {
      titleOriginal: video.title,
      titleAtual: title.trim(),
      titleChanged,
      descOriginal: video.description || '',
      descAtual: description.trim(),
      descChanged,
      hasChanges
    });
    
    setHasChanges(hasChanges);
  }, [title, description, video.title, video.description]);

  // Função para limpar seleção de imagem
  const clearImageSelection = () => {
    console.log('🧹 Limpando seleção de imagem');
    if (previewImageUrl) {
      URL.revokeObjectURL(previewImageUrl);
      setPreviewImageUrl(null);
    }
    setSelectedFile(null);
    setLoadingPreview(false);
  };

  // Reset quando o vídeo muda
  useEffect(() => {
    setTitle(video.title);
    setDescription(video.description || '');
    setPrefs(loadPrefs());
    setHasChanges(false);
    clearImageSelection();
  }, [video.videoId]);

  if (!isOpen) return null;


  // Salvar tudo de uma vez (metadados + thumbnail)
  const handleSaveAll = async () => {
    if (!hasChanges && !selectedFile) return;

    setUploading(true);
    setSaving(true);
    
    try {
      showSuccess('Salvando...', 'Aplicando todas as alterações...');

      // 1. Salvar metadados se houver mudanças
      if (hasChanges) {
        console.log('💾 Salvando metadados:', {
          videoId: video.videoId,
          title: title.trim(),
          description: description.trim()
        });
        
        await bunnyStreamService.updateVideo(video.videoId, title.trim(), description.trim());
        
        const descResponse = await apiFetch(`/api/videos/${video.videoId}/description`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            description: description.trim()
          })
        });
        
        console.log('✅ Resposta da descrição:', descResponse.status, await descResponse.text());
      }

      // 2. Aplicar thumbnail se houver imagem selecionada
      if (selectedFile && previewImageUrl) {
        // Usar a imagem selecionada como fonte
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const image = new Image();
          image.onload = () => resolve(image);
          image.onerror = () => reject(new Error('Falha ao carregar imagem'));
          image.src = previewImageUrl;
        });

        // Criar canvas com crop
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

        const fx = Math.max(0, Math.min(100, prefs.posX)) / 100;
        const fy = Math.max(0, Math.min(100, prefs.posY)) / 100;

        let dx = -(drawW - targetW) * fx;
        let dy = -(drawH - targetH) * fy;
        dx = Math.min(0, Math.max(dx, targetW - drawW));
        dy = Math.min(0, Math.max(dy, targetH - drawH));

        ctx.drawImage(img, dx, dy, drawW, drawH);

        // Converter para blob e enviar
        const blob: Blob = await new Promise((resolve, reject) => {
          canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Falha ao gerar imagem'))), 'image/jpeg', 0.9);
        });
        const file = new File([blob], `thumb_${Date.now()}.jpg`, { type: 'image/jpeg' });

        await bunnyStreamService.uploadThumbnail(video.videoId, file);
      }

      // Limpa tudo após sucesso
      clearImageSelection();
      setHasChanges(false);
      
      showSuccess('Tudo salvo!', 'Título, descrição e thumbnail foram atualizados com sucesso.');
      
      // Atualiza o vídeo na lista imediatamente
      const updatedVideo = { 
        ...video, 
        title: title.trim(), 
        description: description.trim() 
      };
      
      console.log('🔄 Atualizando vídeo na lista:', updatedVideo);
      onVideoUpdated(updatedVideo);
      
      // Fecha o modal após salvar para evitar mostrar dados desatualizados
      setTimeout(() => {
        console.log('✅ Fechando modal após salvamento...');
        onClose();
      }, 1500);
      
      // Força recarregamento da lista após fechar o modal
      setTimeout(() => {
        console.log('🔄 Forçando recarregamento da lista...');
        onVideoUpdated(updatedVideo);
      }, 2000);
      
    } catch (error: any) {
      console.error('Erro ao salvar tudo:', error);
      showError('Erro ao salvar', error.message || 'Tente novamente');
    } finally {
      setUploading(false);
      setSaving(false);
    }
  };

  // Seleção de arquivo para preview (não faz upload ainda)
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.log('❌ Nenhum arquivo selecionado');
      return;
    }

    console.log('📁 Novo arquivo selecionado:', {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified
    });

    // Validação mais robusta do tipo de arquivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const isValidType = file.type && validTypes.includes(file.type.toLowerCase());
    
    if (!isValidType) {
      console.error('❌ Tipo de arquivo inválido:', file.type);
      showError('Arquivo inválido', `Tipo não suportado: ${file.type}. Use JPG, PNG, WebP ou GIF.`);
      return;
    }

    // Validação de tamanho (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      console.error('❌ Arquivo muito grande:', file.size);
      showError('Arquivo muito grande', `Tamanho: ${(file.size / 1024 / 1024).toFixed(1)}MB. Máximo: 10MB.`);
      return;
    }

    setLoadingPreview(true);

    // Limpa preview anterior SEMPRE (mesmo se for a mesma imagem)
    if (previewImageUrl) {
      console.log('🗑️ Revogando URL anterior:', previewImageUrl);
      URL.revokeObjectURL(previewImageUrl);
      setPreviewImageUrl(null);
    }

    // Limpa arquivo anterior
    if (selectedFile) {
      console.log('🗑️ Removendo arquivo anterior:', selectedFile.name);
      setSelectedFile(null);
    }

    // Pequeno delay para garantir que o estado foi limpo
    setTimeout(() => {
      try {
        const newPreviewUrl = URL.createObjectURL(file);
        console.log('🖼️ Nova URL de preview criada:', newPreviewUrl);
        
        setSelectedFile(file);
        setPreviewImageUrl(newPreviewUrl);
        
        // Reset do enquadramento para centralizado
        setPrefs(p => ({ ...p, posX: 50, posY: 50 }));
        
        showSuccess('Nova imagem selecionada!', `${file.name} - Ajuste e aplique quantas vezes quiser`);
      } catch (error) {
        console.error('❌ Erro ao criar URL de preview:', error);
        showError('Erro ao processar imagem', 'Não foi possível criar preview da imagem selecionada.');
      } finally {
        setLoadingPreview(false);
      }
    }, 100);
  };



  // Thumbnail preview
  const objectFitClass = 'object-cover';
  const objectPosition = useMemo(() => 
    `${Math.max(0, Math.min(100, prefs.posX))}% ${Math.max(0, Math.min(100, prefs.posY))}%`, 
    [prefs.posX, prefs.posY]
  );

  const previewUrl = useMemo(() => {
    // Prioriza imagem selecionada sobre a thumbnail atual
    if (previewImageUrl) {
      return previewImageUrl;
    }
    const urls = bunnyStreamService.getPreferredThumbnailUrlsFromVideo(video);
    return urls[0];
  }, [video, previewImageUrl]);

  // Drag handlers para thumbnail
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

  // Fechar com ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Cleanup da URL de preview quando componente for desmontado
  useEffect(() => {
    return () => {
      if (previewImageUrl) {
        URL.revokeObjectURL(previewImageUrl);
      }
    };
  }, [previewImageUrl]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative max-w-5xl w-full rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-900 to-gray-800 backdrop-blur-sm shadow-2xl animate-in fade-in zoom-in duration-300 max-h-[95vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-600/20 rounded-xl">
              <Edit className="text-red-400" size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Editar Vídeo</h3>
              <p className="text-gray-400 text-sm">Configure título, descrição e thumbnail</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {(hasChanges || selectedFile) && (
              <button
                onClick={handleSaveAll}
                disabled={saving || uploading}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold transition-all duration-200 shadow-lg disabled:shadow-none"
              >
                <Save size={18} />
                {(saving || uploading) ? 'Salvando Tudo...' : 'Salvar Tudo'}
              </button>
            )}
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
          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Coluna Esquerda - Metadados */}
            <div className="space-y-6">
              {/* Título */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600/20 rounded-lg">
                    <Type className="text-blue-400" size={20} />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-white">Título do Vídeo</h4>
                    <p className="text-gray-400 text-sm">Nome que aparecerá na plataforma</p>
                  </div>
                </div>
                
                <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:bg-gray-800 transition-all duration-200"
                    placeholder="Digite o título do vídeo"
                  />
                </div>
              </div>

              {/* Descrição */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-600/20 rounded-lg">
                    <FileText className="text-purple-400" size={20} />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-white">Descrição</h4>
                    <p className="text-gray-400 text-sm">Detalhes sobre o conteúdo do vídeo</p>
                  </div>
                </div>
                
                <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 focus:bg-gray-800 transition-all duration-200 resize-none"
                    placeholder="Descreva o conteúdo, temas abordados, versículos citados..."
                  />
                </div>
              </div>
            </div>

            {/* Coluna Direita - Thumbnail */}
            <div className="space-y-6">
              {/* Upload Nova Thumbnail */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-600/20 rounded-lg">
                    <Upload className="text-red-400" size={20} />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-white">Nova Thumbnail</h4>
                    <p className="text-gray-400 text-sm">Substitua a imagem de capa</p>
                  </div>
                </div>
                
                <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6 space-y-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      console.log('📂 Input onChange disparado:', e.target.files?.length);
                      handleFileSelect(e);
                      // Limpa o input para permitir selecionar o mesmo arquivo novamente
                      e.target.value = '';
                    }}
                    className="hidden"
                  />
                  <button
                    onClick={() => {
                      console.log('🖱️ Botão de seleção clicado');
                      fileInputRef.current?.click();
                    }}
                    disabled={uploading}
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-600 disabled:to-gray-700 px-6 py-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-200 font-semibold text-white shadow-lg disabled:shadow-none"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Upload size={20} />
                        {selectedFile ? 'Trocar Imagem' : 'Selecionar Imagem'}
                      </>
                    )}
                  </button>
                  
                  {selectedFile && (
                    <button
                      onClick={clearImageSelection}
                      disabled={uploading}
                      className="w-full bg-gray-600/50 hover:bg-gray-500 disabled:bg-gray-700 text-gray-300 hover:text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 text-sm"
                    >
                      <X size={16} />
                      Cancelar Seleção
                    </button>
                  )}
                  
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                      <span>JPG, PNG, WebP</span>
                      <span>•</span>
                      <span>16:9 recomendado</span>
                    </div>
                    {selectedFile && (
                      <div className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg p-2">
                        ✓ <strong>{selectedFile.name}</strong> selecionada - Ajuste o enquadramento e clique em "Salvar Tudo"
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Ajustar Enquadramento - Só aparece quando há imagem selecionada */}
              {selectedFile && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-600/20 rounded-lg">
                      <Crosshair className="text-orange-400" size={20} />
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-white">Ajustar Enquadramento</h4>
                      <p className="text-gray-400 text-sm">Ajustando: {selectedFile.name}</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Clique e arraste na imagem</span>
                      <button
                        onClick={() => setPrefs(p => ({ ...p, posX: 50, posY: 50 }))}
                        className="px-3 py-1.5 rounded-lg border border-gray-600/50 hover:bg-gray-700/50 text-gray-300 hover:text-white text-sm transition-all duration-200"
                      >
                        Centralizar
                      </button>
                    </div>
                    
                    {/* Preview Interativo */}
                    <div
                      ref={previewRef}
                      className="w-full aspect-video rounded-xl overflow-hidden border-2 border-gray-600/50 bg-gray-800 relative touch-none select-none cursor-crosshair hover:border-orange-500/50 transition-colors duration-200"
                      onPointerDown={onPointerDown}
                      onPointerUp={onPointerUp}
                      onPointerMove={onPointerMove}
                      onPointerCancel={onPointerCancel}
                      onPointerLeave={onPointerLeave}
                    >
                      {loadingPreview ? (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <div className="text-center space-y-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-2 border-orange-500 border-t-transparent mx-auto"></div>
                            <p>Carregando preview...</p>
                          </div>
                        </div>
                      ) : previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="Pré-visualização"
                          className={`w-full h-full ${objectFitClass}`}
                          style={{ objectPosition }}
                          draggable={false}
                          onLoad={() => console.log('✅ Imagem de preview carregada:', previewUrl)}
                          onError={(e) => console.error('❌ Erro ao carregar preview:', previewUrl, e)}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <div className="text-center space-y-2">
                            <ImageIcon size={48} className="mx-auto opacity-50" />
                            <p>Sem pré-visualização</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Indicador de foco */}
                      <div
                        className="absolute w-6 h-6 -ml-3 -mt-3 rounded-full border-2 border-white bg-red-500/80 pointer-events-none shadow-lg animate-pulse"
                        style={{ left: `${prefs.posX}%`, top: `${prefs.posY}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoEditor;
