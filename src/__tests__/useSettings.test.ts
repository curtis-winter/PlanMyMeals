import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSettings } from '../hooks/useSettings';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockSettings = {
  ollama_url: 'http://localhost:11434',
  ollama_model: 'llama2',
  import_prompt: 'Import prompt',
  suggest_prompt: 'Suggest prompt',
  suggest_options: 'option1,option2',
  ollama_timeout_suggest: '60000',
  ollama_timeout_import: '45000',
  ollama_timeout_ingredients: '30000',
  ollama_timeout_cleanup: '45000',
  ollama_timeout_pantry: '90000',
  cleanup_prompt: 'Cleanup prompt',
  week_start_day: 'Monday'
};

describe('useSettings', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should have default values initially', () => {
    const { result } = renderHook(() => useSettings());
    
    expect(result.current.ollamaSettings).toEqual({ url: '', model: '' });
    expect(result.current.importPrompt).toBe('');
    expect(result.current.suggestPrompt).toBe('');
    expect(result.current.suggestOptions).toBe('');
    expect(result.current.weekStartDay).toBe('Monday');
    expect(result.current.testStatus).toBe('idle');
  });

  it('should update ollamaSettings', async () => {
    const { result } = renderHook(() => useSettings());

    await act(async () => {
      result.current.setOllamaSettings({ url: 'http://localhost:11435', model: 'mistral' });
    });

    expect(result.current.ollamaSettings).toEqual({ url: 'http://localhost:11435', model: 'mistral' });
  });

  it('should update importPrompt', async () => {
    const { result } = renderHook(() => useSettings());

    await act(async () => {
      result.current.setImportPrompt('New import prompt');
    });

    expect(result.current.importPrompt).toBe('New import prompt');
  });

  it('should update suggestPrompt', async () => {
    const { result } = renderHook(() => useSettings());

    await act(async () => {
      result.current.setSuggestPrompt('New suggest prompt');
    });

    expect(result.current.suggestPrompt).toBe('New suggest prompt');
  });

  it('should update weekStartDay', async () => {
    const { result } = renderHook(() => useSettings());

    await act(async () => {
      result.current.setWeekStartDay('Sunday');
    });

    expect(result.current.weekStartDay).toBe('Sunday');
  });

  it('should update timeout values', async () => {
    const { result } = renderHook(() => useSettings());

    await act(async () => {
      result.current.setTimeoutSuggest(90000);
    });

    expect(result.current.timeoutSuggest).toBe(90000);
  });

  it('should update darkMode', async () => {
    const { result } = renderHook(() => useSettings());

    expect(result.current.darkMode).toBe(false);

    await act(async () => {
      result.current.setDarkMode(true);
    });

    expect(result.current.darkMode).toBe(true);
  });
});