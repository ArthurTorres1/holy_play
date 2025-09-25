import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  type = 'warning'
}) => {
  if (!isOpen) return null;

  const getColors = () => {
    switch (type) {
      case 'danger':
        return {
          icon: 'text-red-400',
          confirmBtn: 'bg-red-600 hover:bg-red-700',
          border: 'border-red-500/50 bg-red-500/10'
        };
      case 'warning':
        return {
          icon: 'text-yellow-400',
          confirmBtn: 'bg-yellow-600 hover:bg-yellow-700',
          border: 'border-yellow-500/50 bg-yellow-500/10'
        };
      case 'info':
        return {
          icon: 'text-blue-400',
          confirmBtn: 'bg-blue-600 hover:bg-blue-700',
          border: 'border-blue-500/50 bg-blue-500/10'
        };
      default:
        return {
          icon: 'text-yellow-400',
          confirmBtn: 'bg-yellow-600 hover:bg-yellow-700',
          border: 'border-yellow-500/50 bg-yellow-500/10'
        };
    }
  };

  const colors = getColors();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`relative max-w-md w-full rounded-xl border ${colors.border} backdrop-blur-sm p-6 shadow-2xl animate-in fade-in zoom-in duration-300`}>
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        {/* Content */}
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0">
            <AlertTriangle size={24} className={colors.icon} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">
              {title}
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-300 hover:text-white bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded-lg transition-colors font-medium ${colors.confirmBtn}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
