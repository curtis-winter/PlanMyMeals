/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BookOpen, ShoppingCart } from 'lucide-react';
import { DAYS_OF_WEEK, DayOfWeek, Ingredient, Recipe } from './types';

// Hooks
import { usePantry } from './hooks/usePantry';
import { useMealPlan } from './hooks/useMealPlan';
import { useRecipes } from './hooks/useRecipes';
import { useSettings } from './hooks/useSettings';
import { useOllamaServers } from './hooks/useOllamaServers';
import { useAI } from './hooks/useAI';
import { useBuildInfo } from './hooks/useBuildInfo';
import { useModalState } from './hooks/useModalState';

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
  } = useAI(plan, setPlan, saveDayPlan, pantryItems);

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
  const isLocalHost = typeof window !== 'undefined' && window.location.hostname === 'localhost';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

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
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const isToday = (day: DayOfWeek) => {
    const dayDate = getDayDate(day);
    return dayDate.getTime() === today.getTime();
  };

  const [expandedDay, setExpandedDay] = useState<DayOfWeek | null>(null);

  // Set initial expanded day to today's day on load, only if current week contains today
  React.useEffect(() => {
    if (orderedDays.length > 0 && currentWeekStart) {
      const weekStart = new Date(currentWeekStart + 'T00:00:00');
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      if (today >= weekStart && today <= weekEnd) {
        const diff = Math.floor((today.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
        const dayIndex = ((diff % 7) + 7) % 7;
        setExpandedDay(orderedDays[dayIndex]);
      } else {
        setExpandedDay(null);
      }
    }
  }, [orderedDays, currentWeekStart]);

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
    <div className="min-h-screen bg-background-theme text-text-theme font-sans pb-20 transition-colors overflow-x-hidden">
      <Header 
        isLocalHost={isLocalHost}
        buildNumber={buildNumber}
        weekStartDay={weekStartDay as DayOfWeek}
        currentWeekStart={currentWeekStart}
        showSettings={showSettings}
        showRecipeBook={showRecipeBook}
        showPantryManager={showPantryManager}
        showShoppingList={showShoppingList}
        shoppingList={shoppingList}
        onToggleSettings={() => setShowSettings(true)}
        onToggleRecipeBook={() => setShowRecipeBook(true)}
        onTogglePantryManager={() => setShowPantryManager(true)}
        onToggleShoppingList={() => setShowShoppingList(true)}
        onNavigateWeek={navigateWeek}
      />

      <main className="max-w-4xl mx-auto px-4 pb-8 overflow-y-auto h-[calc(100vh-64px)]">
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

        <div className="space-y-4">
          {orderedDays.map((day) => (
            <DayCard
              key={day}
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
              onDrop={(targetDay, targetIndex) => {
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
        onAddItem={(name) => {
          const capitalized = name.trim().charAt(0).toUpperCase() + name.trim().slice(1);
          savePantryItem({ name: capitalized });
        }}
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
          {shoppingList.length > 0 && (
            <span id="fab-badge" className="absolute -top-1 -right-1 bg-accent-theme text-black text-[10px] w-6 h-6 flex items-center justify-center rounded-full border-2 border-surface font-bold">
              {shoppingList.length}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
