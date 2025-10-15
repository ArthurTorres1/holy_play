import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

interface ToastProps {
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ 
  type, 
  title, 
  message, 
  onClose, 
  duration = 5000 
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="text-green-400" size={20} />;
      case 'error':
        return <AlertCircle className="text-red-400" size={20} />;
      case 'info':
        return <Info className="text-blue-400" size={20} />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500/10 border-green-500/20 text-green-300';
      case 'error':
        return 'bg-red-500/10 border-red-500/20 text-red-300';
      case 'info':
        return 'bg-blue-500/10 border-blue-500/20 text-blue-300';
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm w-full animate-in slide-in-from-right-full duration-300`}>
      <div className={`${getStyles()} border rounded-xl p-4 shadow-2xl backdrop-blur-sm`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-white text-sm">{title}</h4>
            {message && (
              <p className="text-sm opacity-90 mt-1">{message}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast;
