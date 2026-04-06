import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Circle, ChevronRight, ChevronLeft, Check, Utensils, Play } from 'lucide-react';
import { Recipe, PantryItem } from '../types';
import { Modal } from './ui/Modal';

interface CookRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: Recipe;
  pantryItems: PantryItem[];
  onUseIngredient: (ingredientName: string) => void;
}

export const CookRecipeModal: React.FC<CookRecipeModalProps> = ({
  isOpen,
  onClose,
  recipe,
  pantryItems,
  onUseIngredient
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [usedIngredients, setUsedIngredients] = useState<Record<string, boolean>>({});

  const toggleIngredient = (name: string) => {
    const isUsed = !usedIngredients[name];
    setUsedIngredients(prev => ({ ...prev, [name]: isUsed }));
    if (isUsed) {
      onUseIngredient(name);
    }
  };

  const nextStep = () => {
    if (currentStep < recipe.directions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = ((currentStep + 1) / recipe.directions.length) * 100;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Cooking: ${recipe.name}`}
      fullScreen={true}
      icon={<Utensils className="text-background-theme w-5 h-5" />}
      headerActions={
        <div className="hidden sm:block">
          <p className="text-xs text-neutral-theme font-medium">Step {currentStep + 1} of {recipe.directions.length}</p>
        </div>
      }
      footer={
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-6 py-4 rounded-2xl font-bold text-primary hover:bg-background-theme transition-all disabled:opacity-30"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          <div className="flex items-center gap-2">
            {recipe.directions.length > 1 && (
              <div className="hidden sm:flex gap-1 mr-4">
                {recipe.directions.map((_, idx) => (
                  <div 
                    key={idx}
                    className={`w-2 h-2 rounded-full transition-all ${idx === currentStep ? 'w-6 bg-primary' : 'bg-border-theme'}`}
                  />
                ))}
              </div>
            )}
            
            {currentStep === recipe.directions.length - 1 ? (
              <button
                onClick={onClose}
                className="flex items-center gap-2 px-10 py-4 rounded-2xl font-bold bg-green-500 text-white hover:bg-green-600 transition-all shadow-lg shadow-green-500/20"
              >
                <Check className="w-5 h-5" />
                Finish Cooking
              </button>
            ) : (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-10 py-4 rounded-2xl font-bold bg-primary text-background-theme hover:bg-secondary hover:text-primary transition-all shadow-lg shadow-primary/20"
              >
                Next Step
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      }
    >
      <div className="flex flex-col h-full">
        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-border-theme sticky top-0 z-10">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-primary"
          />
        </div>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left Side: Ingredients Checklist */}
          <div className="w-full lg:w-80 border-r border-border-theme bg-surface/50 overflow-y-auto p-6 space-y-6">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-neutral-theme uppercase tracking-widest">Ingredients Checklist</h3>
              <div className="space-y-2">
                {recipe.ingredients.map((ing, idx) => {
                  const isInPantry = pantryItems.some(p => p.name.toLowerCase() === ing.name.toLowerCase());
                  const isUsed = usedIngredients[ing.name];
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => toggleIngredient(ing.name)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                        isUsed 
                          ? 'bg-green-500/10 border-green-500/30 text-green-700' 
                          : 'bg-background-theme border-transparent hover:border-primary/20'
                      }`}
                    >
                      <div className={`shrink-0 ${isUsed ? 'text-green-500' : 'text-neutral-theme'}`}>
                        {isUsed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold truncate ${isUsed ? 'line-through opacity-50' : 'text-primary'}`}>
                          {ing.name}
                        </p>
                        <p className="text-[10px] text-neutral-theme font-medium">{ing.amount}</p>
                      </div>
                      {isInPantry && !isUsed && (
                        <div className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[8px] font-bold uppercase tracking-tighter">
                          In Pantry
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
              <p className="text-[10px] text-primary font-medium leading-relaxed">
                <span className="font-bold">Tip:</span> Checking off an ingredient that's in your pantry will automatically remove it for you.
              </p>
            </div>
          </div>

          {/* Right Side: Step Content */}
          <div className="flex-1 overflow-y-auto p-6 lg:p-12 flex flex-col items-center justify-center text-center bg-background-theme/20">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-2xl w-full space-y-8"
              >
                <div className="space-y-4">
                  <span className="inline-block px-4 py-1.5 rounded-full bg-primary text-background-theme text-sm font-bold shadow-lg shadow-primary/20">
                    Step {currentStep + 1}
                  </span>
                  <h3 className="text-2xl sm:text-4xl font-bold text-primary leading-tight">
                    {recipe.directions[currentStep]}
                  </h3>
                </div>

                {/* Visual Aid Placeholder */}
                <div className="aspect-video w-full bg-surface rounded-3xl border-2 border-dashed border-border-theme flex items-center justify-center group overflow-hidden relative">
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="text-center space-y-2 relative z-10">
                    <Play className="w-12 h-12 text-neutral-theme/20 mx-auto group-hover:text-primary/40 transition-colors" />
                    <p className="text-xs text-neutral-theme font-medium">Visual guide coming soon</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Modal>
  );
};
