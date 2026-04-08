import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAI } from '../hooks/useAI';
import { WeeklyPlan, PantryItem } from '../types';

global.alert = vi.fn();

const createEmptyPlan = (): WeeklyPlan => ({
  Monday: { recipes: [] },
  Tuesday: { recipes: [] },
  Wednesday: { recipes: [] },
  Thursday: { recipes: [] },
  Friday: { recipes: [] },
  Saturday: { recipes: [] },
  Sunday: { recipes: [] },
});

const mockPantry: PantryItem[] = [
  { id: 1, name: 'Salt', category: 'Spices & Baking' },
  { id: 2, name: 'Pepper', category: 'Spices & Baking' }
];

describe('useAI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have default state values', () => {
    const plan = createEmptyPlan();
    const setPlan = vi.fn();
    const saveDayPlan = vi.fn();

    const { result } = renderHook(() => useAI(plan, setPlan, saveDayPlan, mockPantry));

    expect(result.current.isGenerating).toEqual({});
    expect(result.current.isSuggestingRecipe).toBe(false);
    expect(result.current.isCleaningUp).toBe(false);
    expect(result.current.isImporting).toBe(false);
    expect(result.current.suggestedRecipes).toEqual([]);
    expect(result.current.showSuggestedRecipeModal).toBe(false);
    expect(result.current.showPantryModal).toBe(false);
    expect(result.current.showImportModal).toBe(false);
    expect(result.current.activeDayForAI).toBe(null);
    expect(result.current.activeRecipeIndex).toBe(null);
    expect(result.current.pantryContext).toBe('');
    expect(result.current.dietaryOptions).toEqual([]);
    expect(result.current.recipeCount).toBe(1);
    expect(result.current.useDifferentProteins).toBe(false);
    expect(result.current.useUniqueRecipes).toBe(true);
  });

  it('should toggle showPantryModal', () => {
    const plan = createEmptyPlan();
    const setPlan = vi.fn();
    const saveDayPlan = vi.fn();

    const { result } = renderHook(() => useAI(plan, setPlan, saveDayPlan, mockPantry));

    expect(result.current.showPantryModal).toBe(false);

    act(() => {
      result.current.setShowPantryModal(true);
    });

    expect(result.current.showPantryModal).toBe(true);
  });

  it('should toggle showImportModal', () => {
    const plan = createEmptyPlan();
    const setPlan = vi.fn();
    const saveDayPlan = vi.fn();

    const { result } = renderHook(() => useAI(plan, setPlan, saveDayPlan, mockPantry));

    expect(result.current.showImportModal).toBe(false);

    act(() => {
      result.current.setShowImportModal(true);
    });

    expect(result.current.showImportModal).toBe(true);
  });

  it('should toggle showSuggestedRecipeModal', () => {
    const plan = createEmptyPlan();
    const setPlan = vi.fn();
    const saveDayPlan = vi.fn();

    const { result } = renderHook(() => useAI(plan, setPlan, saveDayPlan, mockPantry));

    expect(result.current.showSuggestedRecipeModal).toBe(false);

    act(() => {
      result.current.setShowSuggestedRecipeModal(true);
    });

    expect(result.current.showSuggestedRecipeModal).toBe(true);
  });

  it('should update activeDayForAI', () => {
    const plan = createEmptyPlan();
    const setPlan = vi.fn();
    const saveDayPlan = vi.fn();

    const { result } = renderHook(() => useAI(plan, setPlan, saveDayPlan, mockPantry));

    act(() => {
      result.current.setActiveDayForAI('Monday');
    });

    expect(result.current.activeDayForAI).toBe('Monday');
  });

  it('should update activeRecipeIndex', () => {
    const plan = createEmptyPlan();
    const setPlan = vi.fn();
    const saveDayPlan = vi.fn();

    const { result } = renderHook(() => useAI(plan, setPlan, saveDayPlan, mockPantry));

    act(() => {
      result.current.setActiveRecipeIndex(0);
    });

    expect(result.current.activeRecipeIndex).toBe(0);
  });

  it('should update pantryContext', () => {
    const plan = createEmptyPlan();
    const setPlan = vi.fn();
    const saveDayPlan = vi.fn();

    const { result } = renderHook(() => useAI(plan, setPlan, saveDayPlan, mockPantry));

    act(() => {
      result.current.setPantryContext('I want something vegetarian');
    });

    expect(result.current.pantryContext).toBe('I want something vegetarian');
  });

  it('should update dietaryOptions', () => {
    const plan = createEmptyPlan();
    const setPlan = vi.fn();
    const saveDayPlan = vi.fn();

    const { result } = renderHook(() => useAI(plan, setPlan, saveDayPlan, mockPantry));

    act(() => {
      result.current.setDietaryOptions(['vegetarian', 'gluten-free']);
    });

    expect(result.current.dietaryOptions).toEqual(['vegetarian', 'gluten-free']);
  });

  it('should update recipeCount', () => {
    const plan = createEmptyPlan();
    const setPlan = vi.fn();
    const saveDayPlan = vi.fn();

    const { result } = renderHook(() => useAI(plan, setPlan, saveDayPlan, mockPantry));

    expect(result.current.recipeCount).toBe(1);

    act(() => {
      result.current.setRecipeCount(3);
    });

    expect(result.current.recipeCount).toBe(3);
  });

  it('should toggle useDifferentProteins', () => {
    const plan = createEmptyPlan();
    const setPlan = vi.fn();
    const saveDayPlan = vi.fn();

    const { result } = renderHook(() => useAI(plan, setPlan, saveDayPlan, mockPantry));

    expect(result.current.useDifferentProteins).toBe(false);

    act(() => {
      result.current.setUseDifferentProteins(true);
    });

    expect(result.current.useDifferentProteins).toBe(true);
  });

  it('should toggle useUniqueRecipes', () => {
    const plan = createEmptyPlan();
    const setPlan = vi.fn();
    const saveDayPlan = vi.fn();

    const { result } = renderHook(() => useAI(plan, setPlan, saveDayPlan, mockPantry));

    expect(result.current.useUniqueRecipes).toBe(true);

    act(() => {
      result.current.setUseUniqueRecipes(false);
    });

    expect(result.current.useUniqueRecipes).toBe(false);
  });
});