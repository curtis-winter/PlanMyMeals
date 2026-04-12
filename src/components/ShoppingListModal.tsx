import React, { useState, useEffect } from 'react';
import { ShoppingCart, CheckCircle2, Copy, Check, Search, Sparkles, Loader2, X, Smartphone } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Autocomplete } from './ui/Autocomplete';
import { getSection, GROCERY_SECTIONS } from '../utils/grocerySections';

interface ShoppingListModalProps {
  isOpen: boolean;
  onClose: () => void;
  shoppingList: [string, string[]][];
  onMarkAsAvailable: (name: string) => void;
  onAddItem?: (name: string) => void;
}

interface CustomItem {
  name: string;
  id: string;
}

interface ShoppingItem {
  name: string;
  amounts: string[];
  source: 'recipe' | 'custom';
  id: string;
  checked: boolean;
}

export const ShoppingListModal: React.FC<ShoppingListModalProps> = ({ isOpen, onClose, shoppingList, onMarkAsAvailable, onAddItem }) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [customItems, setCustomItems] = useState<CustomItem[]>([]);
  const [search, setSearch] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [itemCategories, setItemCategories] = useState<Record<string, string>>({});

  // Load custom items from localStorage
  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('shoppingList_customItems');
      if (saved) {
        try {
          setCustomItems(JSON.parse(saved));
        } catch {
          setCustomItems([]);
        }
      }
      // Load checked state
      const checkedState = localStorage.getItem('shoppingList_checkedItems');
      if (checkedState) {
        try {
          setCheckedItems(JSON.parse(checkedState));
        } catch {
          setCheckedItems({});
        }
      }
      // Load AI-updated categories
      const savedCategories = localStorage.getItem('shoppingList_categories');
      if (savedCategories) {
        try {
          setItemCategories(JSON.parse(savedCategories));
        } catch {
          setItemCategories({});
        }
      }
    }
  }, [isOpen]);

  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // Save custom items to localStorage
  const saveCustomItems = (items: CustomItem[]) => {
    setCustomItems(items);
    localStorage.setItem('shoppingList_customItems', JSON.stringify(items));
  };

  // Save checked state to localStorage
  const saveCheckedState = (state: Record<string, boolean>) => {
    setCheckedItems(state);
    localStorage.setItem('shoppingList_checkedItems', JSON.stringify(state));
  };

  // Save AI-updated categories to localStorage
  const saveItemCategories = (categories: Record<string, string>) => {
    setItemCategories(categories);
    localStorage.setItem('shoppingList_categories', JSON.stringify(categories));
  };

  // Toggle item checked state
  const toggleChecked = (id: string) => {
    const newState = { ...checkedItems, [id]: !checkedItems[id] };
    saveCheckedState(newState);
  };

  // Combine recipe-based items with custom items
  const allItems = React.useMemo(() => {
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

  // Filter by search
  const filteredItems = React.useMemo(() => {
    if (!search.trim()) return allItems;
    return allItems.filter(item => 
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [allItems, search]);

  // Group items by section (using AI-updated categories if available)
  const groupedItems = React.useMemo(() => {
    const sections: Record<string, ShoppingItem[]> = {};
    filteredItems.forEach(item => {
      // Use AI-updated category if available, otherwise use default getSection
      const aiCategory = itemCategories[item.name.toLowerCase()];
      const section = aiCategory || getSection(item.name);
      if (!sections[section]) sections[section] = [];
      sections[section].push(item);
    });
    return sections;
  }, [filteredItems, itemCategories]);

  // Debug: log AI categories when they update
  React.useEffect(() => {
    if (Object.keys(itemCategories).length > 0) {
      console.log('AI Updated categories:', itemCategories);
    }
  }, [itemCategories]);

  const sectionOrder = Object.keys(GROCERY_SECTIONS);

  const handleAddItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (newItemName.trim()) {
      const newItem: CustomItem = {
        name: newItemName.trim(),
        id: Date.now().toString()
      };
      saveCustomItems([...customItems, newItem]);
      setNewItemName('');
    }
  };

  const handleAutocompleteSelect = async (item: { name: string; category?: string }) => {
    if (onAddItem) {
      onAddItem(item.name);
    }
    const newItem: CustomItem = {
      name: item.name,
      id: Date.now().toString()
    };
    saveCustomItems([...customItems, newItem]);
    setNewItemName('');
    
    // Add to shopping history
    try {
      await fetch('/api/shopping-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: item.name, category: item.category })
      });
    } catch {}
  };

  const handleRemoveCustomItem = (id: string) => {
    saveCustomItems(customItems.filter(item => item.id !== id));
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
      console.log('AI optimize result:', result);
      
      if (!response.ok || result.error) {
        console.error('AI optimize failed:', result.error);
        return;
      }

      // Update item categories based on AI suggestions
      const newCategories: Record<string, string> = {};
      if (Array.isArray(result)) {
        for (const suggestion of result) {
          if (suggestion.name && suggestion.category) {
            newCategories[suggestion.name.toLowerCase()] = suggestion.category;
          }
        }
        console.log('New categories to apply:', newCategories);
        saveItemCategories({ ...itemCategories, ...newCategories });
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

    const copyToClipboard = (str: string) => {
      if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(str);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = str;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        return new Promise<void>((resolve, reject) => {
          document.execCommand('copy') ? resolve() : reject();
          document.body.removeChild(textArea);
        });
      }
    };

    copyToClipboard(text.trim()).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleClearChecked = () => {
    // Reset all checked items - they will be refetched from DB on next open
    saveCheckedState({});
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Shopping List"
      maxWidth="max-w-md"
      icon={<ShoppingCart className="text-background-theme w-5 h-5" />}
      headerActions={
        <div className="flex items-center gap-1">
          <a
            href="/mobile"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
            title="Open Mobile Version"
          >
            <Smartphone className="w-4 h-4" />
          </a>
          <button
            onClick={handleOptimizeCategories}
            disabled={isOptimizing || allItems.length === 0}
            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50"
            title="Organize with AI"
          >
            {isOptimizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          </button>
        </div>
      }
      footer={
        <div className="space-y-3">
          {onAddItem && (
            <Autocomplete
              value={newItemName}
              onChange={setNewItemName}
              onSelect={handleAutocompleteSelect}
              placeholder="Add item to list..."
            />
          )}
          
          {allItems.length > 0 && (
            <button 
              onClick={handleCopy}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold transition-all shadow-lg active:scale-[0.98] ${
                copySuccess 
                  ? 'bg-green-500 text-white' 
                  : 'bg-surface text-primary border border-border-theme hover:bg-background-theme'
              }`}
            >
              {copySuccess ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              {copySuccess ? 'Copied!' : 'Copy to Clipboard'}
            </button>
          )}
          
          <button 
            onClick={onClose}
            className="w-full bg-primary text-background-theme py-4 rounded-2xl font-bold hover:bg-secondary hover:text-primary transition-all shadow-lg shadow-primary/20 active:scale-[0.98]"
          >
            Got it
          </button>
        </div>
      }
    >
      <div className="flex flex-col h-full">
        {/* Sticky Search */}
        <div className="sticky top-0 z-10 p-4 bg-surface border-b border-border-theme">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-theme" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search list..."
              className="w-full pl-10 pr-10 py-2 rounded-xl bg-background-theme border border-border-theme focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all outline-none text-sm text-primary"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-primary/10 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-neutral-theme" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Clear checked button */}
          {Object.values(checkedItems).some(v => v) && (
            <button
              onClick={handleClearChecked}
              className="text-xs text-neutral-theme hover:text-primary transition-colors underline mb-4"
            >
              Clear checked items
            </button>
          )}
          
          {allItems.length === 0 && !newItemName.trim() ? (
            <div className="text-center py-12">
              <div className="bg-background-theme w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-neutral-theme/30" />
              </div>
              <p className="text-neutral-theme font-medium">Your pantry is full!</p>
              <p className="text-neutral-theme/50 text-sm">No items need to be purchased.</p>
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
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all group ${
                            item.checked 
                              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 opacity-60' 
                              : 'bg-background-theme border-border-theme'
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <button
                              onClick={() => {
                                toggleChecked(item.id);
                                // Mark as in pantry (this removes from shopping list automatically on next load)
                                if (item.source === 'custom' && onAddItem) {
                                  onAddItem(item.name);
                                  handleRemoveCustomItem(customItems.find(c => c.name === item.name)?.id || '');
                                } else {
                                  onMarkAsAvailable(item.name);
                                }
                              }}
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                item.checked 
                                  ? 'bg-green-500 border-green-500 text-white' 
                                  : 'border-primary/30 hover:border-primary hover:bg-primary/10'
                              }`}
                              title={item.checked ? "Uncheck" : "Mark as in Pantry"}
                            >
                              {item.checked && <Check className="w-3 h-3" />}
                            </button>
                            <div className="flex-1 min-w-0">
                              <span className={`font-medium capitalize block truncate ${item.checked ? 'line-through text-neutral-theme' : 'text-primary'}`}>
                                {item.name}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            {item.amounts.length > 0 && (
                              <span className="text-xs text-neutral-theme font-mono bg-surface px-2 py-1 rounded-lg border border-border-theme">
                                {item.amounts.join(', ')}
                              </span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};