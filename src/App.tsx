/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useCallback, memo } from 'react';
import { BookOpen, ShoppingCart } from 'lucide-react';
import { DayOfWeek, Ingredient, Recipe } from './types';
import { getOrderedDays, getDayFromOffset, getWeekEnd, isSameDay, isDateInRange, getDayIndexFromDate } from './utils/date';
import { isLocalHost, capitalize } from './utils/environment';

// Hooks
import { usePantry } from './hooks/usePantry';
import { useMealPlan } from './hooks/useMealPlan';
import { useRecipes } from './hooks/useRecipes';
import { useSettings } from './hooks/useSettings';
import { useOllamaServers } from './hooks/useOllamaServers';
import { useAI } from './hooks/useAI';
import { useBuildInfo } from './hooks/useBuildInfo';
import { useModalState } from './hooks/useModalState';
import { useShoppingList } from './hooks/useShoppingList';
import { useToast } from './hooks/useToast';

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
import { Header } from './components/Header';
import { WeekControls } from './components/WeekControls';
import { ToastContainer } from './components/ui/Toast';

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
    timeoutPantry,
    setTimeoutPantry,
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
    servers,
    selectedServer,
    addServer,
    removeServer,
    selectServer
  } = useOllamaServers();

  const {
    plan,
    currentWeekStart,
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
  } = useMealPlan(pantryItems, weekStartDay as DayOfWeek);

const { shoppingList: fullShoppingList, customItems, removeCustomItem } = useShoppingList(plan, pantryItems);
const { toasts, showToast, removeToast } = useToast();

// Combine recipe items + custom items for badge count
  const shoppingListCount = fullShoppingList.length + customItems.length;

  const {
    recipes,
    recipeSearch,
    setRecipeSearch,
    filteredRecipes,
    allTags,
    saveToRecipeBook,
    deleteFromRecipeBook,
    updateRecipeRating,
    toggleFavorite
  } = useRecipes();

  const {
    isSuggestingRecipe,
    isCleaningUp,
    isImporting,
    suggestedRecipes,
    showSuggestedRecipeModal: aiShowSuggestedModal,
    setShowSuggestedRecipeModal: setAiShowSuggestedModal,
    showPantryModal: aiShowPantryModal,
    setShowPantryModal: setAiShowPantryModal,
    showImportModal: aiShowImportModal,
    setShowImportModal: setAiShowImportModal,
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
  } = useAI(plan, setPlan, saveDayPlan, pantryItems, (msg) => showToast(msg, 'error'));

  const {
    showShoppingList,
    setShowShoppingList,
    showPantryManager,
    setShowPantryManager,
    showRecipeBook,
    setShowRecipeBook,
    showSettings,
    setShowSettings,
    showRecipeEditor,
    setShowRecipeEditor,
    editingRecipe,
    setEditingRecipe,
    showCookModal,
    setShowCookModal,
    cookingRecipe,
    setCookingRecipe
  } = useModalState();

  const { buildNumber } = useBuildInfo();

  const isLocal = useMemo(() => isLocalHost(), []);
  const findPantryItem = useCallback((name: string) => 
    pantryItems.find(p => p.name.toLowerCase() === name.toLowerCase()), 
  [pantryItems]);

  const orderedDays = useMemo(() => 
    getOrderedDays(weekStartDay as DayOfWeek), 
  [weekStartDay]);

  const getDayDate = useCallback((day: DayOfWeek) => {
    const dayIndex = orderedDays.indexOf(day);
    return getDayFromOffset(currentWeekStart, dayIndex);
  }, [currentWeekStart, orderedDays]);

  const isToday = useCallback((day: DayOfWeek) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayDate = getDayDate(day);
    return isSameDay(dayDate, today);
  }, [getDayDate]);

  const [expandedDay, setExpandedDay] = useState<DayOfWeek | null>(null);
  const [dragSource, setDragSource] = useState<{ day: DayOfWeek; index: number } | null>(null);

  React.useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (orderedDays.length > 0 && currentWeekStart) {
      const weekStartDate = getDayFromOffset(currentWeekStart, 0);
      const weekEndDate = getWeekEnd(currentWeekStart);
      
      if (isDateInRange(today, weekStartDate, weekEndDate)) {
        const dayIndex = getDayIndexFromDate(today, weekStartDay as DayOfWeek);
        setExpandedDay(orderedDays[dayIndex]);
      } else {
        setExpandedDay(null);
      }
    }
  }, [orderedDays, currentWeekStart, weekStartDay]);

  React.useEffect(() => {
    if (expandedDay) {
      setTimeout(() => {
        const card = document.querySelector(`[data-day-card="${expandedDay}"]`);
        card?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [expandedDay]);

  const syncPantryFromIngredient = useCallback((name: string, isAvailable: boolean) => {
    if (!name) return;
    if (isAvailable) {
      savePantryItem({ name });
    } else {
      const item = findPantryItem(name);
      if (item) {
        removePantryItem(item.id);
      }
    }
  }, [savePantryItem, removePantryItem, findPantryItem]);

  const handleUpdateIngredient = useCallback((day: DayOfWeek, recipeIndex: number, id: string, updates: Partial<Ingredient>) => {
    updateIngredient(day, recipeIndex, id, updates);
    
    if (updates.isAvailable !== undefined) {
      const recipe = plan[day].recipes[recipeIndex];
      const ingredient = recipe.ingredients.find(ing => ing.id === id);
      if (ingredient) {
        syncPantryFromIngredient(ingredient.name, updates.isAvailable);
      }
    }
  }, [updateIngredient, plan, syncPantryFromIngredient]);

  const handleSaveRecipeFromEditor = useCallback((recipe: Partial<Recipe>) => {
    saveToRecipeBook(recipe as Recipe);
    
    recipe.ingredients?.forEach(ing => {
      if (ing.isAvailable && ing.name) {
        savePantryItem({ name: ing.name });
      }
    });
  }, [saveToRecipeBook, savePantryItem]);

  const handleCookRecipe = useCallback((recipe: Recipe) => {
    setCookingRecipe(recipe);
    setShowRecipeEditor(false);
    setShowRecipeBook(false);
    setShowCookModal(true);
  }, [setCookingRecipe, setShowRecipeEditor, setShowRecipeBook, setShowCookModal]);

  const handleUseIngredient = useCallback((name: string) => {
    const item = findPantryItem(name);
    if (item) {
      removePantryItem(item.id);
    }
  }, [findPantryItem, removePantryItem]);

  const handleDrop = useCallback((targetDay: DayOfWeek, targetIndex: number) => {
    if (!dragSource) return;
    
    if (dragSource.day === targetDay) {
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
  }, [dragSource, plan, setPlan, saveDayPlan]);

  const handleIngredientKeyDown = useCallback((e: React.KeyboardEvent, day: DayOfWeek, recipeIndex: number, id: string, type: 'amount' | 'name') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (type === 'amount') {
        const row = e.currentTarget.closest('.ingredient-row');
        const nameInput = row?.querySelector('[data-type="name"]') as HTMLInputElement;
        if (nameInput) nameInput.focus();
      } else {
        addIngredient(day, recipeIndex);
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
  }, [addIngredient]);

  return (
    <div className="min-h-screen bg-background-theme text-text-theme font-sans pb-20 transition-colors overflow-x-hidden flex flex-col">
      <Header 
        isLocalHost={isLocal}
        buildNumber={buildNumber}
        weekStartDay={weekStartDay as DayOfWeek}
        currentWeekStart={currentWeekStart}
        showSettings={showSettings}
        showRecipeBook={showRecipeBook}
        showPantryManager={showPantryManager}
        showShoppingList={showShoppingList}
        shoppingList={fullShoppingList}
        shoppingListCount={shoppingListCount}
        onToggleSettings={() => setShowSettings(true)}
        onToggleRecipeBook={() => setShowRecipeBook(true)}
        onTogglePantryManager={() => setShowPantryManager(true)}
        onToggleShoppingList={() => setShowShoppingList(true)}
        onNavigateWeek={navigateWeek}
      />

      <main className="max-w-4xl w-full mx-auto px-2 md:px-4 pb-20 flex flex-col flex-1">
        <WeekControls 
          currentWeekStart={currentWeekStart}
          weekStartDay={weekStartDay as DayOfWeek}
          onNavigateWeek={navigateWeek}
          onSuggestRecipe={() => {
            setActiveDayForAI(null);
            setActiveRecipeIndex(null);
            setAiShowPantryModal(true);
          }}
          isSuggestingRecipe={isSuggestingRecipe}
        />

        <div className="space-y-4 pt-20 overflow-y-auto flex-1">
{orderedDays.map((day) => (
<DayCard
  key={day}
  data-day-card={day}
  day={day}
              isToday={isToday(day)}
              date={getDayDate(day)}
              recipes={plan[day].recipes}
              instructions={plan[day].instructions}
              isExpanded={expandedDay === day}
              onToggleExpand={() => setExpandedDay(expandedDay === day ? null : day)}
              addRecipeToDay={addRecipeToDay}
              updateRecipe={updateRecipe}
              removeRecipe={removeRecipe}
              saveToRecipeBook={saveToRecipeBook}
              bookRecipes={recipes}
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
              toggleTaskComplete={toggleTaskComplete}
              pantryItems={pantryItems}
              onOpenRecipeBook={(day) => {
                setExpandedDay(day);
                setShowRecipeBook(true);
              }}
              onCook={handleCookRecipe}
              applyRecipeToDay={applyRecipeToDay}
              onImportRecipe={(day) => {
                setActiveDayForAI(day);
                setAiShowImportModal(true);
              }}
              onDragStart={(day, index) => setDragSource({ day, index })}
              onDrop={handleDrop}
            />
          ))}
        </div>
      </main>

      {/* Modals */}
      <ShoppingListModal 
        isOpen={showShoppingList} 
        onClose={() => setShowShoppingList(false)} 
        shoppingList={fullShoppingList}
        customItems={customItems}
        isLocalHost={isLocal}
        onMarkAsAvailable={(name) => savePantryItem({ name })}
        onAddItem={(name) => savePantryItem({ name: capitalize(name) })}
        onRemoveCustomItem={removeCustomItem}
      />

      <RecipeBookModal
        isOpen={showRecipeBook}
        onClose={() => setShowRecipeBook(false)}
        recipeSearch={recipeSearch}
        setRecipeSearch={setRecipeSearch}
        filteredRecipes={filteredRecipes}
        updateRecipeRating={updateRecipeRating}
        toggleFavorite={toggleFavorite}
        applyRecipeToDay={applyRecipeToDay}
        expandedDay={expandedDay}
        pantryItems={pantryItems}
        onOpenImport={() => setAiShowImportModal(true)}
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
        allTags={allTags}
        isLocalHost={isLocal}
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
            const item = findPantryItem(name);
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
        servers={servers}
        selectedServer={selectedServer}
        onSelectServer={selectServer}
        onAddServer={addServer}
        onRemoveServer={removeServer}
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
        timeoutPantry={timeoutPantry}
        setTimeoutPantry={setTimeoutPantry}
        weekStartDay={weekStartDay}
        setWeekStartDay={setWeekStartDay}
        isLocalHost={isLocal}
      />

      <ImportRecipeModal
        isOpen={aiShowImportModal}
        onClose={() => setAiShowImportModal(false)}
        onImport={importRecipe}
        isImporting={isImporting}
      />

      <AIContextModal
        isOpen={aiShowPantryModal}
        onClose={() => setAiShowPantryModal(false)}
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
        isLocalHost={isLocal}
      />

      <SuggestedRecipeModal
        isOpen={aiShowSuggestedModal}
        onClose={() => setAiShowSuggestedModal(false)}
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

      {/* Floating Action Buttons - only visible on mobile */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-4 md:hidden z-50">
        <button 
          id="fab-recipe-book"
          onClick={() => setShowRecipeBook(true)}
          className="w-14 h-14 bg-primary text-background-theme rounded-full shadow-xl flex items-center justify-center hover:bg-secondary hover:text-primary transition-all active:scale-90"
        >
          <BookOpen className="w-6 h-6" />
        </button>
        <button 
          id="fab-shopping-list"
          onClick={() => setShowShoppingList(true)}
          className="w-14 h-14 bg-primary text-background-theme rounded-full shadow-xl flex items-center justify-center hover:bg-secondary hover:text-primary transition-all active:scale-90 relative"
        >
          <ShoppingCart className="w-6 h-6" />
          {shoppingListCount > 0 && (
            <span id="fab-badge" className="absolute -top-1 -right-1 bg-accent-theme text-black text-[10px] w-6 h-6 flex items-center justify-center rounded-full border-2 border-surface font-bold">
              {shoppingListCount}
            </span>
          )}
</button>
</div>

<ToastContainer toasts={toasts} onRemove={removeToast} />
</div>
);
}
