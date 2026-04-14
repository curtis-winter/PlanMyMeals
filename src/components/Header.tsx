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
  return (
    <header className={`border-b fixed top-0 left-0 right-0 z-50 ${isLocalHost ? 'bg-red-600 border-red-800' : 'bg-surface border-border-theme'}`}>
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={onToggleSettings}
            className={`p-2 ${isLocalHost ? 'text-white hover:text-red-200' : 'text-neutral-theme hover:text-primary'}`}
            title="Settings"
          >
            <Settings className="w-6 h-6" />
          </button>
          <div className={`p-2 rounded-lg ${isLocalHost ? 'bg-white' : 'bg-primary'}`}>
            <UtensilsCrossed className={`w-5 h-5 ${isLocalHost ? 'text-red-600' : 'text-background-theme'}`} />
          </div>
          <h1 className={`font-bold text-xl tracking-tight ${isLocalHost ? 'text-white' : 'text-primary'}`}>MyMealPlan</h1>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isLocalHost && buildNumber > 0 && (
            <span className="bg-white text-red-600 px-3 py-1 rounded-full text-sm font-bold shrink-0">
              Build #{buildNumber}
            </span>
          )}
          <button 
            id="btn-recipe-book"
            onClick={onToggleRecipeBook}
            className={`flex items-center gap-2 border text-sm font-medium px-4 py-2 rounded-full shadow-sm shrink-0 ${isLocalHost ? 'bg-white/20 border-white/40 text-white' : 'bg-surface border-border-theme text-primary'}`}
            style={{ transition: 'none' }}
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Recipe Book</span>
          </button>
          <button 
            id="btn-pantry"
            onClick={onTogglePantryManager}
            className={`flex items-center gap-2 border text-sm font-medium px-4 py-2 rounded-full shadow-sm shrink-0 ${isLocalHost ? 'bg-white/20 border-white/40 text-white' : 'bg-surface border-border-theme text-primary'}`}
            style={{ transition: 'none' }}
          >
            <Package className="w-4 h-4" />
            <span className="hidden sm:inline">Pantry</span>
          </button>
          <button 
            id="btn-shopping-list"
            onClick={onToggleShoppingList}
            className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full shadow-sm shrink-0 ${isLocalHost ? 'bg-white text-red-600' : 'bg-primary text-background-theme'}`}
            style={{ transition: 'none' }}
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">Shopping List</span>
            {shoppingList.length > 0 && (
              <span 
                id="badge-shopping-list"
                className={`text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold bg-accent-theme text-black`}
                style={{ transform: 'none', transition: 'none' }}
              >
                {shoppingList.length}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}