import { useState, useCallback, useEffect, useRef } from 'react';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export let globalToasts: Toast[] = [];
export let listeners: ((toasts: Toast[]) => void)[] = [];
export const activeTimeouts: Map<string, NodeJS.Timeout> = new Map();

export function resetToastState() {
  globalToasts = [];
  listeners = [];
  activeTimeouts.forEach(t => clearTimeout(t));
  activeTimeouts.clear();
}

function notifyListeners() {
  listeners.forEach(listener => listener([...globalToasts]));
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const isMounted = useRef(true);

  useEffect(() => {
    const listener = (t: Toast[]) => {
      if (isMounted.current) setToasts([...t]);
    };
    listeners.push(listener);
    return () => {
      isMounted.current = false;
      listeners = listeners.filter(l => l !== listener);
      activeTimeouts.forEach(timeout => clearTimeout(timeout));
      activeTimeouts.clear();
    };
  }, []);

  const showToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    if (!isMounted.current) return;
    
    const id = Math.random().toString(36).substring(2, 9);
    const toast: Toast = { id, message, type };
    globalToasts.push(toast);
    notifyListeners();
    setToasts([...globalToasts]);

    const timeout = setTimeout(() => {
      if (!isMounted.current) return;
      globalToasts = globalToasts.filter(t => t.id !== id);
      notifyListeners();
      setToasts([...globalToasts]);
      activeTimeouts.delete(id);
    }, 4000);
    
    activeTimeouts.set(id, timeout);
  }, []);

  const removeToast = useCallback((id: string) => {
    if (!isMounted.current) return;
    
    const timeout = activeTimeouts.get(id);
    if (timeout) {
      clearTimeout(timeout);
      activeTimeouts.delete(id);
    }
    
    globalToasts = globalToasts.filter(t => t.id !== id);
    notifyListeners();
    setToasts([...globalToasts]);
  }, []);

  return { toasts, showToast, removeToast };
}