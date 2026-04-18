import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useBuildInfo } from '../hooks/useBuildInfo';

describe('useBuildInfo hook', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should initialize with buildNumber 0', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({ buildNumber: 42 })
    });

    const { result } = renderHook(() => useBuildInfo());
    
    await waitFor(() => {
      expect(result.current.buildNumber).toBe(42);
    });
  });

  it('should fetch build info from API', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({ buildNumber: 123 })
    });
    global.fetch = mockFetch;

    const { result } = renderHook(() => useBuildInfo());
    
    await waitFor(() => {
      expect(result.current.buildNumber).toBe(123);
    });
    
    expect(mockFetch).toHaveBeenCalledWith('/api/build-number');
  });

  it('should handle fetch error gracefully', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useBuildInfo());
    
    await waitFor(() => {
      expect(result.current.buildNumber).toBe(0);
    });
  });
});