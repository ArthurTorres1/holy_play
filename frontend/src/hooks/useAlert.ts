import { useState, useCallback } from 'react';
import { AlertType } from '../components/common/Alert';

interface AlertState {
  isOpen: boolean;
  type: AlertType;
  title: string;
  message?: string;
}

export const useAlert = () => {
  const [alert, setAlert] = useState<AlertState>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  const showAlert = useCallback((type: AlertType, title: string, message?: string) => {
    setAlert({
      isOpen: true,
      type,
      title,
      message
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlert(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Métodos de conveniência
  const showSuccess = useCallback((title: string, message?: string) => {
    showAlert('success', title, message);
  }, [showAlert]);

  const showError = useCallback((title: string, message?: string) => {
    showAlert('error', title, message);
  }, [showAlert]);

  const showWarning = useCallback((title: string, message?: string) => {
    showAlert('warning', title, message);
  }, [showAlert]);

  const showInfo = useCallback((title: string, message?: string) => {
    showAlert('info', title, message);
  }, [showAlert]);

  return {
    alert,
    showAlert,
    hideAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};
