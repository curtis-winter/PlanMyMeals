import React, { useState } from 'react';
import { Plus, Trash2, Package, Search } from 'lucide-react';
import { PantryItem } from '../types';
import { getSection, GROCERY_SECTIONS } from '../utils/grocerySections';
import { Modal } from './ui/Modal';

interface PantryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pantryItems: PantryItem[];
  savePantryItem: (item: Partial<PantryItem>) => Promise<void>;
  removePantryItem: (id: number) => Promise<void>;
}

export const PantryManagerModal: React.FC<PantryManagerModalProps> = ({
  isOpen,
  onClose,
  pantryItems,
  savePantryItem,
  removePantryItem
}) => {
  const [search, setSearch] = useState('');
  const [newItemName, setNewItemName] = useState('');

  const filteredItems = pantryItems.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const groupedItems = React.useMemo(() => {
    const groups: Record<string, PantryItem[]> = {};
    filteredItems.forEach(item => {
      const section = getSection(item.name);
      if (!groups[section]) groups[section] = [];
      groups[section].push(item);
    });
    return groups;
  }, [filteredItems]);

  const sectionOrder = Object.keys(GROCERY_SECTIONS);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    const capitalized = newItemName.trim().charAt(0).toUpperCase() + newItemName.trim().slice(1);
    await savePantryItem({ name: capitalized });
    setNewItemName('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pantry Inventory"
      maxWidth="max-w-md"
      icon={<Package className="text-background-theme w-5 h-5" />}
      footer={
        <form onSubmit={handleAddItem} className="space-y-3">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Item name (e.g. Milk)"
            className="w-full px-4 py-2 rounded-xl bg-surface border border-border-theme focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all outline-none text-sm text-primary"
          />
          <button
            type="submit"
            disabled={!newItemName.trim()}
            className="w-full py-3 bg-primary text-background-theme rounded-xl font-bold hover:bg-secondary hover:text-primary transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> Add to Pantry
          </button>
        </form>
      }
    >
      <div className="flex flex-col h-full">
        <div className="p-4 bg-background-theme/30 border-b border-border-theme sticky top-0 z-10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-theme" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search pantry..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface border border-border-theme focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all outline-none text-sm text-primary"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-neutral-theme/20 mx-auto mb-4" />
              <p className="text-sm text-neutral-theme">No items found in your pantry.</p>
            </div>
          ) : (
            sectionOrder.map(section => {
              const items = groupedItems[section];
              if (!items || items.length === 0) return null;
              
              return (
                <div key={section} className="space-y-2">
                  <h3 className="text-[10px] font-bold text-neutral-theme uppercase tracking-widest px-1">
                    {section}
                  </h3>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-border-theme group">
                        <div className="flex-1">
                          <h4 className="font-semibold text-primary">{item.name}</h4>
                        </div>
                        <button
                          onClick={() => removePantryItem(item.id)}
                          className="p-2 text-neutral-theme hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Modal>
  );
};
