import React, { useState, useEffect } from 'react';
import { Package, Plus, Trash2, Search, ArrowLeft, Sparkles, Loader2, ShoppingCart } from 'lucide-react';
import { PantryItem } from '../types';
import { getSection, GROCERY_SECTIONS } from '../utils/grocerySections';
import { Autocomplete } from '../components/ui/Autocomplete';

export default function MobilePantry() {
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [search, setSearch] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchPantryItems();
  }, []);

  const fetchPantryItems = async () => {
    try {
      const res = await fetch('/api/pantry');
      const data = await res.json();
      setPantryItems(data);
    } catch (err) {
      console.error('Failed to fetch pantry:', err);
    }
  };

  const filteredItems = pantryItems.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const groupedItems = React.useMemo(() => {
    const groups: Record<string, PantryItem[]> = {};
    filteredItems.forEach(item => {
      const section = item.category || 'Other';
      if (!groups[section]) groups[section] = [];
      groups[section].push(item);
    });
    return groups;
  }, [filteredItems]);

  const sectionOrder = Object.keys(GROCERY_SECTIONS);
  const additionalSections = Object.keys(groupedItems).filter(s => !sectionOrder.includes(s));
  const allSections = [...sectionOrder, ...additionalSections];

  const handleAddItem = async (e: React.FormEvent, category?: string) => {
    e.preventDefault();
    if (!newItemName.trim() || isAdding) return;
    setIsAdding(true);
    try {
      const capitalized = newItemName.trim().charAt(0).toUpperCase() + newItemName.trim().slice(1);
      const detectedSection = category || getSection(capitalized);
      await fetch('/api/pantry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: capitalized, category: detectedSection })
      });
      setNewItemName('');
      fetchPantryItems();
    } catch (err) {
      console.error('Failed to add item:', err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveItem = async (id: number) => {
    try {
      await fetch(`/api/pantry/${id}`, { method: 'DELETE' });
      setPantryItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Failed to remove item:', err);
    }
  };

  const handleAutocompleteSelect = async (item: { name: string; category?: string }) => {
    if (isAdding) return;
    setIsAdding(true);
    try {
      const capitalized = item.name.charAt(0).toUpperCase() + item.name.slice(1);
      const detectedSection = item.category || getSection(capitalized);
      await fetch('/api/pantry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: capitalized, category: detectedSection })
      });
      setNewItemName('');
      fetchPantryItems();
    } catch (err) {
      console.error('Failed to add item:', err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleOptimizeCategories = async () => {
    if (isOptimizing || pantryItems.length === 0) return;
    setIsOptimizing(true);
    try {
      const response = await fetch('/api/ai/optimize-pantry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: pantryItems.map(i => ({ name: i.name })) })
      });
      const result = await response.json();
      if (Array.isArray(result)) {
        for (const suggestion of result) {
          const item = pantryItems.find(i => i.name.toLowerCase() === suggestion.name.toLowerCase());
          if (item && item.category !== suggestion.category) {
            await fetch('/api/pantry', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...item, category: suggestion.category })
            });
          }
        }
        fetchPantryItems();
      }
    } catch (err) {
      console.error('Failed to optimize:', err);
    } finally {
      setIsOptimizing(false);
    }
  };

  const goBack = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-background-theme pb-24">
        <header className="bg-surface border-b border-border-theme sticky top-0 z-20">
          <div className="flex items-center justify-between p-4 w-full">
            <div className="flex items-center gap-2">
              <button onClick={() => window.location.href = '/'} className="p-2 hover:bg-primary/10 rounded-lg" title="Go to Main">
                <ArrowLeft className="w-5 h-5 text-primary" />
              </button>
              <div className="bg-primary p-2 rounded-xl">
                <Package className="text-background-theme w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-primary">Pantry</h1>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => window.location.href = '/mobile'} className="p-2 hover:bg-primary/10 rounded-lg" title="Go to Shopping List">
                <ShoppingCart className="w-5 h-5 text-primary" />
              </button>
              <button
                onClick={handleOptimizeCategories}
                disabled={isOptimizing || pantryItems.length === 0}
                className="p-2 text-primary hover:bg-primary/10 rounded-lg disabled:opacity-50"
              >
                {isOptimizing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              </button>
            </div>
          </div>
      </header>

      <div className="p-4 bg-surface border-b border-border-theme">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-theme" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pantry..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-background-theme border border-border-theme focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all outline-none text-sm text-primary"
          />
        </div>
      </div>

      <main className="p-4">
        {filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-surface w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-neutral-theme/30" />
            </div>
            <p className="text-neutral-theme font-medium text-lg">
              {search ? 'No items found' : 'Your pantry is empty'}
            </p>
            <p className="text-neutral-theme/50">
              {search ? 'Try a different search' : 'Add items to get started'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {allSections.map(section => {
              const items = groupedItems[section];
              if (!items || items.length === 0) return null;
              return (
                <div key={section}>
                  <h3 className="text-xs font-bold text-neutral-theme uppercase tracking-wider mb-2">{section}</h3>
                  <ul className="space-y-2">
                    {items.map((item) => (
                      <li 
                        key={item.id}
                        className="flex items-center justify-between p-4 rounded-xl border border-border-theme bg-surface"
                      >
                        <span className="font-medium text-primary">{item.name}</span>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-2 text-neutral-theme hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </main>

         <div className="fixed bottom-0 left-0 right-0 p-4 bg-surface border-t border-border-theme">
          <div className="flex w-full justify-center">
            <div className="flex-1 max-w-full">
              <Autocomplete
                value={newItemName}
                onChange={setNewItemName}
                onSelect={handleAutocompleteSelect}
                placeholder="Item name (e.g. Milk) (press Enter to add)"
                className="w-full h-[3rem]"
              />
            </div>
          </div>
        </div>
    </div>
  );
}