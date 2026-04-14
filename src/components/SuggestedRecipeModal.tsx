import React, { useState, useEffect } from 'react';
import { Icons } from '../utils/icons';
import { Recipe, DayOfWeek } from '../types';
import { Modal } from './ui/Modal';

interface SuggestedRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestedRecipes: Recipe[];
  saveToRecipeBook: (recipe: Recipe) => void;
  applyRecipeToDay: (recipe: Recipe, day: DayOfWeek) => void;
  orderedDays: DayOfWeek[];
}

export const SuggestedRecipeModal: React.FC<SuggestedRecipeModalProps> = ({
  isOpen,
  onClose,
  suggestedRecipes,
  saveToRecipeBook,
  applyRecipeToDay,
  orderedDays
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recipeTags, setRecipeTags] = useState<Record<number, string[]>>({});
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      const initialTags: Record<number, string[]> = {};
      suggestedRecipes.forEach((r, idx) => {
        initialTags[idx] = r.tags || [];
      });
      setRecipeTags(initialTags);
      setNewTag('');
    }
  }, [isOpen, suggestedRecipes]);

  const currentRecipe = suggestedRecipes[currentIndex];
  const currentTags = recipeTags[currentIndex] || [];

  const addTag = () => {
    if (newTag && !currentTags.includes(newTag)) {
      setRecipeTags(prev => ({
        ...prev,
        [currentIndex]: [...currentTags, newTag]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setRecipeTags(prev => ({
      ...prev,
      [currentIndex]: currentTags.filter(tag => tag !== tagToRemove)
    }));
  };

  if (!currentRecipe) return null;

  const getRecipeWithTags = () => ({
    ...currentRecipe,
    tags: currentTags
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Suggested Recipe"
      maxWidth="max-w-2xl"
       icon={<Icons.Sparkles className="text-background-theme w-5 h-5" />}
headerActions={
        suggestedRecipes.length > 1 && (
          <div className="flex items-center gap-3 mr-4">
            <span className="text-xs font-medium text-neutral-theme">
              {currentIndex + 1} / {suggestedRecipes.length}
            </span>
            <div className="flex items-center gap-1 bg-background-theme rounded-lg p-1">
              <button
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="p-1 hover:bg-surface rounded-md disabled:opacity-30 transition-colors"
              >
                <Icons.ChevronLeft className="w-5 h-5 text-primary" />
              </button>
              <button
                onClick={() => setCurrentIndex(prev => Math.min(suggestedRecipes.length - 1, prev + 1))}
                disabled={currentIndex === suggestedRecipes.length - 1}
                className="p-1 hover:bg-surface rounded-md disabled:opacity-30 transition-colors"
              >
                <Icons.ChevronRight className="w-5 h-5 text-primary" />
              </button>
            </div>
          </div>
        )
      }
footer={
          <div className="flex gap-3">
            <div className="flex-1 relative group">
              <button
                className="w-full bg-surface border border-border-theme text-primary py-4 rounded-2xl font-bold hover:bg-background-theme transition-all flex items-center justify-center gap-2"
              >
                <Icons.BookPlus className="w-5 h-5" />
                Save to Book
                {suggestedRecipes.length > 1 && <Icons.ChevronDown className="w-4 h-4" />}
              </button>
              <div className="absolute bottom-full left-0 w-full mb-2 bg-surface rounded-2xl shadow-xl border border-border-theme overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <button
                  onClick={() => {
                    saveToRecipeBook(getRecipeWithTags());
                  }}
                  className="w-full px-4 py-3 text-left text-sm font-medium text-text-theme hover:bg-background-theme hover:text-primary transition-colors"
                >
                  Save Current Recipe
                </button>
                {suggestedRecipes.length > 1 && (
                  <button
                    onClick={() => {
                      suggestedRecipes.forEach((recipe, idx) => {
                        const tags = recipeTags[idx] || recipe.tags || [];
                        saveToRecipeBook({ ...recipe, tags });
                      });
                      onClose();
                    }}
                    className="w-full px-4 py-3 text-left text-sm font-medium text-text-theme hover:bg-background-theme hover:text-primary transition-colors"
                  >
                    Save All ({suggestedRecipes.length})
                  </button>
                )}
              </div>
            </div>
            <div className="flex-1 relative group">
              <button
                className="w-full bg-primary text-background-theme py-4 rounded-2xl font-bold hover:bg-secondary hover:text-primary transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
              >
                Add to Day
                <Icons.ChevronDown className="w-4 h-4" />
              </button>
              <div className="absolute bottom-full left-0 w-full mb-2 bg-surface rounded-2xl shadow-xl border border-border-theme overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                {orderedDays.map(day => (
                  <button
                    key={day}
                    onClick={() => {
                      applyRecipeToDay(getRecipeWithTags(), day);
                      if (suggestedRecipes.length === 1) onClose();
                    }}
                    className="w-full px-4 py-3 text-left text-sm font-medium text-text-theme hover:bg-background-theme hover:text-primary transition-colors"
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          </div>
       }
     >
       <div className="p-6 bg-background-theme/30">
         <div className="bg-surface p-6 rounded-2xl border border-border-theme shadow-sm space-y-6">
           <div>
             <h4 className="text-2xl font-bold text-primary mb-2">{currentRecipe.name}</h4>
             <div className="flex gap-4 text-sm text-neutral-theme">
               <span>{currentRecipe.ingredients.length} ingredients</span>
               <span>{currentRecipe.directions.length} steps</span>
             </div>
           </div>
           <div className="space-y-4">
             <h5 className="font-bold text-primary uppercase text-xs tracking-wider">Tags</h5>
             <div className="flex flex-wrap gap-2">
               {currentTags.map(tag => (
                 <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-bold">
                   <Icons.Tag className="w-3 h-3" />
                   {tag}
                   <button onClick={() => removeTag(tag)} className="hover:text-secondary">
                     <Icons.X className="w-3 h-3" />
                   </button>
                 </span>
               ))}
             </div>
             <div className="flex gap-2">
               <input
                 type="text"
                 value={newTag}
                 onChange={(e) => setNewTag(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                 placeholder="Add a tag..."
                 className="flex-1 px-3 py-1.5 rounded-xl bg-background-theme border-transparent focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all outline-none text-xs text-primary"
               />
               <button
                 onClick={addTag}
                 className="px-3 py-1.5 bg-primary/10 text-primary rounded-xl text-[10px] font-bold hover:bg-primary/20 transition-all"
               >
                 Add
               </button>
             </div>
           </div>
           <div className="space-y-4">
             <h5 className="font-bold text-primary uppercase text-xs tracking-wider">Ingredients</h5>
             <ul className="space-y-2">
               {currentRecipe.ingredients.map((ing, idx) => (
                 <li key={idx} className="flex items-center gap-2 text-sm text-text-theme">
                   <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                   <span className="font-medium">{ing.amount}</span> {ing.name}
                 </li>
               ))}
             </ul>
           </div>
           <div className="space-y-4">
             <h5 className="font-bold text-primary uppercase text-xs tracking-wider">Directions</h5>
             <ol className="space-y-4">
               {currentRecipe.directions.map((step, idx) => (
                 <li key={idx} className="flex gap-4 text-sm text-text-theme">
                   <span className="font-bold text-primary shrink-0">Step {idx + 1}</span>
                   <span>{step}</span>
                 </li>
               ))}
             </ol>
           </div>
         </div>
       </div>
     </Modal>
   );
 };
