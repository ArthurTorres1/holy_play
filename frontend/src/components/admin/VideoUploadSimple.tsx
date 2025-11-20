import React, { useState, useRef, useMemo, useEffect } from 'react';
import axios from 'axios';
import { X, Upload, CheckCircle, AlertCircle, Crosshair, Image as ImageIcon } from 'lucide-react';
import bunnyStreamService from '../../services/bunnyStreamApi';
import { apiFetch } from '../../utils/api';

interface VideoUploadSimpleProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface VideoCategory {
  id: number;
  name: string;
  slug: string;
}

const VideoUploadSimple: React.FC<VideoUploadSimpleProps> = ({ onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState<'form' | 'uploading' | 'success' | 'error'>('form');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Categorias
  const [categories, setCategories] = useState<VideoCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [loadingCategory, setLoadingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);

  // Função para upload de thumbnail com retry e delay
  const uploadThumbnailWithRetry = async (videoId: string, thumbFile: File, maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Aguardar antes de cada tentativa (mais tempo na primeira)
        const delay = attempt === 1 ? 5000 : 2000 * attempt;
        console.log(`📸 Tentativa ${attempt}/${maxRetries} - Aguardando ${delay}ms antes de enviar thumbnail...`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        
        console.log(`📸 Enviando thumbnail (tentativa ${attempt}/${maxRetries})...`);
        await bunnyStreamService.uploadThumbnail(videoId, thumbFile);
        
        console.log(`✅ Thumbnail enviada com sucesso na tentativa ${attempt}`);
        return; // Sucesso, sair da função
        
      } catch (err) {
        console.warn(`⚠️ Falha na tentativa ${attempt}/${maxRetries}:`, err);
        
        if (attempt === maxRetries) {
          console.error('❌ Todas as tentativas de upload de thumbnail falharam:', err);
        }
      }
    }
  };

  // Thumbnail opcional
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);
  const thumbPreviewUrl = useMemo(() => (thumbFile ? URL.createObjectURL(thumbFile) : ''), [thumbFile]);

  // Carregar categorias ao abrir o modal
  useEffect(() => {
    let cancelled = false;

    const loadCategories = async () => {
      try {
        setLoadingCategory(true);
        const res = await apiFetch('/api/videos/categories');
        if (!res.ok) {
          throw new Error('Falha ao carregar categorias');
        }
        const data: VideoCategory[] = await res.json();
        if (!cancelled) {
          setCategories(data);
        }
      } catch (err) {
        console.error('Erro ao carregar categorias:', err);
      } finally {
        if (!cancelled) {
          setLoadingCategory(false);
        }
      }
    };

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const allowedMimeTypes = [
        'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-ms-wmv', 'video/x-flv', 'video/webm', 'video/3gpp', 'video/3gpp2', 'video/x-matroska'
      ];
      const allowedExtensions = ['.mp4', '.m4v', '.mov', '.avi', '.wmv', '.flv', '.webm', '.3gp', '.3g2', '.mkv'];

      const fileType = selectedFile.type?.toLowerCase();
      const fileName = selectedFile.name?.toLowerCase() || '';
      const hasAllowedMime = !!fileType && (fileType.startsWith('video/') || allowedMimeTypes.includes(fileType));
      const hasAllowedExt = allowedExtensions.some(ext => fileName.endsWith(ext));

      if (!hasAllowedMime && !hasAllowedExt) {
        alert('Tipo de arquivo não suportado. Formatos aceitos: MP4, MOV, M4V, AVI, WMV, FLV, WebM, 3GP, 3G2, MKV.');
        return;
      }

      setFile(selectedFile);
      if (!title) setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
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
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile && fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(droppedFile);
      fileInputRef.current.files = dataTransfer.files;
      const fakeEvent = { target: fileInputRef.current } as React.ChangeEvent<HTMLInputElement>;
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
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
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

      // Passo 1: Criar o vídeo (metadados)
      const created = await bunnyStreamService.createVideo(title.trim(), description.trim() || undefined);
      const videoId = created.videoId;

      // Passo 2: Upload do arquivo
      await bunnyStreamService.uploadVideoFile(videoId, file);

      // Passo 2.1: Atualizar metadados
      try {
        await bunnyStreamService.updateVideo(videoId, title.trim(), description.trim() || undefined);
      } catch (e) {
        console.warn('Não foi possível confirmar atualização de metadados, seguindo assim mesmo:', e);
      }

      // Passo 2.2: Persistir a descrição no backend
      if (description && description.trim().length > 0) {
        try {
          const { buildApiUrl } = await import('../../config/api');
          await axios.post(buildApiUrl(`api/videos/${videoId}/description`), { description: description.trim() });
        } catch (e) {
          console.warn('Falha ao salvar descrição no backend:', e);
        }
      }

      // Passo 2.3: Salvar categoria (se selecionada)
      if (selectedCategoryId !== null) {
        try {
          const resCat = await apiFetch(`/api/videos/${videoId}/category`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ categoryId: selectedCategoryId }),
          });

          if (!resCat.ok) {
            console.warn('Falha ao salvar categoria do vídeo:', resCat.status);
          }
        } catch (err) {
          console.warn('Erro ao salvar categoria do vídeo:', err);
        }
      }

      // Passo 3: Upload de thumbnail assíncrono (não bloqueia o processo)
      if (thumbFile) {
        console.log('📸 Iniciando upload de thumbnail em background...');
        // Fazer upload da thumbnail em background com retry
        uploadThumbnailWithRetry(videoId, thumbFile).then(() => {
          console.log('🎉 Upload de thumbnail concluído com sucesso!');
        }).catch((err) => {
          console.error('❌ Upload de thumbnail falhou definitivamente:', err);
        });
      }

      setStep('success');
      setTimeout(() => onSuccess(), 1500);
    } catch (error) {
      console.error('Erro no upload:', error);
      setError(`Erro ao fazer upload do vídeo: ${error}`);
      setStep('error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl w-full max-w-3xl max-h-[95vh] overflow-y-auto shadow-2xl border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-600/20 rounded-xl">
              <Upload className="text-red-400" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Adicionar Novo Vídeo</h2>
              <p className="text-gray-400 text-sm">Faça upload e configure seu conteúdo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-all duration-200 p-2 hover:bg-gray-700/50 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {step === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Área de Upload */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <Upload size={16} />
                  Arquivo de Vídeo *
                </label>
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
                    file 
                      ? 'border-green-500/50 bg-green-500/5' 
                      : 'border-gray-600 hover:border-red-500/50 hover:bg-red-500/5'
                  }`}
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
                    <div className="space-y-4">
                      <div className="p-4 bg-green-500/20 rounded-full w-fit mx-auto">
                        <CheckCircle className="text-green-400" size={32} />
                      </div>
                      <div>
                        <p className="text-white font-semibold text-lg">{file.name}</p>
                        <p className="text-green-400 font-medium">{formatFileSize(file.size)}</p>
                        <p className="text-sm text-gray-400 mt-2">✓ Arquivo selecionado com sucesso</p>
                        <button 
                          type="button"
                          className="mt-3 text-sm text-red-400 hover:text-red-300 underline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFile(null);
                            setTitle('');
                          }}
                        >
                          Remover arquivo
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-700/50 rounded-full w-fit mx-auto">
                        <Upload className="text-gray-400" size={32} />
                      </div>
                      <div>
                        <p className="text-white text-lg font-medium mb-2">Arraste seu vídeo aqui</p>
                        <p className="text-gray-400 mb-4">ou clique para selecionar do seu computador</p>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-600/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
                          <Upload size={14} />
                          Selecionar Arquivo
                        </div>
                        <p className="text-xs text-gray-500 mt-4 max-w-md mx-auto">
                          Formatos aceitos: MP4, MOV, M4V, AVI, WMV, FLV, WebM, 3GP, 3G2, MKV
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Thumbnail opcional */}
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
                  <p className="text-xs text-gray-400 text-center">JPG, PNG, WebP - 16:9 recomendado (1280x720)</p>

                  {thumbFile && (
                    <>
                      <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                        <Crosshair size={16} />Pré-visualização
                      </h4>
                      <div className="w-full aspect-video rounded-lg overflow-hidden border border-gray-700 bg-gray-800 relative">
                        <img src={thumbPreviewUrl} alt="Pré-visualização" className="w-full h-full object-cover" />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Título */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  Título do Vídeo *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-red-500/50 focus:bg-gray-800 transition-all duration-200"
                  placeholder="Ex: Minha Pregação Especial"
                  required
                />
                <p className="text-xs text-gray-500">Este será o nome exibido na plataforma</p>
              </div>

              {/* Descrição */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                  Descrição (Opcional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-red-500/50 focus:bg-gray-800 transition-all duration-200 resize-none"
                  placeholder="Descreva o conteúdo do seu vídeo, temas abordados, versículos citados..."
                />
                <p className="text-xs text-gray-500">Ajuda os usuários a entenderem o conteúdo do vídeo</p>
              </div>

              {/* Categoria (Opcional) */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Categoria (Opcional)
                </label>
                <div className="bg-gray-800/40 border border-gray-700/60 rounded-xl p-4 space-y-3">
                  {loadingCategory ? (
                    <p className="text-sm text-gray-400">Carregando categorias...</p>
                  ) : categories.length === 0 ? (
                    <p className="text-sm text-gray-400">Nenhuma categoria cadastrada ainda.</p>
                  ) : (
                    <select
                      value={selectedCategoryId ?? ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSelectedCategoryId(value ? Number(value) : null);
                      }}
                      className="w-full px-4 py-2 bg-gray-900/60 border border-gray-700/70 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500/70 focus:bg-gray-900 transition-all duration-200"
                    >
                      <option value="">Selecione uma categoria</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  )}

                  <div className="mt-2 space-y-2">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Nova categoria (ex: Louvor, Estudos Bíblicos)"
                      className="w-full px-3 py-2 bg-gray-900/60 border border-gray-700/70 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-green-500/70 focus:bg-gray-900 transition-all duration-200"
                    />
                    <button
                      type="button"
                      disabled={creatingCategory || !newCategoryName.trim()}
                      onClick={async () => {
                        const name = newCategoryName.trim();
                        if (!name) return;
                        try {
                          setCreatingCategory(true);
                          const res = await apiFetch('/api/videos/categories', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ name }),
                          });

                          if (!res.ok) {
                            throw new Error('Não foi possível criar a categoria');
                          }

                          const created: VideoCategory = await res.json();
                          setCategories((prev) => {
                            const exists = prev.some((c) => c.id === created.id);
                            if (exists) return prev;
                            return [...prev, created].sort((a, b) => a.name.localeCompare(b.name));
                          });
                          setSelectedCategoryId(created.id);
                          setNewCategoryName('');
                        } catch (err: any) {
                          console.error('Erro ao criar categoria:', err);
                          alert(err?.message || 'Não foi possível criar a categoria.');
                        } finally {
                          setCreatingCategory(false);
                        }
                      }}
                      className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-green-600/80 hover:bg-green-600 disabled:bg-gray-700 text-xs font-semibold text-white transition-all duration-200"
                    >
                      {creatingCategory ? 'Criando categoria...' : 'Criar nova categoria'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className="flex gap-4 pt-4 border-t border-gray-700/50">
                <button 
                  type="button" 
                  onClick={onClose} 
                  className="flex-1 px-6 py-3 bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white rounded-xl transition-all duration-200 font-medium border border-gray-600/50 hover:border-gray-500"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={!file || !title.trim() || uploading} 
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 font-semibold shadow-lg disabled:shadow-none flex items-center justify-center gap-2"
                >
                  <Upload size={18} />
                  {uploading ? 'Enviando...' : 'Fazer Upload'}
                </button>
              </div>
            </form>
          )}

          {step === 'uploading' && (
            <div className="text-center space-y-8 py-8">
              <div className="relative">
                <div className="animate-spin rounded-full h-20 w-20 border-4 border-red-500/20 border-t-red-500 mx-auto"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Upload className="text-red-400" size={24} />
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white">Enviando seu vídeo</h3>
                <div className="space-y-2">
                  <p className="text-gray-300">Por favor, mantenha esta janela aberta</p>
                  <p className="text-sm text-gray-400">Processando e enviando para a plataforma...</p>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 max-w-xs mx-auto">
                  <div className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                </div>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center space-y-8 py-8">
              <div className="relative">
                <div className="p-6 bg-green-500/20 rounded-full w-fit mx-auto">
                  <CheckCircle className="text-green-400" size={48} />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white">Upload Concluído!</h3>
                <div className="space-y-2">
                  <p className="text-green-400 font-medium">Seu vídeo foi enviado com sucesso</p>
                  <p className="text-gray-400">O processamento será feito automaticamente</p>
                  <p className="text-sm text-gray-500">Pode levar alguns minutos para aparecer na biblioteca</p>
                </div>
                <div className="pt-4">
                  <button 
                    onClick={onSuccess}
                    className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg"
                  >
                    Continuar
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 'error' && (
            <div className="text-center space-y-8 py-8">
              <div className="relative">
                <div className="p-6 bg-red-500/20 rounded-full w-fit mx-auto">
                  <AlertCircle className="text-red-400" size={48} />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">!</span>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white">Ops! Algo deu errado</h3>
                <div className="space-y-2">
                  <p className="text-red-400 font-medium">Não foi possível fazer o upload</p>
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 max-w-md mx-auto">
                    <p className="text-gray-300 text-sm">{error}</p>
                  </div>
                </div>
                <div className="flex gap-4 justify-center pt-4">
                  <button 
                    onClick={onClose} 
                    className="px-6 py-3 bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white rounded-xl transition-all duration-200 font-medium border border-gray-600/50"
                  >
                    Fechar
                  </button>
                  <button 
                    onClick={() => setStep('form')} 
                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg"
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
