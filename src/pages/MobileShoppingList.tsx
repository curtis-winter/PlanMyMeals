import React, { useState, useEffect } from 'react';
import { ShoppingCart, CheckCircle2, Copy, Check, Sparkles, Loader2, ArrowLeft, Package } from 'lucide-react';
import { getSection, GROCERY_SECTIONS } from '../utils/grocerySections';
import { getWeekStart, Ingredient, Meal } from '../types';
import { Autocomplete } from '../components/ui/Autocomplete';

interface ShoppingItem {
  name: string;
  amounts: string[];
  source: 'recipe' | 'custom';
  id: string;
  checked: boolean;
}

export default function MobileShoppingList() {
  const [shoppingList, setShoppingList] = useState<[string, string[]][]>([]);
  const [customItems, setCustomItems] = useState<{ name: string; id: string }[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [itemCategories, setItemCategories] = useState<Record<string, string>>({});
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get week start day from settings
        const settingsRes = await fetch('/api/settings');
        const settings = await settingsRes.json();
        const weekStartDay = settings.week_start_day || 'Monday';

        // Calculate current week start
        const weekStartStr = getWeekStart(new Date(), weekStartDay);

        // Fetch plan and pantry in parallel
        const [planRes, pantryRes] = await Promise.all([
          fetch(`/api/plan/${weekStartStr}`),
          fetch('/api/pantry')
        ]);
        
        const data = await planRes.json();
        const pantryData = await pantryRes.json();
        const pantryItems = pantryData.map((p: { name: string }) => p.name.toLowerCase().trim());
        const pantrySet = new Set(pantryItems);
        
        // Extract ingredients NOT in pantry
        const missingIngredients: Record<string, string[]> = {};
        
        data.forEach((dayPlan: any) => {
          const recipes = JSON.parse(dayPlan.recipes || '[]');
          recipes.forEach((recipe: any) => {
            recipe.ingredients?.forEach((ing: Ingredient) => {
              const name = ing.name?.trim().toLowerCase();
              // Only include if not available in pantry
              if (name && !ing.isAvailable && !pantrySet.has(name)) {
                if (!missingIngredients[name]) {
                  missingIngredients[name] = [];
                }
                if (ing.amount) {
                  missingIngredients[name].push(ing.amount);
                }
              }
            });
          });
        });
        
        // Sort alphabetically
        const sortedList = Object.entries(missingIngredients)
          .sort(([a], [b]) => a.localeCompare(b));
        setShoppingList(sortedList);
      } catch (err) {
        console.error('Failed to fetch shopping list:', err);
      }
    };

    fetchData();

    // Load custom items from localStorage
    const savedCustom = localStorage.getItem('shoppingList_customItems');
    if (savedCustom) {
      try {
        setCustomItems(JSON.parse(savedCustom));
      } catch {}
    }

    // Load checked state
    const checkedState = localStorage.getItem('shoppingList_checkedItems');
    if (checkedState) {
      try {
        setCheckedItems(JSON.parse(checkedState));
      } catch {}
    }

    // Load categories
    const savedCategories = localStorage.getItem('shoppingList_categories');
    if (savedCategories) {
      try {
        setItemCategories(JSON.parse(savedCategories));
      } catch {}
    }
  }, []);

  const allItems: ShoppingItem[] = React.useMemo(() => {
    const recipeItems = shoppingList.map(([name, amounts], idx) => ({ 
      name, 
      amounts, 
      source: 'recipe' as const, 
      id: `recipe-${idx}-${name}`,
      checked: checkedItems[`recipe-${idx}-${name}`] || false
    }));
    const customItemList = customItems.map((item, idx) => ({ 
      name: item.name, 
      amounts: [] as string[], 
      source: 'custom' as const, 
      id: `custom-${item.id}`,
      checked: checkedItems[`custom-${item.id}`] || false
    }));
    return [...recipeItems, ...customItemList];
  }, [shoppingList, customItems, checkedItems]);

  const groupedItems = React.useMemo(() => {
    const sections: Record<string, ShoppingItem[]> = {};
    allItems.forEach(item => {
      const aiCategory = itemCategories[item.name.toLowerCase()];
      const section = aiCategory || getSection(item.name);
      if (!sections[section]) sections[section] = [];
      sections[section].push(item);
    });
    return sections;
  }, [allItems, itemCategories]);

  const sectionOrder = Object.keys(GROCERY_SECTIONS);

  const toggleChecked = (id: string) => {
    const newState = { ...checkedItems, [id]: !checkedItems[id] };
    setCheckedItems(newState);
    localStorage.setItem('shoppingList_checkedItems', JSON.stringify(newState));
  };

  const handleOptimizeCategories = async () => {
    if (isOptimizing || allItems.length === 0) return;
    setIsOptimizing(true);
    try {
      const response = await fetch('/api/ai/optimize-pantry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: allItems.map(i => ({ name: i.name })) })
      });
      const result = await response.json();
      if (Array.isArray(result)) {
        const newCategories: Record<string, string> = {};
        for (const suggestion of result) {
          if (suggestion.name && suggestion.category) {
            newCategories[suggestion.name.toLowerCase()] = suggestion.category;
          }
        }
        const updated = { ...itemCategories, ...newCategories };
        setItemCategories(updated);
        localStorage.setItem('shoppingList_categories', JSON.stringify(updated));
      }
    } catch (err) {
      console.error('Failed to optimize:', err);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleCopy = () => {
    let text = "🛒 MY SHOPPING LIST\n\n";
    sectionOrder.forEach(section => {
      const items = groupedItems[section];
      if (items && items.length > 0) {
        text += `${section}\n`;
        items.forEach(({ name, amounts, checked }) => {
          const amountStr = amounts.length > 0 ? ` (${amounts.join(', ')})` : '';
          const checkMark = checked ? '✓' : '○';
          text += `  ${checkMark} ${name}${amountStr}\n`;
        });
        text += "\n";
      }
    });
    
    navigator.clipboard.writeText(text.trim()).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const goBack = () => {
    window.location.href = '/';
  };

  const handleAddCustomItem = async () => {
    if (!newItemName.trim()) return;
    const newItem = { name: newItemName.trim(), id: Date.now().toString() };
    const updated = [...customItems, newItem];
    setCustomItems(updated);
    localStorage.setItem('shoppingList_customItems', JSON.stringify(updated));
    setNewItemName('');

    // Add to shopping history
    try {
      await fetch('/api/shopping-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newItem.name, category: '' })
      });
    } catch {}
  };

  const handleAutocompleteSelect = async (item: { name: string; category?: string }) => {
    const newItem = { name: item.name, id: Date.now().toString() };
    const updated = [...customItems, newItem];
    setCustomItems(updated);
    localStorage.setItem('shoppingList_customItems', JSON.stringify(updated));
    setNewItemName('');

    // Add to shopping history
    try {
      await fetch('/api/shopping-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: item.name, category: item.category || '' })
      });
    } catch {}
  };

  return (
    <div className="min-h-screen bg-background-theme pb-24">
      {/* Header */}
        <header className="bg-surface border-b border-border-theme sticky top-0 z-20">
          <div className="flex items-center justify-between p-4 w-full">
            <div className="flex items-center gap-2">
              <button onClick={() => window.location.href = '/'} className="p-2 hover:bg-primary/10 rounded-lg" title="Go to Main">
                <ArrowLeft className="w-5 h-5 text-primary" />
              </button>
              <div className="bg-primary p-2 rounded-xl">
                <ShoppingCart className="text-background-theme w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-primary">Shopping List</h1>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => window.location.href = '/pantry'} className="p-2 hover:bg-primary/10 rounded-lg" title="Go to Pantry">
                <Package className="w-5 h-5 text-primary" />
              </button>
              <button
                onClick={handleOptimizeCategories}
                disabled={isOptimizing || allItems.length === 0}
                className="p-2 text-primary hover:bg-primary/10 rounded-lg disabled:opacity-50"
              >
                {isOptimizing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              </button>
            </div>
          </div>
      </header>

      {/* Content */}
      <main className="p-4">
        {allItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-surface w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-neutral-theme/30" />
            </div>
            <p className="text-neutral-theme font-medium text-lg">Your pantry is full!</p>
            <p className="text-neutral-theme/50">No items need to be purchased.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sectionOrder.map(section => {
              const items = groupedItems[section];
              if (!items || items.length === 0) return null;
              return (
                <div key={section}>
                  <h3 className="text-xs font-bold text-neutral-theme uppercase tracking-wider mb-2">{section}</h3>
                  <ul className="space-y-2">
                    {items.map((item) => (
                      <li 
                        key={item.id} 
                        className={`flex items-center p-4 rounded-xl border transition-all ${
                          item.checked 
                            ? 'bg-green-50 border-green-200 opacity-60' 
                            : 'bg-surface border-border-theme'
                        }`}
                      >
                        <button
                          onClick={() => toggleChecked(item.id)}
                          className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 mr-3 ${
                            item.checked 
                              ? 'bg-green-500 border-green-500 text-white' 
                              : 'border-primary/30'
                          }`}
                        >
                          {item.checked && <Check className="w-4 h-4" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <span className={`font-medium capitalize block truncate ${item.checked ? 'line-through text-neutral-theme' : 'text-primary'}`}>
                            {item.name}
                          </span>
                        </div>
                        {item.amounts.length > 0 && (
                          <span className="text-xs text-neutral-theme font-mono bg-background-theme px-2 py-1 rounded-lg border border-border-theme ml-2">
                            {item.amounts.join(', ')}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </main>

        {/* Fixed Bottom Actions */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-surface border-t border-border-theme space-y-3">
          <div className="flex w-full justify-center">
            <div className="flex-1 max-w-full">
              <Autocomplete
                value={newItemName}
                onChange={setNewItemName}
                onSelect={handleAutocompleteSelect}
                placeholder="Add item to list (press Enter to add)"
                className="w-full h-[3rem]"
              />
            </div>
          </div>
          <button 
            onClick={handleCopy}
            className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all ${
              copySuccess 
                ? 'bg-green-500 text-white' 
                : 'bg-primary text-background-theme hover:bg-secondary hover:text-primary'
            }`}
          >
            {copySuccess ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            {copySuccess ? 'Copied!' : 'Copy List'}
          </button>
        </div>
    </div>
  );
}