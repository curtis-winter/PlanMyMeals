import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  get length() { return 0; },
  key: vi.fn(),
};
Object.defineProperty(global, 'localStorage', { value: mockLocalStorage, writable: true });

vi.mock('../hooks/usePantry', () => ({
  usePantry: () => ({
    pantryItems: []
  })
}));

vi.mock('../hooks/useMealPlan', () => ({
  useMealPlan: () => ({
    plan: {
      Monday: { recipes: [] },
      Tuesday: { recipes: [] },
      Wednesday: { recipes: [] },
      Thursday: { recipes: [] },
      Friday: { recipes: [] },
      Saturday: { recipes: [] },
      Sunday: { recipes: [] }
    }
  })
}));

import { renderHook, act } from '@testing-library/react';
import { useShoppingList } from '../hooks/useShoppingList';

describe('useShoppingList', () => {
  beforeEach(() => {
    mockLocalStorage.getItem.mockReturnValue(null);
    mockLocalStorage.setItem.mockClear();
  });

  it('should have empty custom items initially', () => {
    const { result } = renderHook(() => useShoppingList());
    expect(result.current.customItems).toEqual([]);
  });

  it('should return addCustomItem function', () => {
    const { result } = renderHook(() => useShoppingList());
    expect(typeof result.current.addCustomItem).toBe('function');
  });

  it('should return removeCustomItem function', () => {
    const { result } = renderHook(() => useShoppingList());
    expect(typeof result.current.removeCustomItem).toBe('function');
  });

  it('should return updateCustomItem function', () => {
    const { result } = renderHook(() => useShoppingList());
    expect(typeof result.current.updateCustomItem).toBe('function');
  });

  it('should return shoppingList', () => {
    const { result } = renderHook(() => useShoppingList());
    expect(result.current.shoppingList).toEqual([]);
  });

  it('should add custom item to list', () => {
    const { result } = renderHook(() => useShoppingList());

    act(() => {
      result.current.addCustomItem('milk', '1 gallon', 'Dairy');
    });

    expect(result.current.customItems).toHaveLength(1);
    expect(result.current.customItems[0].name).toBe('milk');
    expect(result.current.customItems[0].amount).toBe('1 gallon');
    expect(result.current.customItems[0].category).toBe('Dairy');
  });

  it('should remove custom item from list', () => {
    const { result } = renderHook(() => useShoppingList());

    act(() => {
      result.current.addCustomItem('milk');
    });

    expect(result.current.customItems).toHaveLength(1);

    const itemId = result.current.customItems[0].id;

    act(() => {
      result.current.removeCustomItem(itemId);
    });

    expect(result.current.customItems).toHaveLength(0);
  });

  it('should update custom item', () => {
    const { result } = renderHook(() => useShoppingList());

    act(() => {
      result.current.addCustomItem('milk');
    });

    const itemId = result.current.customItems[0].id;

    act(() => {
      result.current.updateCustomItem(itemId, { name: 'almond milk', amount: '2 cartons' });
    });

    expect(result.current.customItems[0].name).toBe('almond milk');
    expect(result.current.customItems[0].amount).toBe('2 cartons');
  });
});