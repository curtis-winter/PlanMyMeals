/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
   Plus, 
   ShoppingCart, 
   ChevronRight, 
   ChevronLeft,
   UtensilsCrossed,
   BookOpen,
   Sparkles,
   Loader2,
   Settings,
   Package,
   Upload
 } from 'lucide-react';
import { motion } from 'motion/react';
import { DAYS_OF_WEEK, DayOfWeek, Ingredient, getWeekStart, Recipe } from './types';
import { generateId } from './utils/id';
import { DndContext } from '@dnd-kit/core';

// Hooks
import { usePantry } from './hooks/usePantry';
import { useMealPlan } from './hooks/useMealPlan';
import { useRecipes } from './hooks/useRecipes';
import { useSettings } from './hooks/useSettings';
import { useAI } from './hooks/useAI';
import { useBuildInfo } from './hooks/useBuildInfo';

// Components
import { ShoppingListModal } from './components/ShoppingListModal';
import { RecipeBookModal } from './components/RecipeBookModal';
import { SettingsModal } from './components/SettingsModal';
import { AIContextModal } from './components/AIContextModal';
import { PantryManagerModal } from './components/PantryManagerModal';
import { ImportRecipeModal } from './components/ImportRecipeModal';
import { SuggestedRecipeModal } from './components/SuggestedRecipeModal';
import { RecipeEditorModal } from './components/RecipeEditorModal';
import { CookRecipeModal } from './components/CookRecipeModal';
import { DayCard } from './components/DayCard';

export default function App() {
  const {
    pantryItems,
    savePantryItem,
    removePantryItem
  } = usePantry();

  const {
    ollamaSettings,
    setOllamaSettings,
    importPrompt,
    setImportPrompt,
    suggestPrompt,
    setSuggestPrompt,
    suggestOptions,
    setSuggestOptions,
    timeoutSuggest,
    setTimeoutSuggest,
    timeoutImport,
    setTimeoutImport,
    timeoutIngredients,
    setTimeoutIngredients,
    timeoutCleanup,
    setTimeoutCleanup,
    cleanupPrompt,
    setCleanupPrompt,
    weekStartDay,
    setWeekStartDay,
    availableModels,
    testStatus,
    darkMode,
    setDarkMode,
    saveSettings,
    testConnection
  } = useSettings();

  const {
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
    applyRecipeToDay,
    navigateWeek,
    setPlan,
    saveDayPlan
  } = useMealPlan(pantryItems, weekStartDay as DayOfWeek);

  const {
    recipes,
    recipeSearch,
    setRecipeSearch,
    filteredRecipes,
    allTags,
    saveToRecipeBook,
    deleteFromRecipeBook,
    updateRecipeRating
  } = useRecipes();

  const {
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
    setActiveDayForAI,
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
  } = useAI(plan, setPlan, saveDayPlan, pantryItems);

  const { buildNumber } = useBuildInfo();
  const isLocalHost = typeof window !== 'undefined' && window.location.hostname === 'localhost';

  const today = new Date();
  const todayName = DAYS_OF_WEEK[(today.getDay() + 6) % 7];

  const orderedDays = React.useMemo(() => {
    const startIndex = DAYS_OF_WEEK.indexOf(weekStartDay as DayOfWeek);
    if (startIndex === -1) return DAYS_OF_WEEK;
    return [...DAYS_OF_WEEK.slice(startIndex), ...DAYS_OF_WEEK.slice(0, startIndex)];
  }, [weekStartDay]);

  const getDayDate = (day: DayOfWeek) => {
    const startIndex = DAYS_OF_WEEK.indexOf(weekStartDay as DayOfWeek);
    const dayIndex = DAYS_OF_WEEK.indexOf(day);
    const offset = (dayIndex - startIndex + 7) % 7;
    const date = new Date(currentWeekStart + 'T00:00:00');
    date.setDate(date.getDate() + offset);
    return date;
  };

  const [expandedDay, setExpandedDay] = useState<DayOfWeek | null>(null);

  // Set initial expanded day to today on load
  React.useEffect(() => {
    if (!expandedDay) {
      setExpandedDay(todayName);
    }
  }, []);

  const [showShoppingList, setShowShoppingList] = useState(false);
  const [showPantryManager, setShowPantryManager] = useState(false);
  const [showRecipeBook, setShowRecipeBook] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showRecipeEditor, setShowRecipeEditor] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Partial<Recipe> | null>(null);
  const [showCookModal, setShowCookModal] = useState(false);
  const [cookingRecipe, setCookingRecipe] = useState<Recipe | null>(null);
  const [dragSource, setDragSource] = useState<{ day: DayOfWeek; index: number } | null>(null);

  const syncPantryFromIngredient = (name: string, isAvailable: boolean) => {
    if (!name) return;
    if (isAvailable) {
      savePantryItem({ name });
    } else {
      const item = pantryItems.find(p => p.name.toLowerCase() === name.toLowerCase());
      if (item) {
        removePantryItem(item.id);
      }
    }
  };

  const handleUpdateIngredient = (day: DayOfWeek, recipeIndex: number, id: string, updates: Partial<Ingredient>) => {
    updateIngredient(day, recipeIndex, id, updates);
    
    if (updates.isAvailable !== undefined) {
      const recipe = plan[day].recipes[recipeIndex];
      const ingredient = recipe.ingredients.find(ing => ing.id === id);
      if (ingredient) {
        syncPantryFromIngredient(ingredient.name, updates.isAvailable);
      }
    }
  };

  const handleSaveRecipeFromEditor = (recipe: Partial<Recipe>) => {
    saveToRecipeBook(recipe as any);
    
    recipe.ingredients?.forEach(ing => {
      if (ing.isAvailable && ing.name) {
        savePantryItem({ name: ing.name });
      }
    });
  };

  const handleCookRecipe = (recipe: Recipe) => {
    setCookingRecipe(recipe);
    setShowRecipeEditor(false);
    setShowRecipeBook(false);
    setShowCookModal(true);
  };

  const handleUseIngredient = (name: string) => {
    const item = pantryItems.find(p => p.name.toLowerCase() === name.toLowerCase());
    if (item) {
      removePantryItem(item.id);
    }
  };

  const handleIngredientKeyDown = (e: React.KeyboardEvent, day: DayOfWeek, recipeIndex: number, id: string, type: 'amount' | 'name') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (type === 'amount') {
        const row = e.currentTarget.closest('.ingredient-row');
        const nameInput = row?.querySelector('[data-type="name"]') as HTMLInputElement;
        if (nameInput) nameInput.focus();
      } else {
        addIngredient(day, recipeIndex);
        // Focus the new amount field after state update
        setTimeout(() => {
          const container = document.querySelector(`[data-day="${day}"][data-recipe="${recipeIndex}"]`);
          const rows = container?.querySelectorAll('.ingredient-row');
          if (rows && rows.length > 0) {
            const lastRow = rows[rows.length - 1];
            const amountInput = lastRow.querySelector('[data-type="amount"]') as HTMLInputElement;
            if (amountInput) amountInput.focus();
          }
        }, 50);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background-theme text-text-theme font-sans pb-20 transition-colors">
      {/* Header */}
      <header className={`border-b sticky top-0 z-30 transition-colors ${isLocalHost ? 'bg-red-600 border-red-800' : 'bg-surface border-border-theme'}`}>
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowSettings(true)}
              className={`p-2 transition-colors ${isLocalHost ? 'text-white hover:text-red-200' : 'text-neutral-theme hover:text-primary'}`}
              title="Settings"
            >
              <Settings className="w-6 h-6" />
            </button>
            <div className={`p-2 rounded-lg ${isLocalHost ? 'bg-white' : 'bg-primary'}`}>
              <UtensilsCrossed className={`w-5 h-5 ${isLocalHost ? 'text-red-600' : 'text-background-theme'}`} />
            </div>
            <h1 className={`font-bold text-xl tracking-tight ${isLocalHost ? 'text-white' : 'text-primary'}`}>MyMealPlan</h1>
          </div>
          <div className="flex items-center gap-2">
            {isLocalHost && buildNumber > 0 && (
              <span className="bg-white text-red-600 px-3 py-1 rounded-full text-sm font-bold">
                Build #{buildNumber}
              </span>
            )}
            <button 
              onClick={() => setShowRecipeBook(true)}
              className={`flex items-center gap-2 border text-sm font-medium px-4 py-2 rounded-full transition-colors shadow-sm ${isLocalHost ? 'bg-white/20 border-white/40 text-white hover:bg-white/30' : 'bg-surface border-border-theme text-primary hover:bg-background-theme'}`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Recipe Book</span>
            </button>
            <button 
              onClick={() => setShowPantryManager(true)}
              className={`flex items-center gap-2 border text-sm font-medium px-4 py-2 rounded-full transition-colors shadow-sm ${isLocalHost ? 'bg-white/20 border-white/40 text-white hover:bg-white/30' : 'bg-surface border-border-theme text-primary hover:bg-background-theme'}`}
            >
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Pantry</span>
            </button>
            <button 
              onClick={() => setShowShoppingList(true)}
              className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full transition-colors shadow-sm ${isLocalHost ? 'bg-white text-red-600 hover:bg-red-100' : 'bg-primary text-background-theme hover:bg-secondary hover:text-primary'}`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Shopping List</span>
              {shoppingList.length > 0 && (
                <span className={`text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold ${isLocalHost ? 'bg-red-800 text-white' : 'bg-accent-theme text-black'}`}>
                  {shoppingList.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Sticky Controls Container */}
        <div className="sticky top-16 z-20 bg-background-theme/80 backdrop-blur-sm -mx-4 px-4 pt-4 pb-2 mb-4 space-y-4">
          {/* Week Navigation */}
          <div className="flex items-center justify-between bg-surface p-4 rounded-2xl shadow-sm border border-border-theme transition-colors">
            <button 
              onClick={() => navigateWeek(-1)}
              className="p-2 hover:bg-background-theme rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-neutral-theme hover:text-primary" />
            </button>
            <div className="flex flex-col items-center">
              <h2 className="text-lg font-bold text-primary">
                Week of {new Date(currentWeekStart + 'T00:00:00').toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
              </h2>
              <p className="text-xs text-neutral-theme font-medium uppercase tracking-widest">
                {currentWeekStart === getWeekStart(new Date()) ? 'Current Week' : 'History'}
              </p>
            </div>
            <button 
              onClick={() => navigateWeek(1)}
              className="p-2 hover:bg-background-theme rounded-full transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-neutral-theme hover:text-primary" />
            </button>
          </div>

          {/* Suggest a Recipe Button */}
          <div>
            <button
              onClick={() => {
                setActiveDayForAI(null);
                setActiveRecipeIndex(null);
                setShowPantryModal(true);
              }}
              disabled={isSuggestingRecipe}
              className="w-full py-4 bg-primary text-background-theme rounded-2xl font-bold hover:bg-secondary hover:text-primary transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSuggestingRecipe ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
              Suggest a Recipe
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {orderedDays.map((day) => (
            <DayCard
              key={day}
              day={day}
              isToday={day === todayName}
              date={getDayDate(day)}
              recipes={plan[day].recipes}
              instructions={plan[day].instructions}
              isExpanded={expandedDay === day}
              onToggleExpand={() => setExpandedDay(expandedDay === day ? null : day)}
              addRecipeToDay={addRecipeToDay}
              updateRecipe={updateRecipe}
              removeRecipe={removeRecipe}
              saveToRecipeBook={saveToRecipeBook}
              addIngredient={addIngredient}
              updateIngredient={handleUpdateIngredient}
              removeIngredient={removeIngredient}
              handleIngredientKeyDown={handleIngredientKeyDown}
              addDirection={addDirection}
              updateDirection={updateDirection}
              removeDirection={removeDirection}
              addInstruction={addInstruction}
              updateInstruction={updateInstruction}
              removeInstruction={removeInstruction}
              pantryItems={pantryItems}
              onOpenRecipeBook={(day) => {
                setExpandedDay(day);
                setShowRecipeBook(true);
              }}
              onCook={handleCookRecipe}
              applyRecipeToDay={applyRecipeToDay}
              onImportRecipe={(day) => {
                setActiveDayForAI(day);
                setShowImportModal(true);
              }}
              onDragStart={(day, index) => setDragSource({ day, index })}
              onDrop={(targetDay, targetIndex) => {
                if (!dragSource) return;
                
                if (dragSource.day === targetDay) {
                  // Reorder within same day
                  const sourceIndex = dragSource.index;
                  const newRecipes = [...plan[targetDay].recipes];
                  const [removed] = newRecipes.splice(sourceIndex, 1);
                  newRecipes.splice(targetIndex, 0, removed);
                  setPlan(prev => ({
                    ...prev,
                    [targetDay]: { ...prev[targetDay], recipes: newRecipes }
                  }));
                  saveDayPlan(targetDay, { recipes: newRecipes, instructions: plan[targetDay].instructions || [] });
                } else {
                  // Move between days
                  const sourceRecipe = plan[dragSource.day].recipes[dragSource.index];
                  const newSourceRecipes = plan[dragSource.day].recipes.filter((_, i) => i !== dragSource.index);
                  const newTargetRecipes = [...plan[targetDay].recipes];
                  newTargetRecipes.splice(targetIndex, 0, sourceRecipe);
                  setPlan(prev => ({
                    ...prev,
                    [dragSource.day]: { ...prev[dragSource.day], recipes: newSourceRecipes },
                    [targetDay]: { ...prev[targetDay], recipes: newTargetRecipes }
                  }));
                  saveDayPlan(dragSource.day, { recipes: newSourceRecipes, instructions: plan[dragSource.day].instructions || [] });
                  saveDayPlan(targetDay, { recipes: newTargetRecipes, instructions: plan[targetDay].instructions || [] });
                }
                setDragSource(null);
              }}
            />
          ))}
        </div>
      </main>

      {/* Modals */}
      <ShoppingListModal 
        isOpen={showShoppingList} 
        onClose={() => setShowShoppingList(false)} 
        shoppingList={shoppingList} 
        onMarkAsAvailable={(name) => savePantryItem({ name })}
      />

      <RecipeBookModal
        isOpen={showRecipeBook}
        onClose={() => setShowRecipeBook(false)}
        recipeSearch={recipeSearch}
        setRecipeSearch={setRecipeSearch}
        filteredRecipes={filteredRecipes}
        updateRecipeRating={updateRecipeRating}
        applyRecipeToDay={applyRecipeToDay}
        expandedDay={expandedDay}
        pantryItems={pantryItems}
        onOpenImport={() => setShowImportModal(true)}
        onOpenNewRecipe={() => {
          setEditingRecipe(null);
          setShowRecipeEditor(true);
        }}
        onEditRecipe={(recipe) => {
          setEditingRecipe(recipe);
          setShowRecipeEditor(true);
        }}
        onCook={handleCookRecipe}
        orderedDays={orderedDays}
      />

      <RecipeEditorModal
        isOpen={showRecipeEditor}
        onClose={() => {
          setShowRecipeEditor(false);
          setEditingRecipe(null);
        }}
        onSave={handleSaveRecipeFromEditor}
        onDelete={(id) => deleteFromRecipeBook(id)}
        onCook={handleCookRecipe}
        initialRecipe={editingRecipe || undefined}
        onAIPreview={cleanupRecipe}
        isAIProcessing={isCleaningUp}
        allTags={allTags}
        existingRecipes={recipes}
        onIngredientToggle={(name, isAvailable) => {
          if (isAvailable) {
            savePantryItem({ name });
          } else {
            const item = pantryItems.find(p => p.name.toLowerCase() === name.toLowerCase());
            if (item) {
              removePantryItem(item.id);
            }
          }
        }}
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        ollamaSettings={ollamaSettings}
        setOllamaSettings={setOllamaSettings}
        testStatus={testStatus}
        testConnection={testConnection}
        availableModels={availableModels}
        saveSettings={saveSettings}
        importPrompt={importPrompt}
        setImportPrompt={setImportPrompt}
        suggestPrompt={suggestPrompt}
        setSuggestPrompt={setSuggestPrompt}
        suggestOptions={suggestOptions}
        setSuggestOptions={setSuggestOptions}
        timeoutSuggest={timeoutSuggest}
        setTimeoutSuggest={setTimeoutSuggest}
        timeoutImport={timeoutImport}
        setTimeoutImport={setTimeoutImport}
        timeoutIngredients={timeoutIngredients}
        setTimeoutIngredients={setTimeoutIngredients}
        cleanupPrompt={cleanupPrompt}
        setCleanupPrompt={setCleanupPrompt}
        timeoutCleanup={timeoutCleanup}
        setTimeoutCleanup={setTimeoutCleanup}
        weekStartDay={weekStartDay}
        setWeekStartDay={setWeekStartDay}
      />

      <ImportRecipeModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={importRecipe}
        isImporting={isImporting}
      />

      <AIContextModal
        isOpen={showPantryModal}
        onClose={() => setShowPantryModal(false)}
        pantryContext={pantryContext}
        setPantryContext={setPantryContext}
        dietaryOptions={dietaryOptions}
        setDietaryOptions={setDietaryOptions}
        recipeCount={recipeCount}
        setRecipeCount={setRecipeCount}
        useDifferentProteins={useDifferentProteins}
        setUseDifferentProteins={setUseDifferentProteins}
        useUniqueRecipes={useUniqueRecipes}
        setUseUniqueRecipes={setUseUniqueRecipes}
        suggestOptions={suggestOptions}
        onConfirm={confirmAIGeneration}
        isSuggestingRecipe={isSuggestingRecipe}
      />

      <PantryManagerModal
        isOpen={showPantryManager}
        onClose={() => setShowPantryManager(false)}
        pantryItems={pantryItems}
        savePantryItem={savePantryItem}
        removePantryItem={removePantryItem}
      />

      <SuggestedRecipeModal
        isOpen={showSuggestedRecipeModal}
        onClose={() => setShowSuggestedRecipeModal(false)}
        suggestedRecipes={suggestedRecipes}
        saveToRecipeBook={saveToRecipeBook}
        applyRecipeToDay={applyRecipeToDay}
        orderedDays={orderedDays}
      />

      {cookingRecipe && (
        <CookRecipeModal
          isOpen={showCookModal}
          onClose={() => {
            setShowCookModal(false);
            setCookingRecipe(null);
          }}
          recipe={cookingRecipe}
          pantryItems={pantryItems}
          onUseIngredient={handleUseIngredient}
        />
      )}

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-4 sm:hidden">
        <button 
          onClick={() => setShowRecipeBook(true)}
          className="w-14 h-14 bg-surface text-primary rounded-full shadow-xl flex items-center justify-center border border-border-theme active:scale-90"
        >
          <BookOpen className="w-6 h-6" />
        </button>
        <button 
          onClick={() => setShowShoppingList(true)}
          className="w-14 h-14 bg-primary text-background-theme rounded-full shadow-xl flex items-center justify-center hover:bg-secondary hover:text-primary transition-all active:scale-90"
        >
          <ShoppingCart className="w-6 h-6" />
          {shoppingList.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-accent-theme text-primary text-[10px] w-6 h-6 flex items-center justify-center rounded-full border-2 border-surface font-bold">
              {shoppingList.length}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
