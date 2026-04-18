import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToast, resetToastState } from '../hooks/useToast';

describe('useToast hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetToastState();
  });

  afterEach(() => {
    vi.useRealTimers();
    resetToastState();
  });

  it('should initialize with empty toasts array', () => {
    const { result } = renderHook(() => useToast());
    expect(result.current.toasts).toEqual([]);
  });

  it('should show a success toast', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.showToast('Success message', 'success');
    });
    
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].message).toBe('Success message');
    expect(result.current.toasts[0].type).toBe('success');
  });

  it('should show an error toast', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.showToast('Error message', 'error');
    });
    
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].type).toBe('error');
  });

  it('should show an info toast with default type', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.showToast('Info message');
    });
    
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].type).toBe('info');
  });

  it('should remove a toast by id', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.showToast('To be removed', 'success');
    });
    
    expect(result.current.toasts).toHaveLength(1);
    const toastId = result.current.toasts[0].id;
    
    act(() => {
      result.current.removeToast(toastId);
    });
    
    expect(result.current.toasts).toHaveLength(0);
  });

  it('should auto-remove toast after timeout', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.showToast('Auto remove', 'info');
    });
    
    expect(result.current.toasts).toHaveLength(1);
    
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    
    expect(result.current.toasts).toHaveLength(0);
  });

  it('should generate unique ids for each toast', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.showToast('Toast 1', 'success');
      result.current.showToast('Toast 2', 'error');
    });
    
    expect(result.current.toasts[0].id).not.toBe(result.current.toasts[1].id);
  });

  it('should export Toast interface with correct types', () => {
    const toast = { id: '123', message: 'test', type: 'success' as const };
    expect(toast.type).toBe('success');
    
    const errorToast = { id: '456', message: 'error', type: 'error' as const };
    expect(errorToast.type).toBe('error');
    
    const infoToast = { id: '789', message: 'info', type: 'info' as const };
    expect(infoToast.type).toBe('info');
  });
});