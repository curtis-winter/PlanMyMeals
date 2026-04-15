import { useState, useEffect, useMemo } from 'react';
import { usePantry } from './usePantry';
import { useMealPlan } from './useMealPlan';
import { generateId } from '../utils/id';
import { WeeklyPlan, Meal, RecipeInstance, Ingredient } from '../types';

export interface CustomItem {
  id: string;
  name: string;
  amount?: string;
  category?: string;
}

export function useShoppingList() {
  const { pantryItems } = usePantry();
  const { plan } = useMealPlan(pantryItems, 'Monday');
  
  const [customItems, setCustomItems] = useState<CustomItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('shoppingList_customItems');
    if (saved) {
      try {
        setCustomItems(JSON.parse(saved));
      } catch {
        setCustomItems([]);
      }
    }
  }, []);

  const saveCustomItems = (items: CustomItem[]) => {
    setCustomItems(items);
    localStorage.setItem('shoppingList_customItems', JSON.stringify(items));
  };

  const recipeItems = useMemo(() => {
    const missing: Record<string, string[]> = {};
    const pantryNames = new Set(pantryItems.map(p => p.name.trim().toLowerCase()));
    
    Object.values(plan).forEach((meal: Meal) => {
      meal.recipes.forEach((recipe: RecipeInstance) => {
        recipe.ingredients.forEach((ing: Ingredient) => {
          const name = ing.name.trim().toLowerCase();
          if (!ing.isAvailable && name && !pantryNames.has(name)) {
            if (!missing[name]) missing[name] = [];
            if (ing.amount) missing[name].push(ing.amount);
          }
        });
      });
    });
    return Object.entries(missing).sort(([a], [b]) => a.localeCompare(b));
  }, [plan, pantryItems]);

  const addCustomItem = (name: string, amount?: string, category?: string) => {
    const newItem: CustomItem = { id: generateId(), name, amount, category };
    saveCustomItems([...customItems, newItem]);
  };

  const removeCustomItem = (id: string) => {
    saveCustomItems(customItems.filter(item => item.id !== id));
  };

  const updateCustomItem = (id: string, updates: Partial<CustomItem>) => {
    saveCustomItems(customItems.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  return {
    shoppingList: recipeItems,
    customItems,
    addCustomItem,
    removeCustomItem,
    updateCustomItem
  };
}