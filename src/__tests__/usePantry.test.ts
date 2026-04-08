import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePantry } from '../hooks/usePantry';

describe('usePantry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should have empty items initially', () => {
    const { result } = renderHook(() => usePantry());
    expect(result.current.pantryItems).toEqual([]);
  });

  it('should return refreshPantry function', () => {
    const { result } = renderHook(() => usePantry());
    expect(typeof result.current.refreshPantry).toBe('function');
  });

  it('should return savePantryItem function', () => {
    const { result } = renderHook(() => usePantry());
    expect(typeof result.current.savePantryItem).toBe('function');
  });

  it('should return removePantryItem function', () => {
    const { result } = renderHook(() => usePantry());
    expect(typeof result.current.removePantryItem).toBe('function');
  });
});