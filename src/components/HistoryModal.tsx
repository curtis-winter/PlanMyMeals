import React, { useState, useEffect } from 'react';
import { Search, Calendar, X, Clock, Trash2 } from 'lucide-react';
import { Modal } from './ui/Modal';
import { useMealHistory, MealHistoryItem } from '../hooks/useMealHistory';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyRecipe?: (recipeName: string) => void;
  isLocalHost?: boolean;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  onApplyRecipe,
  isLocalHost
}) => {
  const { history, isLoading, search, setSearch, removeFromHistory, refreshHistory } = useMealHistory();
  const [localSearch, setLocalSearch] = useState('');

  useEffect(() => {
    if (isOpen) {
      refreshHistory();
    }
  }, [isOpen]);

  const handleSearch = (value: string) => {
    setLocalSearch(value);
    setSearch(value);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredHistory = localSearch 
    ? history.filter(h => h.recipe_name.toLowerCase().includes(localSearch.toLowerCase()))
    : history;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Meal History"
      maxWidth="max-w-2xl"
      isLocalHost={isLocalHost}
      icon={<Clock className="text-background-theme w-5 h-5" />}
    >
      <div className="flex flex-col h-full">
        <div className="p-6 border-b border-border-theme bg-surface space-y-4 sticky top-0 z-10">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-theme w-5 h-5" />
            <input
              type="text"
              placeholder="Search meal history..."
              value={localSearch}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-background-theme border-transparent focus:bg-surface focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all outline-none text-primary"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="text-center py-8 text-neutral-theme">Loading...</div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-8 text-neutral-theme">
              {localSearch ? 'No meals found matching your search' : 'No meal history yet. Start cooking!'}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHistory.map((item) => (
                <div 
                  key={item.id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-background-theme border border-border-theme hover:border-primary/30 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-surface p-2 rounded-xl">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-primary">{item.recipe_name}</p>
                      <p className="text-xs text-neutral-theme">
                        {item.day} • {formatDate(item.date)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {onApplyRecipe && (
                      <button
                        onClick={() => onApplyRecipe(item.recipe_name)}
                        className="px-3 py-1.5 text-xs font-bold text-primary bg-surface rounded-lg hover:bg-primary hover:text-background-theme transition-colors"
                      >
                        Apply
                      </button>
                    )}
                    <button
                      onClick={() => removeFromHistory(item.id)}
                      className="p-2 text-neutral-theme hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      title="Remove from history"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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