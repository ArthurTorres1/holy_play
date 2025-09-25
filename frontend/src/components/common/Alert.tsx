import React from 'react';
import { CheckCircle, AlertCircle, XCircle, Info, X } from 'lucide-react';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  type: AlertType;
  title: string;
  message?: string;
  isOpen: boolean;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

const Alert: React.FC<AlertProps> = ({
  type,
  title,
  message,
  isOpen,
  onClose,
  autoClose = true,
  duration = 3000
}) => {
  React.useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, duration, onClose]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={24} className="text-green-400" />;
      case 'error':
        return <XCircle size={24} className="text-red-400" />;
      case 'warning':
        return <AlertCircle size={24} className="text-yellow-400" />;
      case 'info':
        return <Info size={24} className="text-blue-400" />;
      default:
        return <Info size={24} className="text-blue-400" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return 'border-green-500/50 bg-green-500/10';
      case 'error':
        return 'border-red-500/50 bg-red-500/10';
      case 'warning':
        return 'border-yellow-500/50 bg-yellow-500/10';
      case 'info':
        return 'border-blue-500/50 bg-blue-500/10';
      default:
        return 'border-blue-500/50 bg-blue-500/10';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`relative max-w-md w-full rounded-xl border ${getColors()} backdrop-blur-sm p-6 shadow-2xl animate-in fade-in zoom-in duration-300`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        {/* Content */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">
              {title}
            </h3>
            {message && (
              <p className="text-gray-300 text-sm leading-relaxed">
                {message}
              </p>
            )}
          </div>
        </div>

        {/* Progress Bar (for auto-close) */}
        {autoClose && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700/50 rounded-b-xl overflow-hidden">
            <div 
              className={`h-full transition-all ease-linear ${
                type === 'success' ? 'bg-green-400' :
                type === 'error' ? 'bg-red-400' :
                type === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'
              }`}
              style={{
                animation: `shrink ${duration}ms linear forwards`
              }}
            />
          </div>
        )}
      </div>

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default Alert;
