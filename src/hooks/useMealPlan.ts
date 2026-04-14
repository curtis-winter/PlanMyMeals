import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { WeeklyPlan, DayOfWeek, Meal, RecipeInstance, Ingredient, DAYS_OF_WEEK, getWeekStart, Recipe, PantryItem, Task } from '../types';
import { generateId } from '../utils/id';

const INITIAL_PLAN: WeeklyPlan = DAYS_OF_WEEK.reduce((acc, day) => {
  acc[day] = { recipes: [] };
  return acc;
}, {} as WeeklyPlan);

export type SaveStrategy = 'debounced' | 'immediate';

interface SaveOptions {
  strategy: SaveStrategy;
}

export function useMealPlan(pantryItems: PantryItem[] = [], weekStartDay: DayOfWeek = 'Monday') {
  const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStart(new Date(), weekStartDay));
  const [plan, setPlan] = useState<WeeklyPlan>(INITIAL_PLAN);

  useEffect(() => {
    setCurrentWeekStart(getWeekStart(new Date(), weekStartDay));
  }, [weekStartDay]);

  const pantryNames = useMemo(() => 
    new Set(pantryItems.map(item => item.name.toLowerCase().trim())),
    [pantryItems]
  );

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const res = await fetch(`/api/plan/${currentWeekStart}`);
        const data = await res.json();
        const newPlan = { ...INITIAL_PLAN };
        data.forEach((row: any) => {
          const rawInstructions = JSON.parse(row.instructions || '[]');
          const instructions = rawInstructions.map((item: any) => {
            if (typeof item === 'string') {
              return { id: generateId(), text: item, completed: false };
            }
            return item;
          });
          newPlan[row.day] = {
            recipes: JSON.parse(row.recipes || '[]'),
            instructions
          };
        });
        setPlan(newPlan);
      } catch (err) {
        console.error('Failed to fetch plan:', err);
      }
    };
    fetchPlan();
  }, [currentWeekStart]);

  const saveDayPlan = async (day: DayOfWeek, meal: Meal) => {
    try {
      await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          week_start: currentWeekStart,
          day,
          recipes: meal.recipes,
          instructions: meal.instructions || []
        })
      });
    } catch (err) {
      console.error('Failed to save plan:', err);
    }
  };

  const debouncedSaveRef = useRef<Map<DayOfWeek, ReturnType<typeof setTimeout>>>(new Map());
  
  const debouncedSave = useCallback((day: DayOfWeek, meal: Meal) => {
    const existing = debouncedSaveRef.current.get(day);
    if (existing) clearTimeout(existing);
    const timeout = setTimeout(() => {
      saveDayPlan(day, meal);
      debouncedSaveRef.current.delete(day);
    }, 500);
    debouncedSaveRef.current.set(day, timeout);
  }, [currentWeekStart]);

  const immediateSave = useCallback((day: DayOfWeek, meal: Meal) => {
    const existing = debouncedSaveRef.current.get(day);
    if (existing) clearTimeout(existing);
    debouncedSaveRef.current.delete(day);
    saveDayPlan(day, meal);
  }, [currentWeekStart]);

  const saveMeal = useCallback((day: DayOfWeek, meal: Meal, options: SaveOptions = { strategy: 'debounced' }) => {
    if (options.strategy === 'immediate') {
      immediateSave(day, meal);
    } else {
      debouncedSave(day, meal);
    }
  }, [immediateSave, debouncedSave]);

  useEffect(() => {
    return () => {
      debouncedSaveRef.current.forEach((timeout) => clearTimeout(timeout));
    };
  }, []);

  const addRecipeToDay = (day: DayOfWeek) => {
    const newRecipe: RecipeInstance = {
      id: generateId(),
      name: '',
      ingredients: [],
      directions: [],
      isExpanded: false,
      isIngredientsExpanded: false,
      isDirectionsExpanded: false
    };
    const newMeal = { ...plan[day], recipes: [...plan[day].recipes, newRecipe] };
    setPlan(prev => ({ ...prev, [day]: newMeal }));
    saveMeal(day, newMeal, { strategy: 'immediate' });
  };

  const updateRecipe = (day: DayOfWeek, index: number, updates: Partial<RecipeInstance>) => {
    const newRecipes = [...plan[day].recipes];
    newRecipes[index] = { ...newRecipes[index], ...updates };
    const newMeal = { ...plan[day], recipes: newRecipes };
    setPlan(prev => ({ ...prev, [day]: newMeal }));
    saveMeal(day, newMeal, { strategy: 'debounced' });
  };

  const removeRecipe = (day: DayOfWeek, index: number) => {
    const newRecipes = plan[day].recipes.filter((_, i) => i !== index);
    const newMeal = { ...plan[day], recipes: newRecipes };
    setPlan(prev => ({ ...prev, [day]: newMeal }));
    saveMeal(day, newMeal, { strategy: 'immediate' });
  };

  const addIngredient = (day: DayOfWeek, recipeIndex: number) => {
    const newIngredient: Ingredient = {
      id: generateId(),
      name: '',
      amount: '',
      isAvailable: false
    };
    const newRecipes = [...plan[day].recipes];
    newRecipes[recipeIndex] = {
      ...newRecipes[recipeIndex],
      ingredients: [...newRecipes[recipeIndex].ingredients, newIngredient]
    };
    const newMeal = { ...plan[day], recipes: newRecipes };
    setPlan(prev => ({ ...prev, [day]: newMeal }));
    saveMeal(day, newMeal, { strategy: 'immediate' });
    
    setTimeout(() => {
      const inputs = document.querySelectorAll(`[data-day="${day}"] [data-recipe="${recipeIndex}"] [data-type="amount"]`);
      const lastInput = inputs[inputs.length - 1] as HTMLInputElement;
      if (lastInput) lastInput.focus();
    }, 0);
  };

  const updateIngredient = (day: DayOfWeek, recipeIndex: number, id: string, updates: Partial<Ingredient>) => {
    const newRecipes = [...plan[day].recipes];
    newRecipes[recipeIndex] = {
      ...newRecipes[recipeIndex],
      ingredients: newRecipes[recipeIndex].ingredients.map(ing => ing.id === id ? { ...ing, ...updates } : ing)
    };
    const newMeal = { ...plan[day], recipes: newRecipes };
    setPlan(prev => ({ ...prev, [day]: newMeal }));
    saveMeal(day, newMeal, { strategy: 'debounced' });
  };

  const removeIngredient = (day: DayOfWeek, recipeIndex: number, id: string) => {
    const newRecipes = [...plan[day].recipes];
    newRecipes[recipeIndex] = {
      ...newRecipes[recipeIndex],
      ingredients: newRecipes[recipeIndex].ingredients.filter(ing => ing.id !== id)
    };
    const newMeal = { ...plan[day], recipes: newRecipes };
    setPlan(prev => ({ ...prev, [day]: newMeal }));
    saveMeal(day, newMeal, { strategy: 'immediate' });
  };

  const addDirection = (day: DayOfWeek, recipeIndex: number) => {
    const newRecipes = [...plan[day].recipes];
    newRecipes[recipeIndex] = {
      ...newRecipes[recipeIndex],
      directions: [...newRecipes[recipeIndex].directions, '']
    };
    const newMeal = { ...plan[day], recipes: newRecipes };
    setPlan(prev => ({ ...prev, [day]: newMeal }));
    saveMeal(day, newMeal, { strategy: 'immediate' });
  };

  const updateDirection = (day: DayOfWeek, recipeIndex: number, dirIndex: number, value: string) => {
    const newRecipes = [...plan[day].recipes];
    const newDirections = [...newRecipes[recipeIndex].directions];
    newDirections[dirIndex] = value;
    newRecipes[recipeIndex] = { ...newRecipes[recipeIndex], directions: newDirections };
    const newMeal = { ...plan[day], recipes: newRecipes };
    setPlan(prev => ({ ...prev, [day]: newMeal }));
    saveMeal(day, newMeal, { strategy: 'debounced' });
  };

  const removeDirection = (day: DayOfWeek, recipeIndex: number, dirIndex: number) => {
    const newRecipes = [...plan[day].recipes];
    const newDirections = newRecipes[recipeIndex].directions.filter((_, i) => i !== dirIndex);
    newRecipes[recipeIndex] = { ...newRecipes[recipeIndex], directions: newDirections };
    const newMeal = { ...plan[day], recipes: newRecipes };
    setPlan(prev => ({ ...prev, [day]: newMeal }));
    saveMeal(day, newMeal, { strategy: 'immediate' });
  };

  const applyRecipeToDay = (recipe: Recipe, day: DayOfWeek) => {
    const newRecipe: RecipeInstance = {
      id: generateId(),
      recipeId: recipe.id,
      name: recipe.name,
      ingredients: recipe.ingredients.map(ing => ({ ...ing, id: generateId(), isAvailable: false })),
      directions: recipe.directions || [],
      isExpanded: false,
      isIngredientsExpanded: false,
      isDirectionsExpanded: false
    };
    const newMeal = {
      ...plan[day],
      recipes: [...plan[day].recipes, newRecipe]
    };
    setPlan(prev => ({ ...prev, [day]: newMeal }));
    saveMeal(day, newMeal, { strategy: 'immediate' });
  };

  const shoppingList = useMemo(() => {
    const missing: Record<string, string[]> = {};
    Object.values(plan).forEach((meal: Meal) => {
      meal.recipes.forEach(recipe => {
        recipe.ingredients.forEach(ing => {
          const name = ing.name.trim().toLowerCase();
          if (!ing.isAvailable && name && !pantryNames.has(name)) {
            if (!missing[name]) missing[name] = [];
            if (ing.amount) missing[name].push(ing.amount);
          }
        });
      });
    });
    return Object.entries(missing).sort(([a], [b]) => a.localeCompare(b));
  }, [plan, pantryNames]);

  const addInstruction = (day: DayOfWeek) => {
    const newTask: Task = { id: generateId(), text: '', completed: false };
    const newInstructions = [...(plan[day].instructions || []), newTask];
    const newMeal = { ...plan[day], instructions: newInstructions };
    setPlan(prev => ({ ...prev, [day]: newMeal }));
    saveMeal(day, newMeal, { strategy: 'immediate' });
  };

  const updateInstruction = (day: DayOfWeek, index: number, value: string) => {
    const newInstructions = [...(plan[day].instructions || [])];
    newInstructions[index] = { ...newInstructions[index], text: value };
    const newMeal = { ...plan[day], instructions: newInstructions };
    setPlan(prev => ({ ...prev, [day]: newMeal }));
    saveMeal(day, newMeal, { strategy: 'debounced' });
  };

  const removeInstruction = (day: DayOfWeek, index: number) => {
    const newInstructions = (plan[day].instructions || []).filter((_, i) => i !== index);
    const newMeal = { ...plan[day], instructions: newInstructions };
    setPlan(prev => ({ ...prev, [day]: newMeal }));
    saveMeal(day, newMeal, { strategy: 'immediate' });
  };

  const toggleTaskComplete = (day: DayOfWeek, index: number) => {
    const newInstructions = [...(plan[day].instructions || [])];
    newInstructions[index] = { ...newInstructions[index], completed: !newInstructions[index].completed };
    const newMeal = { ...plan[day], instructions: newInstructions };
    setPlan(prev => ({ ...prev, [day]: newMeal }));
    saveMeal(day, newMeal, { strategy: 'immediate' });
  };

  const navigateWeek = (direction: number) => {
    debouncedSaveRef.current.forEach((timeout) => clearTimeout(timeout));
    debouncedSaveRef.current.clear();
    
    const [year, month, day] = currentWeekStart.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() + (direction * 7));
    setCurrentWeekStart(getWeekStart(date, weekStartDay));
  };

  const moveRecipe = (fromDay: DayOfWeek, toDay: DayOfWeek, recipeIndex: number) => {
    if (fromDay === toDay) return;
    
    const recipe = plan[fromDay].recipes[recipeIndex];
    
    const updatedFromDayRecipes = [
      ...plan[fromDay].recipes.slice(0, recipeIndex),
      ...plan[fromDay].recipes.slice(recipeIndex + 1)
    ];
    const updatedFromDay = { ...plan[fromDay], recipes: updatedFromDayRecipes };
    
    const updatedToDay = { 
      ...plan[toDay], 
      recipes: [...plan[toDay].recipes, recipe] 
    };
    
    setPlan(prev => ({
      ...prev,
      [fromDay]: updatedFromDay,
      [toDay]: updatedToDay
    }));
    
    saveMeal(fromDay, updatedFromDay, { strategy: 'immediate' });
    saveMeal(toDay, updatedToDay, { strategy: 'immediate' });
  };

  return {
    plan,
    currentWeekStart,
    shoppingList,
    addRecipeToDay,
    updateRecipe,
    removeRecipe,
    addIngredient,
    updateIngredient,
    removeIngredient,
    addDirection,
    updateDirection,
    removeDirection,
    addInstruction,
    updateInstruction,
    removeInstruction,
    toggleTaskComplete,
    applyRecipeToDay,
    navigateWeek,
    setPlan,
    saveDayPlan
  };
}
