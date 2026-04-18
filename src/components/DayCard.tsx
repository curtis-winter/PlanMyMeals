import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronRight, Plus, Trash2, BookPlus, BookMarked, Utensils, History, Import, GripVertical, CheckCircle2, Circle } from 'lucide-react';
import { DayOfWeek, RecipeInstance, Ingredient, PantryItem, Recipe, Task } from '../types';
import { RecipeInstanceCard } from './RecipeInstanceCard';

interface DayCardProps {
  day: DayOfWeek;
  'data-day-card'?: DayOfWeek;
  date?: Date;
  isToday?: boolean;
  recipes: RecipeInstance[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  addRecipeToDay: (day: DayOfWeek) => void;
  updateRecipe: (day: DayOfWeek, index: number, updates: Partial<RecipeInstance>) => void;
  removeRecipe: (day: DayOfWeek, index: number) => void;
  saveToRecipeBook: (recipe: RecipeInstance) => void;
  bookRecipes?: Recipe[];
  addIngredient: (day: DayOfWeek, recipeIndex: number) => void;
  updateIngredient: (day: DayOfWeek, recipeIndex: number, id: string, updates: Partial<Ingredient>) => void;
  removeIngredient: (day: DayOfWeek, recipeIndex: number, id: string) => void;
  handleIngredientKeyDown: (e: React.KeyboardEvent, day: DayOfWeek, recipeIndex: number, id: string, type: 'amount' | 'name') => void;
  addDirection: (day: DayOfWeek, recipeIndex: number) => void;
  updateDirection: (day: DayOfWeek, recipeIndex: number, dirIndex: number, value: string) => void;
  removeDirection: (day: DayOfWeek, recipeIndex: number, dirIndex: number) => void;
  applyRecipeToDay: (recipe: Recipe, day: DayOfWeek) => void;
  onDragStart?: (day: DayOfWeek, recipeIndex: number) => void;
  onDragOver?: (day: DayOfWeek, recipeIndex: number) => void;
  onDrop?: (targetDay: DayOfWeek, targetIndex: number) => void;
  pantryItems: PantryItem[];
  onOpenRecipeBook: (day: DayOfWeek) => void;
  onCook: (recipe: Recipe) => void;
  instructions?: Task[];
  addInstruction: (day: DayOfWeek) => void;
  updateInstruction: (day: DayOfWeek, index: number, value: string) => void;
  removeInstruction: (day: DayOfWeek, index: number) => void;
  toggleTaskComplete: (day: DayOfWeek, index: number) => void;
  onImportRecipe: (day: DayOfWeek) => void;
}

function DraggableRecipeCard({
  recipe,
  recipeIndex,
  day,
  updateRecipe,
  removeRecipe,
  addIngredient,
  updateIngredient,
  removeIngredient,
  handleIngredientKeyDown,
  addDirection,
  updateDirection,
  removeDirection,
  onCook,
  pantryNames,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging
}: {
  recipe: RecipeInstance;
  recipeIndex: number;
  day: DayOfWeek;
  updateRecipe: (day: DayOfWeek, index: number, updates: Partial<RecipeInstance>) => void;
  removeRecipe: (day: DayOfWeek, index: number) => void;
  addIngredient: (day: DayOfWeek, recipeIndex: number) => void;
  updateIngredient: (day: DayOfWeek, recipeIndex: number, id: string, updates: Partial<Ingredient>) => void;
  removeIngredient: (day: DayOfWeek, recipeIndex: number, id: string) => void;
  handleIngredientKeyDown: (e: React.KeyboardEvent, day: DayOfWeek, recipeIndex: number, id: string, type: 'amount' | 'name') => void;
  addDirection: (day: DayOfWeek, recipeIndex: number) => void;
  updateDirection: (day: DayOfWeek, recipeIndex: number, dirIndex: number, value: string) => void;
  removeDirection: (day: DayOfWeek, recipeIndex: number, dirIndex: number) => void;
  onCook: (recipe: Recipe) => void;
  pantryNames: Set<string>;
  onDragStart?: (day: DayOfWeek, recipeIndex: number) => void;
  onDragOver?: (day: DayOfWeek, recipeIndex: number) => void;
  onDrop?: (targetDay: DayOfWeek, targetIndex: number) => void;
  isDragging?: boolean;
}) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify({ day, recipeIndex }));
    if (onDragStart) onDragStart(day, recipeIndex);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDrop) onDrop(day, recipeIndex);
  };

  const handleDragEnd = () => {};

  return (
    <div 
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnd={handleDragEnd}
      className={`group relative ${isDragging ? 'opacity-50' : ''}`}
      style={{ cursor: 'grab' }}
    >
      <div className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity p-1 z-10">
        <GripVertical className="w-4 h-4 text-neutral-theme" />
      </div>
      <div className="pl-6" onClick={(e) => e.stopPropagation()}>
        <RecipeInstanceCard
          day={day}
          recipe={recipe}
          recipeIndex={recipeIndex}
          updateRecipe={updateRecipe}
          removeRecipe={removeRecipe}
          addIngredient={addIngredient}
          updateIngredient={updateIngredient}
          removeIngredient={removeIngredient}
          handleIngredientKeyDown={handleIngredientKeyDown}
          addDirection={addDirection}
          updateDirection={updateDirection}
          removeDirection={removeDirection}
          onCook={onCook}
          pantryNames={pantryNames}
        />
      </div>
    </div>
  );
}

export const DayCard: React.FC<DayCardProps> = ({
  day,
  'data-day-card': dataDayCard,
  date,
  isToday,
  recipes,
  isExpanded,
  onToggleExpand,
  addRecipeToDay,
  updateRecipe,
  removeRecipe,
  saveToRecipeBook,
  bookRecipes = [],
  addIngredient,
  updateIngredient,
  removeIngredient,
  handleIngredientKeyDown,
  addDirection,
  updateDirection,
  removeDirection,
  applyRecipeToDay,
  onDragStart,
  onDragOver,
  onDrop,
  pantryItems,
  onOpenRecipeBook,
  onCook,
  instructions = [],
  addInstruction,
  updateInstruction,
  removeInstruction,
  toggleTaskComplete,
  onImportRecipe
}) => {
  const [isEnteringRestaurant, setIsEnteringRestaurant] = React.useState(false);
  const [restaurantName, setRestaurantName] = useState('');
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
  const [focusedTaskIndex, setFocusedTaskIndex] = React.useState<number | null>(null);
  
  const pantryNames = React.useMemo(() => 
    new Set(pantryItems.map(item => item.name.toLowerCase().trim())),
    [pantryItems]
  );

  const handleAddEatOut = () => {
    if (restaurantName.trim()) {
      applyRecipeToDay({ name: `Eat Out: ${restaurantName.trim()}`, ingredients: [], directions: [], rating: 0 }, day);
      setRestaurantName('');
      setIsEnteringRestaurant(false);
    }
  };

return (
  <motion.div
    layout
    data-day-card={dataDayCard}
    style={{ zIndex: 1, position: 'relative' }}
      className={`bg-surface rounded-2xl transition-all duration-200 ${
        isToday ? 'border-2 border-primary shadow-lg' : 
        isExpanded ? 'border border-primary shadow-md' : 'border-border-theme shadow-sm hover:border-primary/50'
      }`}
      onDragEnter={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      }}
      onDrop={(e) => {
        e.preventDefault();
        if (onDrop) onDrop(day, 0);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
      }}
    >
      <button
        onClick={onToggleExpand}
        className="w-full px-6 py-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
            isExpanded ? 'bg-primary text-background-theme' : 'bg-background-theme text-neutral-theme'
          }`}>
            {day.substring(0, 3)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-primary">{day}</h3>
              {date && (
                <span className="text-[10px] font-bold text-neutral-theme uppercase tracking-widest bg-background-theme px-1.5 py-0.5 rounded">
                  {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              )}
            </div>
            <p className="text-sm text-neutral-theme">
              {recipes.length > 0 
                ? recipes.map(r => r.name || 'Unnamed').join(', ')
                : 'No meal planned'}
            </p>
          </div>
        </div>
        {isExpanded ? <ChevronDown className="w-5 h-5 text-neutral-theme" /> : <ChevronRight className="w-5 h-5 text-neutral-theme" />}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-2 border-t border-border-theme">
              <div className="space-y-6">
                {/* Tasks Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-bold text-neutral-theme uppercase tracking-widest">Tasks</h4>
                  </div>
                  <div className="space-y-2">
                    {instructions.map((task, idx) => (
                      <div key={task.id} className="flex items-center gap-2 group">
                        <button
                          onClick={() => toggleTaskComplete(day, idx)}
                          className="flex-shrink-0"
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : (
                            <Circle className="w-5 h-5 text-primary/30 hover:text-primary" />
                          )}
                        </button>
                        <input
                          type="text"
                          value={task.text}
                          onChange={(e) => updateInstruction(day, idx, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                              addInstruction(day);
                            }
                          }}
                          onBlur={(e) => {
                            if (!e.target.value.trim()) {
                              removeInstruction(day, idx);
                            }
                          }}
                          ref={(el) => {
                            if (el && idx === instructions.length - 1 && task.text === '') {
                              el.focus();
                            }
                          }}
                          placeholder="e.g., Thaw shrimp, buy groceries..."
                          className={`flex-1 bg-background-theme/50 border-none focus:ring-1 focus:ring-primary/20 px-3 py-2 rounded-xl text-sm placeholder:text-neutral-theme/30 ${
                            task.completed ? 'line-through text-neutral-theme/50' : 'text-primary'
                          }`}
                        />
                        <button
                          onClick={() => removeInstruction(day, idx)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-neutral-theme hover:text-red-500 transition-all"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {instructions.length === 0 && (
                      <button
                        onClick={() => addInstruction(day)}
                        className="text-primary text-sm font-medium flex items-center gap-2 hover:text-secondary transition-colors"
                      >
                        <Plus className="w-4 h-4" /> Add Task
                      </button>
                    )}
                  </div>
                </div>

                {recipes.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-border-theme rounded-2xl bg-background-theme/10">
                    <p className="text-sm text-neutral-theme mb-4">No recipes added for this day</p>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <button
                        onClick={() => addRecipeToDay(day)}
                        className="px-6 py-3 bg-primary text-background-theme rounded-xl text-sm font-bold hover:bg-secondary hover:text-primary transition-all flex items-center justify-center gap-2 shadow-sm"
                      >
                        <Plus className="w-4 h-4" /> New Recipe
                      </button>
                      <button
                        onClick={() => onOpenRecipeBook(day)}
                        className="px-6 py-3 bg-surface text-primary border border-border-theme rounded-xl text-sm font-bold hover:bg-background-theme transition-all flex items-center justify-center gap-2 shadow-sm"
                      >
                        <BookPlus className="w-4 h-4" /> From Recipe Book
                      </button>
                      <button
                        onClick={() => onImportRecipe(day)}
                        className="px-6 py-3 bg-surface text-primary border border-border-theme rounded-xl text-sm font-bold hover:bg-background-theme transition-all flex items-center justify-center gap-2 shadow-sm"
                      >
                        <Import className="w-4 h-4" /> Import Recipe
                      </button>
                      <button
                        onClick={() => setIsEnteringRestaurant(true)}
                        className="px-6 py-3 bg-surface text-primary border border-border-theme rounded-xl text-sm font-bold hover:bg-background-theme transition-all flex items-center justify-center gap-2 shadow-sm"
                      >
                        <Utensils className="w-4 h-4" /> Eat Out
                      </button>
                      <button
                        onClick={() => applyRecipeToDay({ name: "Leftovers", ingredients: [], directions: [], rating: 0 }, day)}
                        className="px-6 py-3 bg-surface text-primary border border-border-theme rounded-xl text-sm font-bold hover:bg-background-theme transition-all flex items-center justify-center gap-2 shadow-sm"
                      >
                        <History className="w-4 h-4" /> Leftovers
                      </button>
                    </div>
                  </div>
                )}

                {/* Restaurant Input Overlay */}
                <AnimatePresence>
                  {isEnteringRestaurant && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsEnteringRestaurant(false)}
                        className="absolute inset-0 bg-neutral-theme/60 backdrop-blur-sm"
                      />
                      <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative w-full max-w-sm bg-surface rounded-3xl shadow-2xl p-6 border border-border-theme"
                      >
                        <h3 className="text-lg font-bold text-primary mb-4">Where are you eating?</h3>
                        <input
                          autoFocus
                          type="text"
                          value={restaurantName}
                          onChange={(e) => setRestaurantName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddEatOut();
                            if (e.key === 'Escape') setIsEnteringRestaurant(false);
                          }}
                          placeholder="Restaurant name..."
                          className="w-full px-4 py-3 rounded-xl bg-background-theme border-transparent focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all outline-none text-primary mb-6"
                        />
                        <div className="flex gap-3">
                          <button
                            onClick={handleAddEatOut}
                            className="flex-1 py-3 bg-primary text-background-theme rounded-xl font-bold hover:bg-secondary hover:text-primary transition-all"
                          >
                            Add to Plan
                          </button>
                          <button
                            onClick={() => setIsEnteringRestaurant(false)}
                            className="px-6 py-3 bg-background-theme text-neutral-theme rounded-xl font-bold hover:bg-neutral-theme/10 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>

                {/* Recipe Cards with Drag and Drop */}
                <div 
                  className="space-y-4 min-h-[50px]"
                  onDragEnter={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (onDrop) onDrop(day, recipes.length);
                  }}
                >
                  {recipes.map((recipe, recipeIndex) => (
                    <div
                      key={recipe.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = 'move';
                        e.dataTransfer.setData('text/plain', `${day}|${recipeIndex}`);
                        // @ts-ignore - Firefox global workaround
                        window.__DRAG_DATA__ = { day, recipeIndex };
                        (e.target as HTMLElement).style.opacity = '0.5';
                        if (onDragStart) onDragStart(day, recipeIndex);
                      }}
                      onDragEnd={(e) => {
                        (e.target as HTMLElement).style.opacity = '1';
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (onDrop) onDrop(day, recipeIndex);
                      }}
                      className="group relative"
                    >
                      <div className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity p-1 z-10">
                        <GripVertical className="w-4 h-4 text-neutral-theme" />
                      </div>
                      <div className="pl-6">
                        <RecipeInstanceCard
                          day={day}
                          recipe={recipe}
                          recipeIndex={recipeIndex}
                          updateRecipe={updateRecipe}
                          removeRecipe={removeRecipe}
                          addIngredient={addIngredient}
                          updateIngredient={updateIngredient}
                          removeIngredient={removeIngredient}
                          handleIngredientKeyDown={handleIngredientKeyDown}
                          addDirection={addDirection}
                          updateDirection={updateDirection}
                          removeDirection={removeDirection}
                          onCook={onCook}
                          onSaveToRecipeBook={async (r) => {
                            const newId = await saveToRecipeBook(r);
                            if (newId) {
                              updateRecipe(day, recipeIndex, { recipeId: newId });
                            }
                          }}
                          savedRecipe={recipe.recipeId ? bookRecipes.find(r => r.id === recipe.recipeId) : null}
                          pantryNames={pantryNames}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {recipes.length > 0 && (
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-border-theme/50">
                    <button
                      onClick={() => addRecipeToDay(day)}
                      className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-xs font-bold hover:bg-primary hover:text-background-theme transition-all flex items-center justify-center gap-2"
                    >
                      <Plus className="w-3 h-3" /> New Recipe
                    </button>
                    <button
                      onClick={() => onOpenRecipeBook(day)}
                      className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-xs font-bold hover:bg-primary hover:text-background-theme transition-all flex items-center justify-center gap-2"
                    >
                      <BookPlus className="w-3 h-3" /> From Book
                    </button>
                    <button
                      onClick={() => onImportRecipe(day)}
                      className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-xs font-bold hover:bg-primary hover:text-background-theme transition-all flex items-center justify-center gap-2"
                    >
                      <Import className="w-3 h-3" /> Import
                    </button>
                    <button
                      onClick={() => setIsEnteringRestaurant(true)}
                      className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-xs font-bold hover:bg-primary hover:text-background-theme transition-all flex items-center justify-center gap-2"
                    >
                      <Utensils className="w-3 h-3" /> Eat Out
                    </button>
                    <button
                      onClick={() => applyRecipeToDay({ name: "Leftovers", ingredients: [], directions: [], rating: 0 }, day)}
                      className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-xs font-bold hover:bg-primary hover:text-background-theme transition-all flex items-center justify-center gap-2"
                    >
                      <History className="w-3 h-3" /> Leftovers
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};