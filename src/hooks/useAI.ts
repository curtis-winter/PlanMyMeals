import React, { useState } from 'react';
import { DayOfWeek, Recipe, Ingredient, WeeklyPlan, Meal, PantryItem, CleanupRecipeResponse, ImportRecipeResponse, GeneratedIngredient } from '../types';
import { generateId } from '../utils/id';
import { useSettings } from './useSettings';

export function useAI(
  plan: WeeklyPlan,
  setPlan: React.Dispatch<React.SetStateAction<WeeklyPlan>>,
  saveDayPlan: (day: DayOfWeek, meal: Meal) => Promise<void>,
  pantryItems: PantryItem[],
  onError?: (message: string) => void
) {
  const { ollamaSettings } = useSettings();
  const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({});
  const [isSuggestingRecipe, setIsSuggestingRecipe] = useState(false);
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [suggestedRecipes, setSuggestedRecipes] = useState<Recipe[]>([]);
  const [showSuggestedRecipeModal, setShowSuggestedRecipeModal] = useState(false);
  const [showPantryModal, setShowPantryModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [activeDayForAI, setActiveDayForAI] = useState<DayOfWeek | null>(null);
  const [activeRecipeIndex, setActiveRecipeIndex] = useState<number | null>(null);
  const [pantryContext, setPantryContext] = useState('');
  const [dietaryOptions, setDietaryOptions] = useState<string[]>([]);
  const [recipeCount, setRecipeCount] = useState(1);
  const [useDifferentProteins, setUseDifferentProteins] = useState(false);
  const [useUniqueRecipes, setUseUniqueRecipes] = useState(true);

  const cleanupRecipe = async (recipe: Partial<Recipe>, additionalInstructions?: string): Promise<Recipe | null> => {
    setIsCleaningUp(true);
    try {
      const res = await fetch('/api/ai/cleanup-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipe, additionalInstructions })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      return {
        name: data.name,
        yield: data.yield || '',
        ingredients: data.ingredients.map((ing) => ({
          id: generateId(),
          name: ing.name,
          amount: ing.amount,
          preparation: ing.preparation || undefined,
          isAvailable: false
        })),
        directions: data.directions || [],
        rating: recipe.rating || 0
      };
} catch (err) {
    console.error('Recipe cleanup failed:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    const fullMessage = `Recipe cleanup failed: ${message}. Make sure Ollama is running and the model is pulled.`;
    if (onError) onError(fullMessage);
    else console.error(fullMessage);
    return null;
  } finally {
      setIsCleaningUp(false);
    }
  };

  const importRecipe = async (data: { url?: string; text?: string }) => {
    setIsImporting(true);
    try {
      const res = await fetch('/api/ai/import-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (result.error) throw new Error(result.error);

      // Handle array response (from JSON import) or single recipe
      const recipes = Array.isArray(result) ? result : [result];
      setSuggestedRecipes(recipes.map((r: ImportRecipeResponse) => ({
        name: r.name || 'Untitled Recipe',
        yield: r.yield || '',
        tags: r.tags || [],
        ingredients: (r.ingredients || []).map((ing) => ({
          id: generateId(),
          name: ing.name,
          amount: ing.amount,
          preparation: ing.preparation || undefined,
          isAvailable: false
        })),
        directions: r.directions || [],
        rating: 0
      })));
      setShowImportModal(false);
      setShowSuggestedRecipeModal(true);
} catch (err) {
    console.error('Import failed:', err);
    const message = 'Import failed. Make sure Ollama is running and the model is pulled.';
    if (onError) onError(message);
    else console.error(message);
  } finally {
      setIsImporting(false);
    }
  };

  const confirmAIGeneration = async () => {
    const pantryList = pantryItems.map(i => i.name).join(', ');
    const fullContext = pantryContext 
      ? `${pantryContext}. I also have these items in my pantry: ${pantryList}` 
      : `I have these items in my pantry: ${pantryList}`;

    const plannedRecipes = useUniqueRecipes 
      ? Object.values(plan).flatMap(m => m.recipes.map(r => r.name)).filter(Boolean)
      : [];

    if (!activeDayForAI || activeRecipeIndex === null) {
      // Suggest a full recipe
      setShowPantryModal(false);
      setIsSuggestingRecipe(true);
      try {
        const res = await fetch('/api/ai/suggest-recipe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            pantryContext: fullContext,
            additionalInstructions: pantryContext,
            dietaryOptions: dietaryOptions.join(', '),
            recipeCount,
            useDifferentProteins,
            plannedRecipes
          })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        // More robust extraction of recipes from the AI response
        let rawRecipes: unknown[] = [];
        if (Array.isArray(data)) {
          rawRecipes = data;
        } else if (data && typeof data === 'object') {
          // If it has a name and ingredients/directions, it's likely a single recipe
          if ((data.name || data.recipeName || data.title) && (data.ingredients || data.directions)) {
            rawRecipes = [data];
          } else {
            // Check for common keys that might contain the array
            const possibleArray = data.recipes || data.data || data.suggestions;
            if (Array.isArray(possibleArray)) {
              rawRecipes = possibleArray;
            } else {
              // Fallback: look for ANY array that isn't ingredients or directions
              const arrayKey = Object.keys(data).find(key => 
                Array.isArray(data[key]) && key !== 'ingredients' && key !== 'directions' && key !== 'steps' && key !== 'instructions'
              );
              if (arrayKey) {
                rawRecipes = data[arrayKey];
              } else if (data.name || data.recipeName || data.title) {
                // Last resort: if it has a name-like field, treat it as a single recipe
                rawRecipes = [data];
              }
            }
          }
        }

        const formattedRecipes = rawRecipes.map((r) => {
          const rec = r as Record<string, unknown>;
          // Try to find the name in common keys
          const name = String(rec.name || rec.recipeName || rec.title || 'Untitled Recipe');
          
          // Try to find ingredients in common keys
          const rawIngredients = rec.ingredients || rec.items || rec.components || [];
          const ingredients = (Array.isArray(rawIngredients) ? rawIngredients : []).map((ing) => {
            const ingredient = ing as Record<string, unknown>;
            return {
              id: generateId(),
              name: typeof ing === 'string' ? ing : String(ingredient.name || ingredient.item || 'Unknown Ingredient'),
              amount: typeof ing === 'string' ? '' : String(ingredient.amount || ingredient.quantity || ''),
              preparation: typeof ing === 'string' ? undefined : (ingredient.preparation as string | undefined),
              isAvailable: false
            };
          });

          // Try to find directions in common keys
          const rawDirections = rec.directions || rec.steps || rec.instructions || [];
          const directions = Array.isArray(rawDirections) ? rawDirections : [];
          const yieldAmount = String(rec.yield || rec.servings || rec.output || '');

          return {
            name,
            yield: yieldAmount,
            tags: (rec.tags as string[] | undefined) || ['AI'],
            ingredients,
            directions,
            rating: 0
          };
        });

        if (formattedRecipes.length === 0) {
          console.error('Raw AI response:', data);
          throw new Error('The AI returned an empty list of recipes or the format was unrecognized. Please try again.');
        }

        setSuggestedRecipes(formattedRecipes);
        setShowSuggestedRecipeModal(true);
} catch (err) {
  console.error('Recipe suggestion failed:', err);
  const message = err instanceof Error ? err.message : 'Unknown error';
  const fullMessage = `Recipe suggestion failed: ${message}. Make sure Ollama is running and the model is pulled.`;
  if (onError) onError(fullMessage);
  else console.error(fullMessage);
} finally {
        setIsSuggestingRecipe(false);
      }
      return;
    }

    const day = activeDayForAI;
    const recipeIndex = activeRecipeIndex;
    const recipe = plan[day].recipes[recipeIndex];
    
    setShowPantryModal(false);
    setIsGenerating(prev => ({ ...prev, [`${day}-${recipeIndex}`]: true }));
    try {
      const res = await fetch('/api/ai/generate-ingredients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeName: recipe.name, pantryContext: fullContext })
      });
      const data = await res.json();
      
      if ('error' in data) throw new Error(data.error);

      const newIngredients: Ingredient[] = (data as GeneratedIngredient[]).map((item) => ({
        id: generateId(),
        name: item.name,
        amount: item.amount,
        preparation: item.preparation || undefined,
        isAvailable: false
      }));

      const newRecipes = [...plan[day].recipes];
      newRecipes[recipeIndex] = {
        ...newRecipes[recipeIndex],
        ingredients: [...newRecipes[recipeIndex].ingredients, ...newIngredients]
      };
      
      const newMeal = { ...plan[day], recipes: newRecipes };
      setPlan(prev => ({ ...prev, [day]: newMeal }));
      saveDayPlan(day, newMeal);
} catch (err) {
  console.error('AI generation failed:', err);
  const message = 'AI generation failed. Make sure Ollama is running and the model is pulled.';
  if (onError) onError(message);
  else console.error(message);
} finally {
      setIsGenerating(prev => ({ ...prev, [`${day}-${recipeIndex}`]: false }));
      setActiveDayForAI(null);
      setActiveRecipeIndex(null);
    }
  };

  return {
    isGenerating,
    isSuggestingRecipe,
    isCleaningUp,
    isImporting,
    suggestedRecipes,
    showSuggestedRecipeModal,
    setShowSuggestedRecipeModal,
    showPantryModal,
    setShowPantryModal,
    showImportModal,
    setShowImportModal,
    activeDayForAI,
    setActiveDayForAI,
    activeRecipeIndex,
    setActiveRecipeIndex,
    pantryContext,
    setPantryContext,
    dietaryOptions,
    setDietaryOptions,
    recipeCount,
    setRecipeCount,
    useDifferentProteins,
    setUseDifferentProteins,
    useUniqueRecipes,
    setUseUniqueRecipes,
    confirmAIGeneration,
    importRecipe,
    cleanupRecipe
  };
}
