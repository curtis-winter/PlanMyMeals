import React from 'react';
import { 
    Plus, 
    ShoppingCart, 
    ChevronRight, 
    ChevronLeft,
    UtensilsCrossed,
    BookOpen,
    Sparkles,
    Loader2,
    Settings,
    Package,
    Upload
  } from 'lucide-react';
import { DAYS_OF_WEEK, DayOfWeek, getWeekStart } from '../types';

interface HeaderProps {
  isLocalHost: boolean;
  buildNumber: number;
  weekStartDay: DayOfWeek;
  currentWeekStart: string;
  showSettings: boolean;
  showRecipeBook: boolean;
  showPantryManager: boolean;
  showShoppingList: boolean;
  shoppingList: Array<{ name: string; amount: string }>;
  onToggleSettings: () => void;
  onToggleRecipeBook: () => void;
  onTogglePantryManager: () => void;
  onToggleShoppingList: () => void;
  onNavigateWeek: (direction: number) => void;
}

export function Header({
  isLocalHost,
  buildNumber,
  weekStartDay,
  currentWeekStart,
  showSettings,
  showRecipeBook,
  showPantryManager,
  showShoppingList,
  shoppingList,
  onToggleSettings,
  onToggleRecipeBook,
  onTogglePantryManager,
  onToggleShoppingList,
  onNavigateWeek
}: HeaderProps) {
  const getWeekLabel = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const current = new Date(currentWeekStart + 'T00:00:00');
    current.setHours(0, 0, 0, 0);
    
    // Get the configured week start day
    const configuredStart = weekStartDay;
    const thisWeeksStartStr = getWeekStart(today, configuredStart);
    const thisWeeksStart = new Date(thisWeeksStartStr + 'T00:00:00');
    const thisWeeksEnd = new Date(thisWeeksStart);
    thisWeeksEnd.setDate(thisWeeksEnd.getDate() + 6);
    
    if (current.getTime() === thisWeeksStart.getTime()) return 'Current Week';
    if (current > today) return 'Future Week';
    return 'Past Week';
  };

  return (
    <header className={`border-b sticky top-0 z-30 transition-colors ${isLocalHost ? 'bg-red-600 border-red-800' : 'bg-surface border-border-theme'}`}>
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button 
            onClick={onToggleSettings}
            className={`p-2 transition-colors ${isLocalHost ? 'text-white hover:text-red-200' : 'text-neutral-theme hover:text-primary'}`}
            title="Settings"
          >
            <Settings className="w-6 h-6" />
          </button>
          <div className={`p-2 rounded-lg ${isLocalHost ? 'bg-white' : 'bg-primary'}`}>
            <UtensilsCrossed className={`w-5 h-5 ${isLocalHost ? 'text-red-600' : 'text-background-theme'}`} />
          </div>
          <h1 className={`font-bold text-xl tracking-tight ${isLocalHost ? 'text-white' : 'text-primary'}`}>MyMealPlan</h1>
        </div>
        <div className="flex items-center gap-2">
          {isLocalHost && buildNumber > 0 && (
            <span className="bg-white text-red-600 px-3 py-1 rounded-full text-sm font-bold">
              Build #{buildNumber}
            </span>
          )}
          <button 
            onClick={onToggleRecipeBook}
            className={`flex items-center gap-2 border text-sm font-medium px-4 py-2 rounded-full transition-colors shadow-sm ${isLocalHost ? 'bg-white/20 border-white/40 text-white hover:bg-white/30' : 'bg-surface border-border-theme text-primary hover:bg-background-theme'}`}
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Recipe Book</span>
          </button>
          <button 
            onClick={onTogglePantryManager}
            className={`flex items-center gap-2 border text-sm font-medium px-4 py-2 rounded-full transition-colors shadow-sm ${isLocalHost ? 'bg-white/20 border-white/40 text-white hover:bg-white/30' : 'bg-surface border-border-theme text-primary hover:bg-background-theme'}`}
          >
            <Package className="w-4 h-4" />
            <span className="hidden sm:inline">Pantry</span>
          </button>
          <button 
            onClick={onToggleShoppingList}
            className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full transition-colors shadow-sm ${isLocalHost ? 'bg-white text-red-600 hover:bg-red-100' : 'bg-primary text-background-theme hover:bg-secondary hover:text-primary'}`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">Shopping List</span>
            {shoppingList.length > 0 && (
              <span className={`text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold ${isLocalHost ? 'bg-red-800 text-white' : 'bg-accent-theme text-black'}`}>
                {shoppingList.length}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}