import React, { useState, useEffect } from 'react';
import { ShoppingCart, CheckCircle2, Copy, Check } from 'lucide-react';
import { Modal } from './ui/Modal';
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

export const ShoppingListModal: React.FC<ShoppingListModalProps> = ({ isOpen, onClose, shoppingList, onMarkAsAvailable, onAddItem }) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [customItems, setCustomItems] = useState<CustomItem[]>([]);

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
    }
  }, [isOpen]);

  // Save custom items to localStorage
  const saveCustomItems = (items: CustomItem[]) => {
    setCustomItems(items);
    localStorage.setItem('shoppingList_customItems', JSON.stringify(items));
  };

  // Combine recipe-based items with custom items
  const allItems = React.useMemo(() => {
    const recipeItems = shoppingList.map(([name, amounts]) => ({ name, amounts, source: 'recipe' as const }));
    const customItemList = customItems.map(item => ({ name: item.name, amounts: [] as string[], source: 'custom' as const }));
    return [...recipeItems, ...customItemList];
  }, [shoppingList, customItems]);

  // Group items by section
  const groupedItems = React.useMemo(() => {
    const sections: Record<string, { name: string; amounts: string[]; source: 'recipe' | 'custom' }[]> = {};
    allItems.forEach(item => {
      const section = getSection(item.name);
      if (!sections[section]) sections[section] = [];
      sections[section].push(item);
    });
    return sections;
  }, [allItems]);

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

  const handleRemoveCustomItem = (id: string) => {
    saveCustomItems(customItems.filter(item => item.id !== id));
  };

  const handleCopy = () => {
    let text = "🛒 MY SHOPPING LIST\n\n";
    
    sectionOrder.forEach(section => {
      const items = groupedItems[section];
      if (items && items.length > 0) {
        text += `${section}\n`;
        items.forEach(({ name, amounts }) => {
          const amountStr = amounts.length > 0 ? ` (${amounts.join(', ')})` : '';
          text += `  • ${name}${amountStr}\n`;
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Shopping List"
      maxWidth="max-w-md"
      icon={<ShoppingCart className="text-background-theme w-5 h-5" />}
      footer={
        <div className="space-y-3">
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
      <div className="p-6">
        {onAddItem && (
          <form onSubmit={handleAddItem} className="mb-6">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Add item to list..."
              className="w-full px-4 py-2 rounded-xl bg-surface border border-border-theme focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all outline-none text-sm text-primary placeholder:text-neutral-theme/30"
            />
          </form>
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
                    {items.map((item, idx) => (
                      <li key={idx} className="flex items-center justify-between p-3 rounded-xl bg-background-theme border border-border-theme group">
                        <div className="flex items-center gap-3 flex-1">
                          <button
                            onClick={() => {
                              if (item.source === 'custom' && onAddItem) {
                                onAddItem(item.name);
                                handleRemoveCustomItem(customItems.find(c => c.name === item.name)?.id || '');
                              } else {
                                onMarkAsAvailable(item.name);
                              }
                            }}
                            className="w-6 h-6 rounded-full border-2 border-primary/30 flex items-center justify-center hover:border-primary hover:bg-primary/10 transition-all group/check"
                            title="Mark as in Pantry"
                          >
                            <Check className="w-3 h-3 text-primary opacity-0 group-hover/check:opacity-100" />
                          </button>
                          <div className="flex-1 min-w-0">
                            <span className="text-primary font-medium capitalize block truncate">{item.name}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {item.amounts.length > 0 && (
                            <span className="text-xs text-neutral-theme font-mono bg-surface px-2 py-1 rounded-lg border border-border-theme">
                              {item.amounts.join(', ')}
                            </span>
                          )}
                          {item.source === 'custom' && (
                            <button
                              onClick={() => handleRemoveCustomItem(customItems.find(c => c.name === item.name)?.id || '')}
                              className="text-xs text-neutral-theme/50 hover:text-red-500 transition-colors"
                            >
                              Remove
                            </button>
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
    </Modal>
  );
};