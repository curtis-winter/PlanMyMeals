import { useState, useEffect, useMemo } from 'react';
import { WeeklyPlan, DayOfWeek, Meal, RecipeInstance, Ingredient, DAYS_OF_WEEK, getWeekStart, Recipe, PantryItem, Task } from '../types';
import { generateId } from '../utils/id';

const INITIAL_PLAN: WeeklyPlan = DAYS_OF_WEEK.reduce((acc, day) => {
  acc[day] = { recipes: [] };
  return acc;
}, {} as WeeklyPlan);

export function useMealPlan(pantryItems: PantryItem[] = [], weekStartDay: DayOfWeek = 'Monday') {
  const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStart(new Date(), weekStartDay));
  const [plan, setPlan] = useState<WeeklyPlan>(INITIAL_PLAN);

  // Update week start if setting changes
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
          // Handle migration from old string[] to new Task[]
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
    saveDayPlan(day, newMeal);
  };

  const updateRecipe = (day: DayOfWeek, index: number, updates: Partial<RecipeInstance>) => {
    const newRecipes = [...plan[day].recipes];
    newRecipes[index] = { ...newRecipes[index], ...updates };
    const newMeal = { ...plan[day], recipes: newRecipes };
    setPlan(prev => ({ ...prev, [day]: newMeal }));
    saveDayPlan(day, newMeal);
  };

  const removeRecipe = (day: DayOfWeek, index: number) => {
    const newRecipes = plan[day].recipes.filter((_, i) => i !== index);
    const newMeal = { ...plan[day], recipes: newRecipes };
    setPlan(prev => ({ ...prev, [day]: newMeal }));
    saveDayPlan(day, newMeal);
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
    saveDayPlan(day, newMeal);
    
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
    saveDayPlan(day, newMeal);
  };

  const removeIngredient = (day: DayOfWeek, recipeIndex: number, id: string) => {
    const newRecipes = [...plan[day].recipes];
    newRecipes[recipeIndex] = {
      ...newRecipes[recipeIndex],
      ingredients: newRecipes[recipeIndex].ingredients.filter(ing => ing.id !== id)
    };
    const newMeal = { ...plan[day], recipes: newRecipes };
    setPlan(prev => ({ ...prev, [day]: newMeal }));
    saveDayPlan(day, newMeal);
  };

  const addDirection = (day: DayOfWeek, recipeIndex: number) => {
    const newRecipes = [...plan[day].recipes];
    newRecipes[recipeIndex] = {
      ...newRecipes[recipeIndex],
      directions: [...newRecipes[recipeIndex].directions, '']
    };
    const newMeal = { ...plan[day], recipes: newRecipes };
    setPlan(prev => ({ ...prev, [day]: newMeal }));
    saveDayPlan(day, newMeal);
  };

  const updateDirection = (day: DayOfWeek, recipeIndex: number, dirIndex: number, value: string) => {
    const newRecipes = [...plan[day].recipes];
    const newDirections = [...newRecipes[recipeIndex].directions];
    newDirections[dirIndex] = value;
    newRecipes[recipeIndex] = { ...newRecipes[recipeIndex], directions: newDirections };
    const newMeal = { ...plan[day], recipes: newRecipes };
    setPlan(prev => ({ ...prev, [day]: newMeal }));
    saveDayPlan(day, newMeal);
  };

  const removeDirection = (day: DayOfWeek, recipeIndex: number, dirIndex: number) => {
    const newRecipes = [...plan[day].recipes];
    const newDirections = newRecipes[recipeIndex].directions.filter((_, i) => i !== dirIndex);
    newRecipes[recipeIndex] = { ...newRecipes[recipeIndex], directions: newDirections };
    const newMeal = { ...plan[day], recipes: newRecipes };
    setPlan(prev => ({ ...prev, [day]: newMeal }));
    saveDayPlan(day, newMeal);
  };

  const applyRecipeToDay = (recipe: Recipe, day: DayOfWeek) => {
    const newRecipe: RecipeInstance = {
      id: generateId(),
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
    saveDayPlan(day, newMeal);
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
    saveDayPlan(day, newMeal);
  };

  const updateInstruction = (day: DayOfWeek, index: number, value: string) => {
    const newInstructions = [...(plan[day].instructions || [])];
    newInstructions[index] = { ...newInstructions[index], text: value };
    const newMeal = { ...plan[day], instructions: newInstructions };
    setPlan(prev => ({ ...prev, [day]: newMeal }));
    saveDayPlan(day, newMeal);
  };

  const removeInstruction = (day: DayOfWeek, index: number) => {
    const newInstructions = (plan[day].instructions || []).filter((_, i) => i !== index);
    const newMeal = { ...plan[day], instructions: newInstructions };
    setPlan(prev => ({ ...prev, [day]: newMeal }));
    saveDayPlan(day, newMeal);
  };

  const toggleTaskComplete = (day: DayOfWeek, index: number) => {
    const newInstructions = [...(plan[day].instructions || [])];
    newInstructions[index] = { ...newInstructions[index], completed: !newInstructions[index].completed };
    const newMeal = { ...plan[day], instructions: newInstructions };
    setPlan(prev => ({ ...prev, [day]: newMeal }));
    saveDayPlan(day, newMeal);
  };

   const navigateWeek = (direction: number) => {
     // Use local date parts to avoid timezone shifts when navigating
     const [year, month, day] = currentWeekStart.split('-').map(Number);
     const date = new Date(year, month - 1, day);
     date.setDate(date.getDate() + (direction * 7));
     setCurrentWeekStart(getWeekStart(date, weekStartDay));
   };

   const moveRecipe = (fromDay: DayOfWeek, toDay: DayOfWeek, recipeIndex: number) => {
     // Don't do anything if moving within the same day
     if (fromDay === toDay) return;
     
     // Get the recipe to move
     const recipe = plan[fromDay].recipes[recipeIndex];
     
     // Remove recipe from source day
     const updatedFromDayRecipes = [
       ...plan[fromDay].recipes.slice(0, recipeIndex),
       ...plan[fromDay].recipes.slice(recipeIndex + 1)
     ];
     const updatedFromDay = { ...plan[fromDay], recipes: updatedFromDayRecipes };
     
     // Add recipe to target day
     const updatedToDay = { 
       ...plan[toDay], 
       recipes: [...plan[toDay].recipes, recipe] 
     };
     
     // Update the plan state
     setPlan(prev => ({
       ...prev,
       [fromDay]: updatedFromDay,
       [toDay]: updatedToDay
     }));
     
     // Save the updated plan
     saveDayPlan(fromDay, updatedFromDay);
     saveDayPlan(toDay, updatedToDay);
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
