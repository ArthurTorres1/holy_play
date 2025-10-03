import React, { useState, useRef, useMemo } from 'react';
import axios from 'axios';
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
  const thumbInputRef = useRef<HTMLInputElement>(null);
  const thumbPreviewUrl = useMemo(() => (thumbFile ? URL.createObjectURL(thumbFile) : ''), [thumbFile]);

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
          await axios.post(`/api/videos/${videoId}/description`, { description: description.trim() });
        } catch (e) {
          console.warn('Falha ao salvar descrição no backend:', e);
        }
      }

      // Passo 3 (opcional): Enviar thumbnail simples (sem crop)
      if (thumbFile) {
        try {
          await bunnyStreamService.uploadThumbnail(videoId, thumbFile);
        } catch (err) {
          console.warn('Falha ao enviar thumbnail, seguindo sem ela:', err);
        }
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Upload de Vídeo</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {step === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Área de Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Arquivo de Vídeo *</label>
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
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Título *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Digite o título do vídeo"
                  required
                />
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Descrição</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Digite uma descrição para o vídeo (opcional)"
                />
              </div>

              {/* Ações */}
              <div className="flex gap-4">
                <button type="button" onClick={onClose} className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={!file || !title.trim() || uploading} className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors">
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
                <p className="text-gray-400">Seu vídeo foi enviado com sucesso e está sendo processado.</p>
                <p className="text-sm text-gray-500 mt-2">O processamento pode levar alguns minutos dependendo do tamanho do arquivo.</p>
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
                  <button onClick={onClose} className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">Fechar</button>
                  <button onClick={() => setStep('form')} className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">Tentar Novamente</button>
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
