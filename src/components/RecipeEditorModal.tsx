import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Trash2, CheckCircle2, Circle, Save, UtensilsCrossed, Play, Sparkles, Check, RotateCcw, Tag as TagIcon } from 'lucide-react';
import { Recipe, Ingredient } from '../types';
import { generateId } from '../utils/id';
import { Modal } from './ui/Modal';

interface RecipeEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (recipe: Partial<Recipe>) => void;
  onDelete?: (id: number) => void;
  onCook?: (recipe: Recipe) => void;
  initialRecipe?: Partial<Recipe>;
  onIngredientToggle?: (name: string, isAvailable: boolean) => void;
  onAIPreview?: (recipe: Partial<Recipe>, instructions?: string) => Promise<Recipe | null>;
  isAIProcessing?: boolean;
  allTags?: string[];
  existingRecipes?: Recipe[];
}

export const RecipeEditorModal: React.FC<RecipeEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  onCook,
  initialRecipe,
  onIngredientToggle,
  onAIPreview,
  isAIProcessing,
  allTags = [],
  existingRecipes = []
}) => {
  const [name, setName] = useState('');
  const [yieldAmount, setYieldAmount] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [directions, setDirections] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCleanupInstructionsModal, setShowCleanupInstructionsModal] = useState(false);
  const [cleanupInstructions, setCleanupInstructions] = useState('');
  const [previewRecipe, setPreviewRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName(initialRecipe?.name || '');
      setYieldAmount(initialRecipe?.yield || '');
      setIngredients(initialRecipe?.ingredients || []);
      setDirections(initialRecipe?.directions || []);
      setTags(initialRecipe?.tags || []);
      setNewTag('');
      setCleanupInstructions('');
      setShowDeleteConfirm(false);
      setPreviewRecipe(null);
    }
  }, [isOpen, initialRecipe]);

  const addIngredient = () => {
    setIngredients([...ingredients, { id: generateId(), name: '', amount: '', isAvailable: false }]);
  };

  const updateIngredient = (id: string, updates: Partial<Ingredient>) => {
    setIngredients(ingredients.map(ing => {
      if (ing.id === id) {
        const updated = { ...ing, ...updates };
        if (updates.isAvailable !== undefined && updated.name && onIngredientToggle) {
          onIngredientToggle(updated.name, updates.isAvailable);
        }
        return updated;
      }
      return ing;
    }));
  };

  const removeIngredient = (id: string) => {
    setIngredients(ingredients.filter(ing => ing.id !== id));
  };

  const addDirection = () => {
    setDirections([...directions, '']);
  };

  const updateDirection = (index: number, value: string) => {
    const newDirections = [...directions];
    newDirections[index] = value;
    setDirections(newDirections);
  };

  const removeDirection = (index: number) => {
    setDirections(directions.filter((_, i) => i !== index));
  };

  const handleIngredientKeyDown = (e: React.KeyboardEvent, id: string, type: 'amount' | 'name') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (type === 'amount') {
        const row = e.currentTarget.closest('.ingredient-row');
        const nameInput = row?.querySelector('[data-type="name"]') as HTMLInputElement;
        if (nameInput) nameInput.focus();
      } else {
        addIngredient();
        setTimeout(() => {
          const rows = document.querySelectorAll('.ingredient-row');
          if (rows.length > 0) {
            const lastRow = rows[rows.length - 1];
            const amountInput = lastRow.querySelector('[data-type="amount"]') as HTMLInputElement;
            if (amountInput) amountInput.focus();
          }
        }, 50);
      }
    }
  };

  const handleSave = () => {
    if (!name) return;
    onSave({
      name,
      yield: yieldAmount,
      ingredients,
      directions,
      tags,
      rating: initialRecipe?.rating || 0
    });
    onClose();
  };

  const addTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleDelete = () => {
    if (initialRecipe?.id && onDelete) {
      onDelete(initialRecipe.id);
      onClose();
    }
  };

  const handleAICleanup = () => {
    setShowCleanupInstructionsModal(true);
  };

  const executeAICleanup = async () => {
    if (!onAIPreview) return;
    setShowCleanupInstructionsModal(false);
    const cleaned = await onAIPreview({ name, ingredients, directions }, cleanupInstructions);
    if (cleaned) {
      setPreviewRecipe(cleaned);
    }
  };

  const acceptPreview = () => {
    if (previewRecipe) {
      setName(previewRecipe.name);
      setYieldAmount(previewRecipe.yield || '');
      setIngredients(previewRecipe.ingredients);
      setDirections(previewRecipe.directions);
      setPreviewRecipe(null);
    }
  };

  const rejectPreview = () => {
    setPreviewRecipe(null);
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredTagSuggestions.length > 0) {
        const suggestion = filteredTagSuggestions[0];
        if (!tags.includes(suggestion)) {
          setTags([...tags, suggestion]);
        }
        setNewTag('');
      } else {
        addTag();
      }
    }
  };

  const isAlreadySaved = existingRecipes.some(r => r.name.toLowerCase() === name.toLowerCase() && r.id !== initialRecipe?.id);

  const filteredTagSuggestions = allTags.filter(t => 
    t.toLowerCase().includes(newTag.toLowerCase()) && !tags.includes(t)
  ).slice(0, 5);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={initialRecipe?.id ? 'Edit Recipe' : 'New Recipe'}
        maxWidth="max-w-2xl"
        icon={<UtensilsCrossed className="text-background-theme w-5 h-5" />}
        headerActions={
          onAIPreview && (
            <button
              onClick={handleAICleanup}
              disabled={isAIProcessing || !!previewRecipe}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all text-xs font-bold disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isAIProcessing ? 'animate-pulse' : ''}`} />
              {isAIProcessing ? 'Cleaning...' : 'AI Cleanup'}
            </button>
          )
        }
        footer={
          <div className="flex gap-4">
            {initialRecipe?.id && (
              <div className="flex-1 relative">
                <AnimatePresence>
                  {showDeleteConfirm ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute inset-0 flex items-center gap-2"
                    >
                      <button
                        onClick={handleDelete}
                        className="flex-1 bg-red-500 text-white py-4 rounded-2xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 text-sm"
                      >
                        Confirm Delete
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-4 py-4 bg-surface text-neutral-theme rounded-2xl font-bold hover:bg-background-theme transition-all text-sm"
                      >
                        Cancel
                      </button>
                    </motion.div>
                  ) : (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full bg-red-500/10 text-red-500 py-4 rounded-2xl font-bold hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-5 h-5" />
                      Delete
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            )}
            
            {initialRecipe?.id && onCook && (
              <button
                onClick={() => onCook(initialRecipe as Recipe)}
                className="flex-1 bg-surface border border-border-theme text-primary py-4 rounded-2xl font-bold hover:bg-background-theme transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                Cook This
              </button>
            )}

            <button
              onClick={handleSave}
              disabled={!name || isAlreadySaved}
              className={`${initialRecipe?.id ? 'flex-1' : 'w-full'} bg-primary text-background-theme py-4 rounded-2xl font-bold hover:bg-secondary hover:text-primary transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50`}
            >
              <Save className="w-5 h-5" />
              {isAlreadySaved ? 'Already in Book' : 'Save Recipe'}
            </button>
          </div>
        }
      >
        <div className="p-6 space-y-8 bg-background-theme/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="block text-xs font-bold text-neutral-theme uppercase tracking-wider">Recipe Name</label>
              <input
                type="text"
                value={previewRecipe ? previewRecipe.name : name}
                readOnly={!!previewRecipe}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter recipe name..."
                className={`w-full px-4 py-3 rounded-xl border-transparent focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all outline-none text-lg font-bold ${previewRecipe ? 'bg-primary/5 text-primary' : 'bg-surface text-primary'}`}
              />
            </div>
            <div className="space-y-4">
              <label className="block text-xs font-bold text-neutral-theme uppercase tracking-wider">Expected Yield</label>
              <input
                type="text"
                value={previewRecipe ? (previewRecipe.yield || '') : yieldAmount}
                readOnly={!!previewRecipe}
                onChange={(e) => setYieldAmount(e.target.value)}
                placeholder="e.g. 4 servings"
                className={`w-full px-4 py-3 rounded-xl border-transparent focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all outline-none text-lg font-bold ${previewRecipe ? 'bg-primary/5 text-primary' : 'bg-surface text-primary'}`}
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-xs font-bold text-neutral-theme uppercase tracking-wider">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 text-primary text-xs font-bold">
                  <TagIcon className="w-3 h-3" />
                  {tag}
                  <button onClick={() => removeTag(tag)} className="hover:text-secondary">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="relative">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Add a tag..."
                  className="flex-1 px-4 py-2 rounded-xl bg-surface border-transparent focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all outline-none text-sm text-primary"
                />
                <button
                  onClick={addTag}
                  className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-xs font-bold hover:bg-primary hover:text-background-theme transition-all"
                >
                  Add
                </button>
              </div>
              
              {newTag && filteredTagSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border-theme rounded-xl shadow-xl z-50 overflow-hidden">
                  {filteredTagSuggestions.map(suggestion => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => {
                        setTags([...tags, suggestion]);
                        setNewTag('');
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-background-theme text-primary transition-colors border-b border-border-theme last:border-0"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-neutral-theme uppercase tracking-wider">Ingredients</label>
              {!previewRecipe && (
                <button
                  onClick={addIngredient}
                  className="text-primary text-xs font-bold flex items-center gap-1 hover:text-secondary transition-colors"
                >
                  <Plus className="w-3 h-3" /> Add Item
                </button>
              )}
            </div>
            <div className="space-y-2">
              {(previewRecipe ? previewRecipe.ingredients : ingredients).map((ing) => (
                <div key={ing.id} className={`flex items-center gap-3 group ingredient-row ${previewRecipe ? 'opacity-80' : ''}`}>
                  <button
                    disabled={!!previewRecipe}
                    onClick={() => updateIngredient(ing.id, { isAvailable: !ing.isAvailable })}
                    className={`shrink-0 transition-colors ${ing.isAvailable ? 'text-green-500' : 'text-neutral-theme hover:text-primary'}`}
                  >
                    {ing.isAvailable ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                  </button>
                  <input
                    type="text"
                    value={ing.amount || ''}
                    readOnly={!!previewRecipe}
                    data-type="amount"
                    onChange={(e) => updateIngredient(ing.id, { amount: e.target.value })}
                    onKeyDown={(e) => handleIngredientKeyDown(e, ing.id, 'amount')}
                    placeholder="Amt"
                    className={`w-20 border-none focus:ring-0 px-3 py-2 rounded-xl text-sm ${previewRecipe ? 'bg-primary/5 text-primary' : 'bg-surface text-primary'}`}
                  />
                  <input
                    type="text"
                    value={ing.name || ''}
                    readOnly={!!previewRecipe}
                    data-type="name"
                    onChange={(e) => updateIngredient(ing.id, { name: e.target.value })}
                    onKeyDown={(e) => handleIngredientKeyDown(e, ing.id, 'name')}
                    placeholder="Ingredient name..."
                    className={`flex-1 border-none focus:ring-0 px-3 py-2 rounded-xl text-sm ${previewRecipe ? 'bg-primary/5 text-primary' : 'bg-surface text-primary'}`}
                  />
                  <input
                    type="text"
                    value={ing.preparation || ''}
                    readOnly={!!previewRecipe}
                    data-type="preparation"
                    onChange={(e) => updateIngredient(ing.id, { preparation: e.target.value })}
                    placeholder="prep"
                    className={`w-20 border-none focus:ring-0 px-3 py-2 rounded-xl text-sm italic ${previewRecipe ? 'bg-primary/5 text-primary' : 'bg-surface text-neutral-theme'}`}
                  />
                  {!previewRecipe && (
                    <button
                      onClick={() => removeIngredient(ing.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-neutral-theme hover:text-red-500 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              {(previewRecipe ? previewRecipe.ingredients : ingredients).length === 0 && (
                <p className="text-sm text-neutral-theme italic py-4 text-center bg-surface/50 rounded-2xl border-2 border-dashed border-border-theme">No ingredients added yet.</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-neutral-theme uppercase tracking-wider">Directions</label>
              {!previewRecipe && (
                <button
                  onClick={addDirection}
                  className="text-primary text-xs font-bold flex items-center gap-1 hover:text-secondary transition-colors"
                >
                  <Plus className="w-3 h-3" /> Add Step
                </button>
              )}
            </div>
            <div className="space-y-4">
              {(previewRecipe ? previewRecipe.directions : directions).map((step, idx) => (
                <div key={idx} className="space-y-2 group">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-neutral-theme uppercase tracking-widest">Step {idx + 1}</span>
                    {!previewRecipe && (
                      <button
                        onClick={() => removeDirection(idx)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-neutral-theme hover:text-red-500 transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <textarea
                    value={step}
                    readOnly={!!previewRecipe}
                    onChange={(e) => updateDirection(idx, e.target.value)}
                    placeholder="Describe this step..."
                    className={`w-full px-4 py-3 rounded-xl border-transparent focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all outline-none text-sm resize-none ${previewRecipe ? 'bg-primary/5 text-primary' : 'bg-surface text-primary'}`}
                    rows={2}
                  />
                </div>
              ))}
              {(previewRecipe ? previewRecipe.directions : directions).length === 0 && (
                <p className="text-sm text-neutral-theme italic py-4 text-center bg-surface/50 rounded-2xl border-2 border-dashed border-border-theme">No steps added yet.</p>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* AI Cleanup Instructions Modal */}
      <Modal
        isOpen={showCleanupInstructionsModal}
        onClose={() => setShowCleanupInstructionsModal(false)}
        title="AI Cleanup Instructions"
        maxWidth="max-w-md"
        icon={<Sparkles className="text-background-theme w-5 h-5" />}
        footer={
          <div className="flex gap-3">
            <button
              onClick={() => setShowCleanupInstructionsModal(false)}
              className="flex-1 px-4 py-3 bg-surface border border-border-theme text-primary rounded-xl font-bold hover:bg-background-theme transition-all"
            >
              Cancel
            </button>
            <button
              onClick={executeAICleanup}
              disabled={isAIProcessing}
              className="flex-1 px-4 py-3 bg-primary text-background-theme rounded-xl font-bold hover:bg-secondary hover:text-primary transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
            >
              {isAIProcessing ? 'Processing...' : 'Start Cleanup'}
            </button>
          </div>
        }
      >
        <div className="p-6 space-y-4">
          <p className="text-sm text-text-theme/70 leading-relaxed">
            Add any specific instructions for the AI to follow while cleaning up this recipe (e.g., "Make it spicier", "Simplify the steps", "Convert to metric").
          </p>
          <textarea
            value={cleanupInstructions}
            onChange={(e) => setCleanupInstructions(e.target.value)}
            placeholder="Optional instructions..."
            className="w-full h-32 px-4 py-3 rounded-2xl bg-background-theme border-transparent focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all outline-none text-sm text-primary resize-none"
            autoFocus
          />
        </div>
      </Modal>

      {/* AI Preview Modal */}
      <Modal
        isOpen={!!previewRecipe}
        onClose={rejectPreview}
        title="AI Cleanup Results"
        maxWidth="max-w-lg"
        icon={<Sparkles className="text-background-theme w-5 h-5" />}
        footer={
          <div className="flex gap-3">
            <button
              onClick={acceptPreview}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-background-theme hover:bg-secondary hover:text-primary transition-all font-bold"
            >
              <Check className="w-5 h-5" /> Accept Changes
            </button>
            <button
              onClick={rejectPreview}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-surface text-neutral-theme border border-border-theme hover:bg-background-theme transition-all font-bold"
            >
              <RotateCcw className="w-5 h-5" /> Reject
            </button>
          </div>
        }
      >
        <div className="p-6 space-y-6">
          <div>
            <label className="text-[10px] font-bold text-neutral-theme uppercase tracking-widest block mb-2">New Name</label>
            <p className="text-primary font-bold text-lg">{previewRecipe?.name}</p>
          </div>
          <div>
            <label className="text-[10px] font-bold text-neutral-theme uppercase tracking-widest block mb-2">Ingredients</label>
            <ul className="space-y-1">
              {previewRecipe?.ingredients.map((ing, i) => (
                <li key={i} className="text-sm text-primary flex gap-2">
                  <span className="font-mono text-neutral-theme">{ing.amount}</span>
                  <span>{ing.name}</span>
                  {ing.preparation && <span className="italic text-neutral-theme">({ing.preparation})</span>}
                </li>
              ))}
            </ul>
          </div>
          {previewRecipe?.directions && previewRecipe.directions.length > 0 && (
            <div>
              <label className="text-[10px] font-bold text-neutral-theme uppercase tracking-widest block mb-2">Directions</label>
              <ol className="space-y-2">
                {previewRecipe.directions.map((step, i) => (
                  <li key={i} className="text-sm text-primary flex gap-3">
                    <span className="font-bold text-neutral-theme shrink-0">{i + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};
