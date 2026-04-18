import { useState, useCallback } from 'react';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

let globalToasts: Toast[] = [];
let listeners: ((toasts: Toast[]) => void)[] = [];

function notifyListeners() {
  listeners.forEach(listener => listener([...globalToasts]));
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    const toast: Toast = { id, message, type };
    globalToasts.push(toast);
    notifyListeners();
    setToasts([...globalToasts]);

    setTimeout(() => {
      globalToasts = globalToasts.filter(t => t.id !== id);
      notifyListeners();
      setToasts([...globalToasts]);
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    globalToasts = globalToasts.filter(t => t.id !== id);
    notifyListeners();
    setToasts([...globalToasts]);
  }, []);

  return { toasts, showToast, removeToast };
}