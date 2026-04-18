import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useRecipes } from '../hooks/useRecipes';

vi.mock('../hooks/useSettings', () => ({
  useSettings: () => ({ ollamaSettings: { url: 'http://localhost:11434', model: 'llama3' } })
}));

describe('useRecipes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should have empty recipes initially', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue([])
    });

    const { result } = renderHook(() => useRecipes());
    expect(result.current.recipes).toEqual([]);
  });

  it('should fetch recipes from API', async () => {
    const mockRecipes = [
      { id: 1, name: 'Pasta', ingredients: ['pasta'], directions: ['cook'], tags: ['italian'] }
    ];
    global.fetch = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue(mockRecipes)
    });

    const { result } = renderHook(() => useRecipes());
    
    await waitFor(() => {
      expect(result.current.recipes).toEqual(mockRecipes);
    });
  });

  it('should save new recipe to recipe book', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue([])
      })
      .mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue({ success: true, id: 1 })
      })
      .mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue([
          { id: 1, name: 'New Recipe', ingredients: [], directions: [], tags: [] }
        ])
      });

    const { result } = renderHook(() => useRecipes());
    
    await waitFor(() => {
      expect(result.current.recipes).toEqual([]);
    });

    let saveResult: number | undefined;
    await act(async () => {
      saveResult = await result.current.saveToRecipeBook({
        name: 'New Recipe',
        ingredients: [],
        directions: [],
        tags: []
      } as any);
    });

    expect(saveResult).toBe(1);
    expect(result.current.recipes).toHaveLength(1);
  });

  it('should return undefined when saving recipe without name', async () => {
    const { result } = renderHook(() => useRecipes());
    
    const saveResult = await result.current.saveToRecipeBook({
      ingredients: [],
      directions: []
    } as any);
    
    expect(saveResult).toBeUndefined();
  });

  it('should delete recipe from recipe book', async () => {
    const mockRecipes = [{ id: 1, name: 'To Delete', ingredients: [], directions: [] }];
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue(mockRecipes)
      })
      .mockResolvedValueOnce(Promise.resolve());

    const { result } = renderHook(() => useRecipes());
    
    await waitFor(() => {
      expect(result.current.recipes).toHaveLength(1);
    });

    await act(async () => {
      await result.current.deleteFromRecipeBook(1);
    });

    expect(result.current.recipes).toHaveLength(0);
  });

  it('should update recipe rating', async () => {
    const mockRecipes = [{ id: 1, name: 'Recipe', ingredients: [], directions: [], rating: 0 }];
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue(mockRecipes)
      })
      .mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue({ success: true })
      })
      .mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue([{ id: 1, name: 'Recipe', rating: 5 }])
      });

    const { result } = renderHook(() => useRecipes());
    
    await waitFor(() => {
      expect(result.current.recipes).toHaveLength(1);
    });

    await act(async () => {
      await result.current.updateRecipeRating(result.current.recipes[0], 5);
    });

    expect(result.current.recipes[0].rating).toBe(5);
  });

  it('should toggle favorite status', async () => {
    const mockRecipes = [{ id: 1, name: 'Recipe', ingredients: [], directions: [], isFavorite: false }];
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue(mockRecipes)
      })
      .mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue({ success: true })
      })
      .mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue([{ id: 1, name: 'Recipe', isFavorite: true }])
      });

    const { result } = renderHook(() => useRecipes());
    
    await waitFor(() => {
      expect(result.current.recipes).toHaveLength(1);
    });

    await act(async () => {
      await result.current.toggleFavorite(result.current.recipes[0]);
    });

    expect(result.current.recipes[0].isFavorite).toBe(true);
  });

  it('should filter recipes by search term in name', async () => {
    const mockRecipes = [
      { id: 1, name: 'Pasta', ingredients: [], directions: [], tags: ['italian'] },
      { id: 2, name: 'Pizza', ingredients: [], directions: [], tags: ['italian'] }
    ];
    global.fetch = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue(mockRecipes)
    });

    const { result } = renderHook(() => useRecipes());
    
    await waitFor(() => {
      expect(result.current.recipes).toHaveLength(2);
    });

    act(() => {
      result.current.setRecipeSearch('pasta');
    });

    expect(result.current.filteredRecipes).toHaveLength(1);
    expect(result.current.filteredRecipes[0].name).toBe('Pasta');
  });

  it('should filter recipes by search term in tags', async () => {
    const mockRecipes = [
      { id: 1, name: 'Pasta', ingredients: [], directions: [], tags: ['italian', 'pasta'] },
      { id: 2, name: 'Salad', ingredients: [], directions: [], tags: ['healthy'] }
    ];
    global.fetch = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue(mockRecipes)
    });

    const { result } = renderHook(() => useRecipes());
    
    await waitFor(() => {
      expect(result.current.recipes).toHaveLength(2);
    });

    act(() => {
      result.current.setRecipeSearch('pasta');
    });

    expect(result.current.filteredRecipes).toHaveLength(1);
    expect(result.current.filteredRecipes[0].name).toBe('Pasta');
  });

  it('should extract all unique tags from recipes', async () => {
    const mockRecipes = [
      { id: 1, name: 'Recipe 1', ingredients: [], directions: [], tags: ['italian', 'dinner'] },
      { id: 2, name: 'Recipe 2', ingredients: [], directions: [], tags: ['italian', 'lunch'] }
    ];
    global.fetch = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue(mockRecipes)
    });

    const { result } = renderHook(() => useRecipes());
    
    await waitFor(() => {
      expect(result.current.recipes).toHaveLength(2);
    });

    expect(result.current.allTags).toEqual(['dinner', 'italian', 'lunch']);
  });
});