import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useOllamaServers } from '../hooks/useOllamaServers';

describe('useOllamaServers hook', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should initialize with empty servers array', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue([])
    });

    const { result } = renderHook(() => useOllamaServers());
    
    await waitFor(() => {
      expect(result.current.servers).toEqual([]);
    });
  });

  it('should fetch servers from API', async () => {
    const mockServers = [
      { id: 1, name: 'Local', url: 'http://localhost:11434', created_at: '2024-01-01' }
    ];
    global.fetch = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue(mockServers)
    });

    const { result } = renderHook(() => useOllamaServers());
    
    await waitFor(() => {
      expect(result.current.servers).toEqual(mockServers);
    });
  });

  it('should add a new server', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue([])
      })
      .mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue({ success: true, id: 1 })
      })
      .mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue([
          { id: 1, name: 'New', url: 'http://localhost:11434', created_at: '2024-01-01' }
        ])
      });

    const { result } = renderHook(() => useOllamaServers());
    
    await waitFor(() => {
      expect(result.current.servers).toEqual([]);
    });

    await act(async () => {
      await result.current.addServer('New', 'http://localhost:11434');
    });

    expect(result.current.servers).toHaveLength(1);
  });

  it('should remove a server', async () => {
    const mockServers = [
      { id: 1, name: 'Local', url: 'http://localhost:11434', created_at: '2024-01-01' }
    ];
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue(mockServers)
      })
      .mockResolvedValueOnce(Promise.resolve())
      .mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue([])
      });

    const { result } = renderHook(() => useOllamaServers());
    
    await waitFor(() => {
      expect(result.current.servers).toHaveLength(1);
    });

    await act(async () => {
      await result.current.removeServer(1);
    });

    expect(result.current.servers).toHaveLength(0);
  });

  it('should select a server and persist to localStorage', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue([])
    });

    const { result } = renderHook(() => useOllamaServers());
    
    await waitFor(() => {
      expect(result.current.servers).toEqual([]);
    });

    act(() => {
      result.current.selectServer('http://localhost:11434');
    });

    expect(result.current.selectedServer).toBe('http://localhost:11434');
    expect(localStorage.setItem).toHaveBeenCalledWith('selectedOllamaServer', 'http://localhost:11434');
  });
});