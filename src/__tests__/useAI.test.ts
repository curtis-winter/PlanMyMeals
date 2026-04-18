import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAI } from '../hooks/useAI';
import { WeeklyPlan, PantryItem, Recipe, Meal } from '../types';

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

vi.mock('../hooks/useSettings', () => ({
  useSettings: () => ({
    ollamaSettings: { url: 'http://localhost:11434', model: 'llama3' }
  })
}));

vi.mock('../utils/id', () => ({
  generateId: vi.fn(() => 'test-id-' + Math.random().toString(36).substr(2, 9))
}));

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

  describe('cleanupRecipe', () => {
    it('should successfully cleanup a recipe', async () => {
      const mockRecipe: Partial<Recipe> = { name: 'Test Recipe', rating: 4 };
      const mockResponse = {
        name: 'Cleaned Recipe',
        yield: '4 servings',
        ingredients: [
          { name: 'Chicken', amount: '1 lb', preparation: 'sliced' },
          { name: 'Garlic', amount: '3 cloves', preparation: 'minced' }
        ],
        directions: ['Step 1', 'Step 2', 'Step 3']
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const plan = createEmptyPlan();
      const setPlan = vi.fn();
      const saveDayPlan = vi.fn();

      const { result } = renderHook(() => useAI(plan, setPlan, saveDayPlan, mockPantry));

      const cleanedRecipe = await result.current.cleanupRecipe(mockRecipe);

      expect(cleanedRecipe).not.toBeNull();
      expect(cleanedRecipe?.name).toBe('Cleaned Recipe');
      expect(cleanedRecipe?.yield).toBe('4 servings');
      expect(cleanedRecipe?.ingredients).toHaveLength(2);
      expect(cleanedRecipe?.directions).toEqual(['Step 1', 'Step 2', 'Step 3']);
      expect(cleanedRecipe?.rating).toBe(4);
    });

    it('should return null and call onError when API returns an error', async () => {
      const mockRecipe: Partial<Recipe> = { name: 'Test Recipe' };
      const onError = vi.fn();

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ error: 'Ollama not running' })
      });

      const plan = createEmptyPlan();
      const setPlan = vi.fn();
      const saveDayPlan = vi.fn();

      const { result } = renderHook(() => useAI(plan, setPlan, saveDayPlan, mockPantry, onError));

      const cleanedRecipe = await result.current.cleanupRecipe(mockRecipe);

      expect(cleanedRecipe).toBeNull();
      expect(onError).toHaveBeenCalledWith(
        expect.stringContaining('Recipe cleanup failed')
      );
    });

    it('should return null and call onError when fetch fails', async () => {
      const mockRecipe: Partial<Recipe> = { name: 'Test Recipe' };
      const onError = vi.fn();

      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const plan = createEmptyPlan();
      const setPlan = vi.fn();
      const saveDayPlan = vi.fn();

      const { result } = renderHook(() => useAI(plan, setPlan, saveDayPlan, mockPantry, onError));

      const cleanedRecipe = await result.current.cleanupRecipe(mockRecipe);

      expect(cleanedRecipe).toBeNull();
      expect(onError).toHaveBeenCalledWith(
        expect.stringContaining('Recipe cleanup failed')
      );
    });
  });

  describe('importRecipe', () => {
    it('should call onError when API returns error', async () => {
      const onError = vi.fn();

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ error: 'Import failed' })
      });

      const plan = createEmptyPlan();
      const setPlan = vi.fn();
      const saveDayPlan = vi.fn();

      const { result } = renderHook(() => useAI(plan, setPlan, saveDayPlan, mockPantry, onError));

      await result.current.importRecipe({ url: 'https://example.com/recipe' });

      expect(onError).toHaveBeenCalledWith(
        expect.stringContaining('Import failed')
      );
    });
  });

  describe('confirmAIGeneration', () => {
    it('should throw error when recipe response is empty', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({})
      });

      const plan = createEmptyPlan();
      const setPlan = vi.fn();
      const saveDayPlan = vi.fn();
      const onError = vi.fn();

      const { result } = renderHook(() => useAI(plan, setPlan, saveDayPlan, mockPantry, onError));

      await result.current.confirmAIGeneration();

      expect(onError).toHaveBeenCalledWith(
        expect.stringContaining('Recipe suggestion failed')
      );
    });

    it('should include pantry items in the request', async () => {
      const pantryWithItems: PantryItem[] = [
        { id: 1, name: 'Chicken', category: 'Meat' },
        { id: 2, name: 'Rice', category: 'Grains' },
        { id: 3, name: 'Salt', category: 'Spices & Baking' }
      ];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([{ name: 'Recipe', ingredients: [], directions: [] }])
      });

      const plan = createEmptyPlan();
      const setPlan = vi.fn();
      const saveDayPlan = vi.fn();

      const { result } = renderHook(() => useAI(plan, setPlan, saveDayPlan, pantryWithItems));

      act(() => {
        result.current.setPantryContext('I want something with chicken');
      });

      await result.current.confirmAIGeneration();

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/ai/suggest-recipe',
        expect.objectContaining({
          body: expect.stringContaining('Chicken')
        })
      );
    });

    it('should include planned recipes when useUniqueRecipes is true', async () => {
      const planWithExistingRecipe: WeeklyPlan = {
        Monday: {
          recipes: [{
            id: '1',
            name: 'Chicken Alfredo',
            ingredients: [],
            directions: [],
            rating: 0,
            isExpanded: false,
            isIngredientsExpanded: false,
            isDirectionsExpanded: false
          }]
        },
        Tuesday: { recipes: [] },
        Wednesday: { recipes: [] },
        Thursday: { recipes: [] },
        Friday: { recipes: [] },
        Saturday: { recipes: [] },
        Sunday: { recipes: [] },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([{ name: 'New Recipe', ingredients: [], directions: [] }])
      });

      const setPlan = vi.fn();
      const saveDayPlan = vi.fn();

      const { result } = renderHook(() => useAI(planWithExistingRecipe, setPlan, saveDayPlan, mockPantry));

      expect(result.current.useUniqueRecipes).toBe(true);

      await result.current.confirmAIGeneration();

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/ai/suggest-recipe',
        expect.objectContaining({
          body: expect.stringContaining('Chicken Alfredo')
        })
      );
    });

    it('should include dietary options in the request', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([{ name: 'Recipe', ingredients: [], directions: [] }])
      });

      const plan = createEmptyPlan();
      const setPlan = vi.fn();
      const saveDayPlan = vi.fn();

      const { result } = renderHook(() => useAI(plan, setPlan, saveDayPlan, mockPantry));

      act(() => {
        result.current.setDietaryOptions(['vegetarian', 'gluten-free']);
        result.current.setRecipeCount(3);
      });

      await result.current.confirmAIGeneration();

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/ai/suggest-recipe',
        expect.objectContaining({
          body: expect.stringContaining('vegetarian')
        })
      );
    });

    it('should call onError when generation fails', async () => {
      const onError = vi.fn();

      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const plan = createEmptyPlan();
      const setPlan = vi.fn();
      const saveDayPlan = vi.fn();

      const { result } = renderHook(() => useAI(plan, setPlan, saveDayPlan, mockPantry, onError));

      await result.current.confirmAIGeneration();

      expect(onError).toHaveBeenCalledWith(
        expect.stringContaining('Recipe suggestion failed')
      );
    });
  });
});