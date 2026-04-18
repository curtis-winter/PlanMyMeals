import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useModalState } from '../hooks/useModalState';

describe('useModalState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have all modal states set to false initially', () => {
    const { result } = renderHook(() => useModalState());
    
    expect(result.current.showShoppingList).toBe(false);
    expect(result.current.showPantryManager).toBe(false);
    expect(result.current.showRecipeBook).toBe(false);
    expect(result.current.showSettings).toBe(false);
    expect(result.current.showRecipeEditor).toBe(false);
    expect(result.current.showCookModal).toBe(false);
  });

  it('should have null editingRecipe and cookingRecipe initially', () => {
    const { result } = renderHook(() => useModalState());
    
    expect(result.current.editingRecipe).toBeNull();
    expect(result.current.cookingRecipe).toBeNull();
  });

  it('should provide setShowShoppingList function', () => {
    const { result } = renderHook(() => useModalState());
    expect(typeof result.current.setShowShoppingList).toBe('function');
  });

  it('should provide setShowPantryManager function', () => {
    const { result } = renderHook(() => useModalState());
    expect(typeof result.current.setShowPantryManager).toBe('function');
  });

  it('should provide setShowRecipeBook function', () => {
    const { result } = renderHook(() => useModalState());
    expect(typeof result.current.setShowRecipeBook).toBe('function');
  });

  it('should provide setShowSettings function', () => {
    const { result } = renderHook(() => useModalState());
    expect(typeof result.current.setShowSettings).toBe('function');
  });

  it('should provide setShowRecipeEditor function', () => {
    const { result } = renderHook(() => useModalState());
    expect(typeof result.current.setShowRecipeEditor).toBe('function');
  });

  it('should provide setShowCookModal function', () => {
    const { result } = renderHook(() => useModalState());
    expect(typeof result.current.setShowCookModal).toBe('function');
  });

  it('should update showShoppingList when setShowShoppingList is called', () => {
    const { result } = renderHook(() => useModalState());

    act(() => {
      result.current.setShowShoppingList(true);
    });

    expect(result.current.showShoppingList).toBe(true);
  });

  it('should update showPantryManager when setShowPantryManager is called', () => {
    const { result } = renderHook(() => useModalState());

    act(() => {
      result.current.setShowPantryManager(true);
    });

    expect(result.current.showPantryManager).toBe(true);
  });

  it('should update showRecipeBook when setShowRecipeBook is called', () => {
    const { result } = renderHook(() => useModalState());

    act(() => {
      result.current.setShowRecipeBook(true);
    });

    expect(result.current.showRecipeBook).toBe(true);
  });

  it('should update showSettings when setShowSettings is called', () => {
    const { result } = renderHook(() => useModalState());

    act(() => {
      result.current.setShowSettings(true);
    });

    expect(result.current.showSettings).toBe(true);
  });

  it('should provide setEditingRecipe function', () => {
    const { result } = renderHook(() => useModalState());
    expect(typeof result.current.setEditingRecipe).toBe('function');
  });

  it('should provide setCookingRecipe function', () => {
    const { result } = renderHook(() => useModalState());
    expect(typeof result.current.setCookingRecipe).toBe('function');
  });
});