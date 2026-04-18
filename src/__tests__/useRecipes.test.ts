import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRecipes } from '../hooks/useRecipes';

vi.mock('../hooks/useSettings', () => ({
  useSettings: () => ({ ollamaSettings: { url: 'http://localhost:11434', model: 'llama3' } })
}));

describe('useRecipes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have empty recipes initially', () => {
    const { result } = renderHook(() => useRecipes());
    expect(result.current.recipes).toEqual([]);
  });

  it('should return recipeSearch as empty string', () => {
    const { result } = renderHook(() => useRecipes());
    expect(result.current.recipeSearch).toBe('');
  });

  it('should provide setRecipeSearch function', () => {
    const { result } = renderHook(() => useRecipes());
    expect(typeof result.current.setRecipeSearch).toBe('function');
  });

  it('should provide filteredRecipes', () => {
    const { result } = renderHook(() => useRecipes());
    expect(result.current.filteredRecipes).toEqual([]);
  });

  it('should provide allTags', () => {
    const { result } = renderHook(() => useRecipes());
    expect(result.current.allTags).toEqual([]);
  });

  it('should provide saveToRecipeBook function', () => {
    const { result } = renderHook(() => useRecipes());
    expect(typeof result.current.saveToRecipeBook).toBe('function');
  });

  it('should provide deleteFromRecipeBook function', () => {
    const { result } = renderHook(() => useRecipes());
    expect(typeof result.current.deleteFromRecipeBook).toBe('function');
  });

  it('should provide updateRecipeRating function', () => {
    const { result } = renderHook(() => useRecipes());
    expect(typeof result.current.updateRecipeRating).toBe('function');
  });

  it('should provide toggleFavorite function', () => {
    const { result } = renderHook(() => useRecipes());
    expect(typeof result.current.toggleFavorite).toBe('function');
  });

  it('should return promise for recipe without name (async function)', () => {
    const { result } = renderHook(() => useRecipes());
    const saveResult = result.current.saveToRecipeBook({ ingredients: [], directions: [] } as any);
    expect(saveResult).toBeDefined();
  });
});