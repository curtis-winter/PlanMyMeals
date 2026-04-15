import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMealPlan } from '../hooks/useMealPlan';
import { WeeklyPlan, DayOfWeek, PantryItem } from '../types';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const createMockPantry = (): PantryItem[] => [
  { id: 1, name: 'salt', category: 'Spices & Baking' },
  { id: 2, name: 'pepper', category: 'Spices & Baking' },
];

describe('useMealPlan', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockFetch.mockReset();
    mockFetch.mockResolvedValue({ ok: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should have empty plan initially', () => {
    const { result } = renderHook(() => useMealPlan());
    expect(result.current.plan.Monday.recipes).toHaveLength(0);
  });

  it('should add recipe to day', async () => {
    const { result } = renderHook(() => useMealPlan());

    await act(async () => {
      result.current.addRecipeToDay('Monday');
    });

    expect(result.current.plan.Monday.recipes).toHaveLength(1);
    expect(result.current.plan.Monday.recipes[0].name).toBe('');
  });

  it('should remove recipe from day', async () => {
    const { result } = renderHook(() => useMealPlan());

    await act(async () => {
      result.current.addRecipeToDay('Monday');
    });

    expect(result.current.plan.Monday.recipes).toHaveLength(1);

    await act(async () => {
      result.current.removeRecipe('Monday', 0);
    });

    expect(result.current.plan.Monday.recipes).toHaveLength(0);
  });

  it('should update recipe', async () => {
    const { result } = renderHook(() => useMealPlan());

    await act(async () => {
      result.current.addRecipeToDay('Monday');
    });

    await act(async () => {
      result.current.updateRecipe('Monday', 0, { name: 'Test Recipe' });
    });

    expect(result.current.plan.Monday.recipes[0].name).toBe('Test Recipe');
  });

  it('should add ingredient to recipe', async () => {
    const { result } = renderHook(() => useMealPlan());

    await act(async () => {
      result.current.addRecipeToDay('Monday');
    });

    await act(async () => {
      result.current.addIngredient('Monday', 0);
    });

    expect(result.current.plan.Monday.recipes[0].ingredients).toHaveLength(1);
    expect(result.current.plan.Monday.recipes[0].ingredients[0].name).toBe('');
  });

  it('should update ingredient', async () => {
    const mockPantry = createMockPantry();
    const { result } = renderHook(() => useMealPlan(mockPantry));

    await act(async () => {
      result.current.addRecipeToDay('Monday');
    });

    await act(async () => {
      result.current.addIngredient('Monday', 0);
    });

    const ingredientId = result.current.plan.Monday.recipes[0].ingredients[0].id;

    await act(async () => {
      result.current.updateIngredient('Monday', 0, ingredientId, { name: 'tomato', amount: '2' });
    });

    expect(result.current.plan.Monday.recipes[0].ingredients[0].name).toBe('tomato');
    expect(result.current.plan.Monday.recipes[0].ingredients[0].amount).toBe('2');
  });

  it('should remove ingredient', async () => {
    const { result } = renderHook(() => useMealPlan());

    await act(async () => {
      result.current.addRecipeToDay('Monday');
    });

    await act(async () => {
      result.current.addIngredient('Monday', 0);
    });

    expect(result.current.plan.Monday.recipes[0].ingredients).toHaveLength(1);

    const ingredientId = result.current.plan.Monday.recipes[0].ingredients[0].id;

    await act(async () => {
      result.current.removeIngredient('Monday', 0, ingredientId);
    });

    expect(result.current.plan.Monday.recipes[0].ingredients).toHaveLength(0);
  });

  it('should add direction to recipe', async () => {
    const { result } = renderHook(() => useMealPlan());

    await act(async () => {
      result.current.addRecipeToDay('Monday');
    });

    await act(async () => {
      result.current.addDirection('Monday', 0);
    });

    expect(result.current.plan.Monday.recipes[0].directions).toHaveLength(1);
  });

  it('should update direction', async () => {
    const { result } = renderHook(() => useMealPlan());

    await act(async () => {
      result.current.addRecipeToDay('Monday');
    });

    await act(async () => {
      result.current.addDirection('Monday', 0);
    });

    await act(async () => {
      result.current.updateDirection('Monday', 0, 0, 'Step 1: Mix ingredients');
    });

    expect(result.current.plan.Monday.recipes[0].directions[0]).toBe('Step 1: Mix ingredients');
  });

  it('should remove direction', async () => {
    const { result } = renderHook(() => useMealPlan());

    await act(async () => {
      result.current.addRecipeToDay('Monday');
    });

    await act(async () => {
      result.current.addDirection('Monday', 0);
    });

    expect(result.current.plan.Monday.recipes[0].directions).toHaveLength(1);

    await act(async () => {
      result.current.removeDirection('Monday', 0, 0);
    });

    expect(result.current.plan.Monday.recipes[0].directions).toHaveLength(0);
  });

  it('should add instruction/task', async () => {
    const { result } = renderHook(() => useMealPlan());

    await act(async () => {
      result.current.addInstruction('Monday');
    });

    expect(result.current.plan.Monday.instructions).toHaveLength(1);
    expect(result.current.plan.Monday.instructions?.[0].text).toBe('');
    expect(result.current.plan.Monday.instructions?.[0].completed).toBe(false);
  });

  it('should update instruction', async () => {
    const { result } = renderHook(() => useMealPlan());

    await act(async () => {
      result.current.addInstruction('Monday');
    });

    await act(async () => {
      result.current.updateInstruction('Monday', 0, 'Buy groceries');
    });

    expect(result.current.plan.Monday.instructions?.[0].text).toBe('Buy groceries');
  });

  it('should remove instruction', async () => {
    const { result } = renderHook(() => useMealPlan());

    await act(async () => {
      result.current.addInstruction('Monday');
    });

    expect(result.current.plan.Monday.instructions).toHaveLength(1);

    await act(async () => {
      result.current.removeInstruction('Monday', 0);
    });

    expect(result.current.plan.Monday.instructions).toHaveLength(0);
  });

  it('should toggle task completion', async () => {
    const { result } = renderHook(() => useMealPlan());

    await act(async () => {
      result.current.addInstruction('Monday');
    });

    expect(result.current.plan.Monday.instructions?.[0].completed).toBe(false);

    await act(async () => {
      result.current.toggleTaskComplete('Monday', 0);
    });

    expect(result.current.plan.Monday.instructions?.[0].completed).toBe(true);
  });
});