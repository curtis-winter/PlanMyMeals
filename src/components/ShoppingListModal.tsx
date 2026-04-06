import React, { useState } from 'react';
import { ShoppingCart, CheckCircle2, Copy, Check } from 'lucide-react';
import { Modal } from './ui/Modal';

interface ShoppingListModalProps {
  isOpen: boolean;
  onClose: () => void;
  shoppingList: [string, string[]][];
  onMarkAsAvailable: (name: string) => void;
}

const GROCERY_SECTIONS: Record<string, string[]> = {
  'Produce': ['apple', 'banana', 'orange', 'lettuce', 'spinach', 'carrot', 'onion', 'garlic', 'potato', 'tomato', 'cucumber', 'pepper', 'broccoli', 'cabbage', 'herb', 'cilantro', 'parsley', 'basil', 'ginger', 'lemon', 'lime', 'berry', 'strawberry', 'blueberry', 'raspberry', 'grape', 'avocado', 'mushroom'],
  'Meat & Seafood': ['chicken', 'beef', 'pork', 'steak', 'ground', 'turkey', 'fish', 'salmon', 'shrimp', 'tuna', 'bacon', 'sausage', 'ham', 'lamb'],
  'Dairy & Eggs': ['milk', 'egg', 'cheese', 'butter', 'yogurt', 'cream', 'sour cream', 'cottage cheese', 'parmesan', 'cheddar', 'mozzarella'],
  'Bakery': ['bread', 'bun', 'tortilla', 'bagel', 'muffin', 'pastry', 'pita'],
  'Pantry & Grains': ['rice', 'pasta', 'flour', 'sugar', 'oil', 'vinegar', 'honey', 'syrup', 'cereal', 'oat', 'bean', 'lentil', 'nut', 'seed', 'cracker', 'chip', 'snack', 'quinoa', 'couscous'],
  'Canned & Jarred': ['canned', 'soup', 'sauce', 'salsa', 'pickle', 'olive', 'peanut butter', 'jam', 'jelly', 'broth', 'stock'],
  'Frozen': ['frozen', 'ice cream', 'pizza'],
  'Beverages': ['water', 'juice', 'soda', 'coffee', 'tea', 'beer', 'wine'],
  'Spices & Baking': ['salt', 'pepper', 'spice', 'cinnamon', 'vanilla', 'baking powder', 'baking soda', 'yeast', 'cocoa'],
  'Other': []
};

const getSection = (itemName: string): string => {
  const lowerName = itemName.toLowerCase();
  for (const [section, keywords] of Object.entries(GROCERY_SECTIONS)) {
    if (keywords.some(keyword => lowerName.includes(keyword))) {
      return section;
    }
  }
  return 'Other';
};

export const ShoppingListModal: React.FC<ShoppingListModalProps> = ({ isOpen, onClose, shoppingList, onMarkAsAvailable }) => {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopy = () => {
    const sections: Record<string, [string, string[]][]> = {};
    
    shoppingList.forEach(item => {
      const section = getSection(item[0]);
      if (!sections[section]) sections[section] = [];
      sections[section].push(item);
    });

    let text = "🛒 MY SHOPPING LIST\n\n";
    
    const sectionOrder = Object.keys(GROCERY_SECTIONS);
    sectionOrder.forEach(section => {
      if (sections[section] && sections[section].length > 0) {
        text += `${section}\n`;
        sections[section].forEach(([name, amounts]) => {
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
          {shoppingList.length > 0 && (
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
        {shoppingList.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-background-theme w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-neutral-theme/30" />
            </div>
            <p className="text-neutral-theme font-medium">Your pantry is full!</p>
            <p className="text-neutral-theme/50 text-sm">No items need to be purchased.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {shoppingList.map(([name, amounts], idx) => (
              <li key={idx} className="flex items-center justify-between p-3 rounded-xl bg-background-theme border border-border-theme group">
                <div className="flex items-center gap-3 flex-1">
                  <button
                    onClick={() => onMarkAsAvailable(name)}
                    className="w-6 h-6 rounded-full border-2 border-primary/30 flex items-center justify-center hover:border-primary hover:bg-primary/10 transition-all group/check"
                    title="Mark as in Pantry"
                  >
                    <Check className="w-3 h-3 text-primary opacity-0 group-hover/check:opacity-100" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <span className="text-primary font-medium capitalize block truncate">{name}</span>
                    <span className="text-[10px] text-neutral-theme/40 uppercase tracking-wider font-bold">
                      {getSection(name)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {amounts.length > 0 && (
                    <span className="text-xs text-neutral-theme font-mono bg-surface px-2 py-1 rounded-lg border border-border-theme">
                      {amounts.join(', ')}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
};
