import React from 'react';
import { Sparkles } from 'lucide-react';
import { Modal } from './ui/Modal';

interface AIContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  pantryContext: string;
  setPantryContext: (context: string) => void;
  dietaryOptions: string[];
  setDietaryOptions: (options: string[]) => void;
  recipeCount: number;
  setRecipeCount: (count: number) => void;
  useDifferentProteins: boolean;
  setUseDifferentProteins: (use: boolean) => void;
  useUniqueRecipes: boolean;
  setUseUniqueRecipes: (use: boolean) => void;
  suggestOptions: string;
  onConfirm: () => void;
  isSuggestingRecipe: boolean;
}

export const AIContextModal: React.FC<AIContextModalProps> = ({
  isOpen,
  onClose,
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
  suggestOptions,
  onConfirm,
  isSuggestingRecipe
}) => {
  const options = suggestOptions.split(',').map(s => s.trim()).filter(Boolean);
  const activeOptions = dietaryOptions.filter(o => options.includes(o));

  const toggleOption = (option: string) => {
    if (activeOptions.includes(option)) {
      setDietaryOptions(activeOptions.filter(o => o !== option));
    } else {
      setDietaryOptions([...activeOptions, option]);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Suggest a Recipe"
      maxWidth="max-w-md"
      icon={<Sparkles className="text-background-theme w-5 h-5" />}
    >
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <label className="block text-xs font-bold text-neutral-theme uppercase tracking-wider">Additional Instructions</label>
          <textarea
            value={pantryContext}
            onChange={(e) => setPantryContext(e.target.value)}
            placeholder="e.g., no stir fry, use slow cooker, under 30 mins..."
            className="w-full h-32 px-4 py-3 rounded-xl bg-background-theme border-transparent focus:bg-surface focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all outline-none resize-none text-sm text-primary"
          />
        </div>

        {options.length > 0 && (
          <div className="space-y-3">
            <label className="block text-xs font-bold text-neutral-theme uppercase tracking-wider">Dietary Preferences</label>
            <div className="grid grid-cols-2 gap-2">
              {options.map(option => (
                <button
                  key={option}
                  onClick={() => toggleOption(option)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-sm font-medium ${
                    activeOptions.includes(option)
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-background-theme border-transparent text-neutral-theme hover:bg-surface'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                    activeOptions.includes(option) ? 'border-primary bg-primary' : 'border-neutral-theme'
                  }`}>
                    {activeOptions.includes(option) && <div className="w-1.5 h-1.5 bg-background-theme rounded-full" />}
                  </div>
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4 pt-2 border-t border-border-theme">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-neutral-theme uppercase tracking-wider">Number of Recipes</label>
            <div className="flex items-center gap-3 bg-background-theme rounded-xl p-1">
              <button 
                onClick={() => setRecipeCount(Math.max(1, recipeCount - 1))}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface text-primary font-bold"
              >
                -
              </button>
              <span className="w-8 text-center font-bold text-primary">{recipeCount}</span>
              <button 
                onClick={() => setRecipeCount(Math.min(5, recipeCount + 1))}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface text-primary font-bold"
              >
                +
              </button>
            </div>
          </div>

          {recipeCount > 1 && (
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-theme uppercase tracking-wider">Use Different Proteins</label>
              <button
                onClick={() => setUseDifferentProteins(!useDifferentProteins)}
                className={`w-12 h-6 rounded-full transition-all relative ${useDifferentProteins ? 'bg-primary' : 'bg-neutral-theme/20'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-background-theme transition-all ${useDifferentProteins ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-neutral-theme uppercase tracking-wider">Unique Recipes Only</label>
            <button
              onClick={() => setUseUniqueRecipes(!useUniqueRecipes)}
              className={`w-12 h-6 rounded-full transition-all relative ${useUniqueRecipes ? 'bg-primary' : 'bg-neutral-theme/20'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-background-theme transition-all ${useUniqueRecipes ? 'right-1' : 'left-1'}`} />
            </button>
          </div>
        </div>

        <button
          onClick={onConfirm}
          disabled={isSuggestingRecipe}
          className="w-full py-4 bg-primary text-background-theme rounded-2xl font-bold hover:bg-secondary hover:text-primary transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
        >
          {isSuggestingRecipe ? 'Generating Suggestion...' : 'Generate Recipe'}
        </button>
      </div>
    </Modal>
  );
};
