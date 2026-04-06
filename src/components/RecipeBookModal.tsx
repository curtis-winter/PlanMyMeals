import React from 'react';
import { BookOpen, Search, Star, Upload, Plus, Play, ChevronDown } from 'lucide-react';
import { Recipe, DayOfWeek, PantryItem } from '../types';
import { Modal } from './ui/Modal';

interface RecipeBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipeSearch: string;
  setRecipeSearch: (search: string) => void;
  filteredRecipes: Recipe[];
  updateRecipeRating: (recipe: Recipe, rating: number) => void;
  applyRecipeToDay: (recipe: Recipe, day: DayOfWeek) => void;
  expandedDay: DayOfWeek | null;
  pantryItems: PantryItem[];
  onOpenImport: () => void;
  onOpenNewRecipe: () => void;
  onEditRecipe: (recipe: Recipe) => void;
  onCook: (recipe: Recipe) => void;
  orderedDays: DayOfWeek[];
}

export const RecipeBookModal: React.FC<RecipeBookModalProps> = ({
  isOpen,
  onClose,
  recipeSearch,
  setRecipeSearch,
  filteredRecipes,
  updateRecipeRating,
  applyRecipeToDay,
  expandedDay,
  pantryItems,
  onOpenImport,
  onOpenNewRecipe,
  onEditRecipe,
  onCook,
  orderedDays
}) => {
  const pantryNames = React.useMemo(() => 
    new Set(pantryItems.map(item => item.name.toLowerCase().trim())),
    [pantryItems]
  );

  const recipesWithAvailability = React.useMemo(() => {
    return filteredRecipes.map(recipe => {
      const totalIngredients = recipe.ingredients.length;
      if (totalIngredients === 0) return { ...recipe, availability: 100 };
      
      const availableCount = recipe.ingredients.filter(ing => 
        pantryNames.has(ing.name.toLowerCase().trim())
      ).length;
      
      const availability = Math.round((availableCount / totalIngredients) * 100);
      return { ...recipe, availability };
    }).sort((a, b) => b.availability - a.availability);
  }, [filteredRecipes, pantryNames]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Recipe Book"
      maxWidth="max-w-2xl"
      icon={<BookOpen className="text-background-theme w-5 h-5" />}
    >
      <div className="flex flex-col h-full">
        <div className="p-6 border-b border-border-theme bg-surface space-y-4 sticky top-0 z-10">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-theme w-5 h-5" />
            <input
              type="text"
              placeholder="Search recipes..."
              value={recipeSearch}
              onChange={(e) => setRecipeSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-background-theme border-transparent focus:bg-surface focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all outline-none text-primary"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={onOpenNewRecipe}
              className="flex-1 py-3 bg-primary text-background-theme rounded-2xl font-bold hover:bg-secondary hover:text-primary transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Recipe
            </button>
            <button
              onClick={onOpenImport}
              className="flex-1 py-3 bg-surface text-primary border-2 border-primary/20 rounded-2xl font-bold hover:bg-background-theme hover:border-primary transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Import Recipe
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 bg-background-theme/30">
          {recipesWithAvailability.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-neutral-theme">No recipes found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recipesWithAvailability.map((recipe) => (
                <div 
                  key={recipe.id} 
                  onClick={() => onEditRecipe(recipe)}
                  className="bg-surface p-4 rounded-2xl border border-border-theme shadow-sm hover:shadow-md transition-all group relative overflow-hidden cursor-pointer hover:border-primary/50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-primary pr-8 group-hover:text-secondary transition-colors">{recipe.name}</h4>
                    <div className="flex gap-0.5" onClick={(e) => e.stopPropagation()}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => updateRecipeRating(recipe, star)}
                          className={`transition-colors ${star <= recipe.rating ? 'text-accent-theme' : 'text-neutral-theme/20 hover:text-accent-theme/50'}`}
                        >
                          <Star className="w-4 h-4 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>
                  {recipe.tags && recipe.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {recipe.tags.map(tag => (
                        <span key={tag} className="px-1.5 py-0.5 rounded-md bg-primary/5 text-primary text-[8px] font-bold uppercase tracking-wider border border-primary/10">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex-1 h-1.5 bg-background-theme rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          recipe.availability === 100 ? 'bg-green-500' : 
                          recipe.availability > 50 ? 'bg-primary' : 'bg-neutral-theme/30'
                        }`}
                        style={{ width: `${recipe.availability}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-neutral-theme">{recipe.availability}% available</span>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-xs text-neutral-theme">
                      {recipe.ingredients.length} ingredients • {recipe.directions?.length || 0} steps
                    </p>
                    <div className="flex items-center gap-2">
                      {expandedDay ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            applyRecipeToDay(recipe, expandedDay);
                            onClose();
                          }}
                          className="px-3 py-2 bg-primary text-background-theme rounded-xl text-[10px] font-bold hover:bg-secondary hover:text-primary transition-all shadow-sm"
                        >
                          Add to {expandedDay}
                        </button>
                      ) : (
                        <div className="relative group/add">
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-background-theme transition-all flex items-center gap-1 text-[10px] font-bold"
                          >
                            Add to Day
                            <ChevronDown className="w-3 h-3" />
                          </button>
                          <div className="absolute bottom-full right-0 mb-2 w-32 bg-surface rounded-xl shadow-xl border border-border-theme overflow-hidden opacity-0 invisible group-hover/add:opacity-100 group-hover/add:visible transition-all z-20">
                            {orderedDays.map(day => (
                              <button
                                key={day}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  applyRecipeToDay(recipe, day);
                                  onClose();
                                }}
                                className="w-full px-3 py-2 text-left text-[10px] font-bold text-text-theme hover:bg-background-theme hover:text-primary transition-colors"
                              >
                                {day}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onCook(recipe);
                        }}
                        className="p-2 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-background-theme transition-all"
                        title="Cook This"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
