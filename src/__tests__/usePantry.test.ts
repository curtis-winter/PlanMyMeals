import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { usePantry } from '../hooks/usePantry';

describe('usePantry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should have empty items initially', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue([])
    });

    const { result } = renderHook(() => usePantry());
    
    await waitFor(() => {
      expect(result.current.pantryItems).toEqual([]);
    });
  });

  it('should fetch pantry items from API', async () => {
    const mockItems = [
      { id: 1, name: 'Flour', category: 'baking' },
      { id: 2, name: 'Sugar', category: 'baking' }
    ];
    global.fetch = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue(mockItems)
    });

    const { result } = renderHook(() => usePantry());
    
    await waitFor(() => {
      expect(result.current.pantryItems).toEqual(mockItems);
    });
  });

  it('should save pantry item', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue([])
      })
      .mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue({ success: true })
      })
      .mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue([
          { id: 1, name: 'New Item', category: 'other' }
        ])
      });

    const { result } = renderHook(() => usePantry());
    
    await waitFor(() => {
      expect(result.current.pantryItems).toEqual([]);
    });

    await act(async () => {
      await result.current.savePantryItem({ name: 'new item', category: 'other' });
    });

    expect(result.current.pantryItems).toHaveLength(1);
    expect(result.current.pantryItems[0].name).toBe('New Item');
  });

  it('should save pantry item with capitalized name', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue([])
      })
      .mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue({ success: true })
      })
      .mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue([
          { id: 1, name: 'Eggs', category: 'dairy' }
        ])
      });

    const { result } = renderHook(() => usePantry());
    
    await waitFor(() => {
      expect(result.current.pantryItems).toEqual([]);
    });

    await act(async () => {
      await result.current.savePantryItem({ name: 'eggs', category: 'dairy' });
    });

    expect(result.current.pantryItems[0].name).toBe('Eggs');
  });

  it('should remove pantry item', async () => {
    const mockItems = [{ id: 1, name: 'To Remove', category: 'other' }];
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue(mockItems)
      })
      .mockResolvedValueOnce(Promise.resolve())
      .mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue([])
      });

    const { result } = renderHook(() => usePantry());
    
    await waitFor(() => {
      expect(result.current.pantryItems).toHaveLength(1);
    });

    await act(async () => {
      await result.current.removePantryItem(1);
    });

    expect(result.current.pantryItems).toHaveLength(0);
  });

  it('should handle isLoading state', async () => {
    let resolveFetch: (value: any) => void;
    global.fetch = vi.fn().mockImplementation(() => new Promise(resolve => {
      resolveFetch = resolve;
    }));

    const { result } = renderHook(() => usePantry());
    
    expect(result.current.isLoading).toBe(true);
    
    await act(async () => {
      resolveFetch!({ json: vi.fn().mockResolvedValue([]) });
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should provide refreshPantry function which fetches items', async () => {
    const mockItems = [{ id: 1, name: 'Item', category: 'other' }];
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue([])
      })
      .mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue(mockItems)
      });

    const { result } = renderHook(() => usePantry());
    
    await waitFor(() => {
      expect(result.current.pantryItems).toEqual([]);
    });

    await act(async () => {
      await result.current.refreshPantry();
    });

    expect(result.current.pantryItems).toEqual(mockItems);
  });
});