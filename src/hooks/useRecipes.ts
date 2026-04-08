import { useState, useEffect } from 'react';
import { Recipe, RecipeInstance } from '../types';

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [recipeSearch, setRecipeSearch] = useState('');

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const res = await fetch('/api/recipes');
        const data = await res.json();
        setRecipes(data);
      } catch (err) {
        console.error('Failed to fetch recipes:', err);
      }
    };
    fetchRecipes();
  }, []);

  const saveToRecipeBook = async (recipe: RecipeInstance | Recipe): Promise<number | undefined> => {
    if (!recipe.name) return undefined;
    try {
      // Cast to access recipeId which is only on RecipeInstance
      const instance = recipe as RecipeInstance;
      const recipeId = instance.recipeId;
      
      // If we have a recipeId, we know which recipe to update
      if (recipeId) {
        // Update by ID directly
        await fetch('/api/recipes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: recipeId,
            name: recipe.name,
            ingredients: recipe.ingredients,
            directions: recipe.directions,
            tags: recipe.tags || [],
            rating: recipe.rating || 0
          })
        });
        
        const res = await fetch('/api/recipes');
        const data = await res.json();
        setRecipes(data);
        return recipeId;
      }
      
      // Check by name - if exists, update it
      const nameToFind = recipe.name.trim().toLowerCase();
      const existingRecipe = recipes.find(r => r.name?.trim().toLowerCase() === nameToFind);
      
      if (existingRecipe) {
        await fetch('/api/recipes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: existingRecipe.id,
            name: recipe.name,
            ingredients: recipe.ingredients,
            directions: recipe.directions,
            tags: recipe.tags || [],
            rating: recipe.rating || 0
          })
        });
        const res = await fetch('/api/recipes');
        const data = await res.json();
        setRecipes(data);
        return existingRecipe.id;
      } else {
        // Create new - get the id back
        const createRes = await fetch('/api/recipes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: recipe.name,
            ingredients: recipe.ingredients,
            directions: recipe.directions,
            tags: recipe.tags || [],
            rating: recipe.rating || 0
          })
        });
        const createData = await createRes.json();
        
        const res = await fetch('/api/recipes');
        const data = await res.json();
        setRecipes(data);
        
        // Find the newly created recipe by name to return its ID
        const newRecipe = data.find((r: Recipe) => r.name?.toLowerCase() === nameToFind);
        return newRecipe?.id;
      }
    } catch (err) {
      console.error('Failed to save recipe:', err);
      return undefined;
    }
  };

  const deleteFromRecipeBook = async (id: number) => {
    try {
      await fetch(`/api/recipes/${id}`, {
        method: 'DELETE'
      });
      setRecipes(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('Failed to delete recipe:', err);
    }
  };

  const updateRecipeRating = async (recipe: Recipe, rating: number) => {
    try {
      await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...recipe, rating })
      });
      setRecipes(prev => prev.map(r => r.name === recipe.name ? { ...r, rating } : r));
    } catch (err) {
      console.error('Failed to update rating:', err);
    }
  };

  const filteredRecipes = recipes.filter(r => 
    r.name.toLowerCase().includes(recipeSearch.toLowerCase()) ||
    (r.tags && r.tags.some(tag => tag.toLowerCase().includes(recipeSearch.toLowerCase())))
  );

  const allTags = Array.from(new Set(recipes.flatMap(r => r.tags || []))).sort();

  return {
    recipes,
    recipeSearch,
    setRecipeSearch,
    filteredRecipes,
    allTags,
    saveToRecipeBook,
    deleteFromRecipeBook,
    updateRecipeRating
  };
}
