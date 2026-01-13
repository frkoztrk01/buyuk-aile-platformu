'use client';

import { useState, useCallback } from 'react';
import { ToastType } from '../ui/Toast';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showSuccess = useCallback((message: string) => {
    return showToast(message, 'success');
  }, [showToast]);

  const showError = useCallback((message: string) => {
    return showToast(message, 'error');
  }, [showToast]);

  const showInfo = useCallback((message: string) => {
    return showToast(message, 'info');
  }, [showToast]);

  return {
    toasts,
    showToast,
    showSuccess,
    showError,
    showInfo,
    removeToast,
  };
}
