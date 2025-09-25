import { useState, useCallback } from 'react';

interface ConfirmState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  type: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export const useConfirm = () => {
  const [confirm, setConfirm] = useState<ConfirmState>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    type: 'warning',
    onConfirm: () => {},
    onCancel: () => {}
  });

  const showConfirm = useCallback((
    title: string,
    message: string,
    onConfirm: () => void,
    options?: {
      confirmText?: string;
      cancelText?: string;
      type?: 'danger' | 'warning' | 'info';
    }
  ) => {
    return new Promise<boolean>((resolve) => {
      setConfirm({
        isOpen: true,
        title,
        message,
        confirmText: options?.confirmText || 'Confirmar',
        cancelText: options?.cancelText || 'Cancelar',
        type: options?.type || 'warning',
        onConfirm: () => {
          onConfirm();
          setConfirm(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setConfirm(prev => ({ ...prev, isOpen: false }));
          resolve(false);
        }
      });
    });
  }, []);

  const hideConfirm = useCallback(() => {
    setConfirm(prev => ({ ...prev, isOpen: false }));
  }, []);

  return {
    confirm,
    showConfirm,
    hideConfirm
  };
};
