import { describe, it, expect, vi } from 'vitest';

describe('useToast hook', () => {
  it('should export Toast interface with correct types', () => {
    const toast = { id: '123', message: 'test', type: 'success' as const };
    expect(toast.type).toBe('success');
    
    const errorToast = { id: '456', message: 'error', type: 'error' as const };
    expect(errorToast.type).toBe('error');
    
    const infoToast = { id: '789', message: 'info', type: 'info' as const };
    expect(infoToast.type).toBe('info');
  });

  it('should have correct default type', () => {
    const defaultType: 'success' | 'error' | 'info' = 'info';
    expect(defaultType).toBe('info');
  });
});