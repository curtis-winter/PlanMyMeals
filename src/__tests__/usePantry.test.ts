import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePantry } from '../hooks/usePantry';

describe('usePantry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have empty items initially', () => {
    const { result } = renderHook(() => usePantry());
    expect(result.current.pantryItems).toEqual([]);
  });

  it('should return savePantryItem function', () => {
    const { result } = renderHook(() => usePantry());
    expect(typeof result.current.savePantryItem).toBe('function');
  });

  it('should return removePantryItem function', () => {
    const { result } = renderHook(() => usePantry());
    expect(typeof result.current.removePantryItem).toBe('function');
  });

  it('should return refreshPantry function', () => {
    const { result } = renderHook(() => usePantry());
    expect(typeof result.current.refreshPantry).toBe('function');
  });
});