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

  const saveToRecipeBook = async (recipe: RecipeInstance | Recipe) => {
    if (!recipe.name) return;
    try {
      await fetch('/api/recipes', {
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
      // Refresh recipes
      const res = await fetch('/api/recipes');
      const data = await res.json();
      setRecipes(data);
    } catch (err) {
      console.error('Failed to save recipe:', err);
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
