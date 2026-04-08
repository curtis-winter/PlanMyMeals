import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronRight, Plus, Trash2, CheckCircle2, Circle, Package, Play, BookMarked } from 'lucide-react';
import { DayOfWeek, RecipeInstance, Ingredient, PantryItem, Recipe } from '../types';
import { Modal } from './ui/Modal';

interface RecipeInstanceCardProps {
  day: DayOfWeek;
  recipe: RecipeInstance;
  recipeIndex: number;
  updateRecipe: (day: DayOfWeek, index: number, updates: Partial<RecipeInstance>) => void;
  removeRecipe: (day: DayOfWeek, index: number) => void;
  addIngredient: (day: DayOfWeek, recipeIndex: number) => void;
  updateIngredient: (day: DayOfWeek, recipeIndex: number, id: string, updates: Partial<Ingredient>) => void;
  removeIngredient: (day: DayOfWeek, recipeIndex: number, id: string) => void;
  handleIngredientKeyDown: (e: React.KeyboardEvent, day: DayOfWeek, recipeIndex: number, id: string, type: 'amount' | 'name') => void;
  addDirection: (day: DayOfWeek, recipeIndex: number) => void;
  updateDirection: (day: DayOfWeek, recipeIndex: number, dirIndex: number, value: string) => void;
  removeDirection: (day: DayOfWeek, recipeIndex: number, dirIndex: number, value: string) => void;
  onCook: (recipe: Recipe) => void;
  onSaveToRecipeBook?: (recipe: Recipe) => void;
  pantryNames: Set<string>;
  isDraggable?: boolean;
}

const IngredientRow: React.FC<{
  day: DayOfWeek;
  recipeIndex: number;
  ing: Ingredient;
  isInPantry: boolean;
  updateIngredient: (day: DayOfWeek, recipeIndex: number, id: string, updates: Partial<Ingredient>) => void;
  removeIngredient: (day: DayOfWeek, recipeIndex: number, id: string) => void;
  handleIngredientKeyDown: (e: React.KeyboardEvent, day: DayOfWeek, recipeIndex: number, id: string, type: 'amount' | 'name') => void;
}> = ({ day, recipeIndex, ing, isInPantry, updateIngredient, removeIngredient, handleIngredientKeyDown }) => {
  const isAvailable = ing.isAvailable || isInPantry;
  return (
    <div className="flex items-center gap-3 group ingredient-row">
      <button
        onClick={() => updateIngredient(day, recipeIndex, ing.id, { isAvailable: !ing.isAvailable })}
        className={`shrink-0 transition-colors ${isAvailable ? 'text-green-500' : 'text-neutral-theme hover:text-primary'}`}
        title={isInPantry ? "Available in Pantry" : isAvailable ? "Available" : "Shopping Required"}
      >
        {isAvailable ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
      </button>
      <input
        type="text"
        value={ing.amount || ''}
        data-type="amount"
        onChange={(e) => updateIngredient(day, recipeIndex, ing.id, { amount: e.target.value })}
        onKeyDown={(e) => handleIngredientKeyDown(e, day, recipeIndex, ing.id, 'amount')}
        placeholder="Amt"
        className={`w-16 bg-background-theme border-none focus:ring-0 px-2 py-1 rounded text-sm ${isAvailable ? 'text-neutral-theme/50 line-through' : 'text-primary'}`}
      />
      <div className="flex-1 flex items-center gap-2">
        <input
          type="text"
          value={ing.name || ''}
          data-type="name"
          onChange={(e) => updateIngredient(day, recipeIndex, ing.id, { name: e.target.value })}
          onKeyDown={(e) => handleIngredientKeyDown(e, day, recipeIndex, ing.id, 'name')}
          placeholder="Ingredient name..."
          className={`flex-1 bg-transparent border-none focus:ring-0 p-0 text-sm ${isAvailable ? 'text-neutral-theme/50 line-through' : 'text-primary'}`}
        />
        {isInPantry && (
          <Package className="w-3 h-3 text-primary/50" title="In Pantry" />
        )}
      </div>
      <button
        onClick={() => removeIngredient(day, recipeIndex, ing.id)}
        className="opacity-0 group-hover:opacity-100 p-1 text-neutral-theme hover:text-red-500 transition-all"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

const DirectionStep: React.FC<{
  day: DayOfWeek;
  recipeIndex: number;
  step: string;
  stepIndex: number;
  updateDirection: (day: DayOfWeek, recipeIndex: number, dirIndex: number, value: string) => void;
  removeDirection: (day: DayOfWeek, recipeIndex: number, dirIndex: number) => void;
}> = ({ day, recipeIndex, step, stepIndex, updateDirection, removeDirection }) => (
  <div className="space-y-2 group">
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-bold text-neutral-theme uppercase tracking-widest">Step {stepIndex + 1}</span>
      <button
        onClick={() => removeDirection(day, recipeIndex, stepIndex)}
        className="opacity-0 group-hover:opacity-100 p-1 text-neutral-theme hover:text-red-500 transition-all"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
    <textarea
      value={step}
      onChange={(e) => updateDirection(day, recipeIndex, stepIndex, e.target.value)}
      placeholder="Describe this step..."
      className="w-full px-4 py-3 rounded-xl bg-background-theme border-transparent focus:bg-surface focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all outline-none text-sm resize-none text-primary"
      rows={2}
    />
  </div>
);

export const RecipeInstanceCard: React.FC<RecipeInstanceCardProps> = ({
  day,
  recipe,
  recipeIndex,
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
  onSaveToRecipeBook,
  pantryNames,
  isDraggable
}) => {
  const isSpecialEntry = recipe.name === "Leftovers" || recipe.name?.startsWith("Eat Out:");

  return (
    <div className="border border-border-theme rounded-2xl overflow-hidden bg-background-theme/30">
       <div className="flex items-center justify-between p-3 bg-surface border-b border-border-theme">
         <div className="flex items-center gap-3 flex-1">
           <div className="flex items-center gap-2">
             {isDraggable && (
               <div className="w-4 h-4 flex items-center justify-center bg-primary/20 rounded-full">
                 <ChevronDown className="w-3 h-3 text-primary/50" />
               </div>
             )}
             {!isSpecialEntry && (
               <button
                 onClick={() => updateRecipe(day, recipeIndex, { isExpanded: !recipe.isExpanded })}
                 className="p-1 hover:bg-background-theme rounded transition-colors"
               >
                 {recipe.isExpanded ? <ChevronDown className="w-4 h-4 text-neutral-theme" /> : <ChevronRight className="w-4 h-4 text-neutral-theme" />}
               </button>
             )}
           </div>
           <input
             type="text"
             value={recipe.name || ''}
             onChange={(e) => updateRecipe(day, recipeIndex, { name: e.target.value })}
             placeholder="Recipe name..."
             className="flex-1 bg-transparent border-none focus:ring-0 p-0 font-semibold text-primary placeholder:text-neutral-theme/30"
           />
           {recipe.yield && (
             <span className="text-[10px] font-bold text-neutral-theme/50 uppercase tracking-widest bg-background-theme/50 px-2 py-1 rounded-lg">
               Yield: {recipe.yield}
             </span>
           )}
         </div>
<div className="flex items-center gap-1">
            {!isSpecialEntry && onSaveToRecipeBook && (
              <button
                onClick={() => onSaveToRecipeBook(recipe as Recipe)}
                className="p-2 text-accent-theme hover:bg-accent-theme/10 rounded-lg transition-all"
                title="Save to Recipe Book"
              >
                <BookMarked className="w-4 h-4" />
              </button>
            )}
            {!isSpecialEntry && (
              <button
                onClick={() => onCook(recipe as Recipe)}
                className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-all"
                title="Cook This"
              >
                <Play className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => removeRecipe(day, recipeIndex)}
              className="p-2 text-neutral-theme hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
       </div>

      <AnimatePresence>
        {recipe.isExpanded && !isSpecialEntry && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="p-4 space-y-6"
          >
            {/* Ingredients Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => updateRecipe(day, recipeIndex, { isIngredientsExpanded: !recipe.isIngredientsExpanded })}
                  className="flex items-center gap-2 group"
                >
                  {recipe.isIngredientsExpanded ? <ChevronDown className="w-3 h-3 text-neutral-theme" /> : <ChevronRight className="w-3 h-3 text-neutral-theme" />}
                  <label className="block text-xs font-bold text-neutral-theme uppercase tracking-wider cursor-pointer group-hover:text-primary transition-colors">
                    Ingredients
                  </label>
                </button>
                {recipe.isIngredientsExpanded && (
                  <button
                    onClick={() => addIngredient(day, recipeIndex)}
                    className="text-primary text-xs font-bold flex items-center gap-1 hover:text-secondary transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Add Item
                  </button>
                )}
              </div>

              {recipe.isIngredientsExpanded && (
                <div className="space-y-2" data-day={day} data-recipe={recipeIndex}>
                  {recipe.ingredients.length === 0 && (
                    <p className="text-sm text-neutral-theme italic py-2">No ingredients added yet.</p>
                  )}
                  {recipe.ingredients.map((ing) => (
                    <IngredientRow
                      key={ing.id}
                      day={day}
                      recipeIndex={recipeIndex}
                      ing={ing}
                      isInPantry={pantryNames.has(ing.name.toLowerCase().trim())}
                      updateIngredient={updateIngredient}
                      removeIngredient={removeIngredient}
                      handleIngredientKeyDown={handleIngredientKeyDown}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Directions Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => updateRecipe(day, recipeIndex, { isDirectionsExpanded: !recipe.isDirectionsExpanded })}
                  className="flex items-center gap-2 group"
                >
                  {recipe.isDirectionsExpanded ? <ChevronDown className="w-3 h-3 text-neutral-theme" /> : <ChevronRight className="w-3 h-3 text-neutral-theme" />}
                  <label className="block text-xs font-bold text-neutral-theme uppercase tracking-wider cursor-pointer group-hover:text-primary transition-colors">
                    Directions
                  </label>
                </button>
                {recipe.isDirectionsExpanded && (
                  <button
                    onClick={() => addDirection(day, recipeIndex)}
                    className="text-primary text-xs font-bold flex items-center gap-1 hover:text-secondary transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Add Step
                  </button>
                )}
              </div>

              {recipe.isDirectionsExpanded && (
                <div className="space-y-4">
                  {recipe.directions.length === 0 && (
                    <p className="text-sm text-neutral-theme italic py-2">No steps added yet.</p>
                  )}
                  {recipe.directions.map((step, stepIndex) => (
                    <DirectionStep
                      key={stepIndex}
                      day={day}
                      recipeIndex={recipeIndex}
                      step={step}
                      stepIndex={stepIndex}
                      updateDirection={updateDirection}
                      removeDirection={removeDirection}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
