import { useState } from 'react';
import { Recipe } from '../types';

export function useModalState() {
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [showPantryManager, setShowPantryManager] = useState(false);
  const [showRecipeBook, setShowRecipeBook] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showRecipeEditor, setShowRecipeEditor] = useState(false);
  const [showCookModal, setShowCookModal] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Partial<Recipe> | null>(null);
  const [cookingRecipe, setCookingRecipe] = useState<Recipe | null>(null);

  return {
    showShoppingList,
    showPantryManager,
    showRecipeBook,
    showSettings,
    showRecipeEditor,
    showCookModal,
    editingRecipe,
    cookingRecipe,
    setShowShoppingList,
    setShowPantryManager,
    setShowRecipeBook,
    setShowSettings,
    setShowRecipeEditor,
    setShowCookModal,
    setEditingRecipe,
    setCookingRecipe
  };
}