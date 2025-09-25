import React, { useState, useRef } from 'react';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import bunnyStreamService from '../../services/bunnyStreamApi';

interface VideoUploadProps {
  onClose: () => void;
  onSuccess: () => void;
}

const VideoUpload: React.FC<VideoUploadProps> = ({ onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [step, setStep] = useState<'form' | 'uploading' | 'success' | 'error'>('form');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Validar tipo de arquivo
      const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/webm'];
      if (!allowedTypes.includes(selectedFile.type)) {
        alert('Tipo de arquivo não suportado. Use MP4, AVI, MOV, WMV, FLV ou WebM.');
        return;
      }

      // Validar tamanho (máximo 2GB)
      const maxSize = 2 * 1024 * 1024 * 1024; // 2GB
      if (selectedFile.size > maxSize) {
        alert('Arquivo muito grande. O tamanho máximo é 2GB.');
        return;
      }

      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      // Criar um evento simulado para o input de arquivo
      if (fileInputRef.current) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(droppedFile);
        fileInputRef.current.files = dataTransfer.files;
        
        const fakeEvent = {
          target: fileInputRef.current
        } as React.ChangeEvent<HTMLInputElement>;
        handleFileSelect(fakeEvent);
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
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
      setUploadProgress(0);

      // Passo 1: Criar o vídeo na API (apenas metadados)
      const videoResponse = await bunnyStreamService.createVideo(title, description);
      
      // Passo 2: Upload do arquivo
      await bunnyStreamService.uploadVideoFile(
        videoResponse.videoId,
        file,
        (progress) => setUploadProgress(progress)
      );

      setStep('success');
      setTimeout(() => {
        onSuccess();
      }, 2000);

    } catch (error) {
      console.error('Erro no upload:', error);
      setError('Erro ao fazer upload do vídeo. Tente novamente.');
      setStep('error');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
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
            disabled={uploading}
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
                  Arquivo de Vídeo
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
                        Formatos suportados: MP4, AVI, MOV, WMV, FLV, WebM (máx. 2GB)
                      </p>
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
                  disabled={!file || !title.trim()}
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
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-400">{uploadProgress}% concluído</p>
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

export default VideoUpload;
