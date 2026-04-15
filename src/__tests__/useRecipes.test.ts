import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFetch = vi.fn();
global.fetch = mockFetch;

import { renderHook, act } from '@testing-library/react';
import { useRecipes } from '../hooks/useRecipes';

const mockRecipes = [
  { id: 1, name: 'Pancakes', ingredients: [], directions: [], tags: ['breakfast'], rating: 5 },
  { id: 2, name: 'Spaghetti', ingredients: [], directions: [], tags: ['dinner', 'italian'], rating: 4 }
];

describe('useRecipes', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockFetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(mockRecipes)
    });
  });

  it('should have empty recipes initially before fetch', () => {
    const { result } = renderHook(() => useRecipes());
    expect(result.current.recipes).toEqual([]);
  });

  it('should return recipeSearch state', () => {
    const { result } = renderHook(() => useRecipes());
    expect(result.current.recipeSearch).toBe('');
  });

  it('should return setRecipeSearch function', () => {
    const { result } = renderHook(() => useRecipes());
    expect(typeof result.current.setRecipeSearch).toBe('function');
  });

  it('should return filteredRecipes', () => {
    const { result } = renderHook(() => useRecipes());
    expect(result.current.filteredRecipes).toEqual([]);
  });

  it('should return allTags', () => {
    const { result } = renderHook(() => useRecipes());
    expect(result.current.allTags).toEqual([]);
  });

  it('should return saveToRecipeBook function', () => {
    const { result } = renderHook(() => useRecipes());
    expect(typeof result.current.saveToRecipeBook).toBe('function');
  });

  it('should return deleteFromRecipeBook function', () => {
    const { result } = renderHook(() => useRecipes());
    expect(typeof result.current.deleteFromRecipeBook).toBe('function');
  });

  it('should return updateRecipeRating function', () => {
    const { result } = renderHook(() => useRecipes());
    expect(typeof result.current.updateRecipeRating).toBe('function');
  });

  it('should set recipe search', () => {
    const { result } = renderHook(() => useRecipes());

    act(() => {
      result.current.setRecipeSearch('Pancakes');
    });

    expect(result.current.recipeSearch).toBe('Pancakes');
  });
});