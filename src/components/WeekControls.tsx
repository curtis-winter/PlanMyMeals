import React from 'react';
import { ChevronRight, ChevronLeft, Sparkles, Loader2 } from 'lucide-react';
import { DayOfWeek, getWeekStart } from '../types';

interface WeekControlsProps {
  currentWeekStart: string;
  weekStartDay: DayOfWeek;
  onNavigateWeek: (direction: number) => void;
  onSuggestRecipe: () => void;
  isSuggestingRecipe: boolean;
}

export function WeekControls({
  currentWeekStart,
  weekStartDay,
  onNavigateWeek,
  onSuggestRecipe,
  isSuggestingRecipe
}: WeekControlsProps) {
  const getWeekLabel = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const current = new Date(currentWeekStart + 'T00:00:00');
    current.setHours(0, 0, 0, 0);
    
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
    <div className="sticky top-20 z-20 bg-background-theme/80 backdrop-blur-sm -mx-4 px-4 pt-2 -mt-2 mb-4 space-y-4 overflow-x-hidden shadow-md">
      <div className="flex items-center justify-between bg-surface p-4 rounded-2xl shadow-sm border border-border-theme transition-colors">
        <button 
          onClick={() => onNavigateWeek(-1)}
          className="p-2 hover:bg-background-theme rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-neutral-theme hover:text-primary" />
        </button>
        <div className="flex flex-col items-center">
          <h2 className="text-lg font-bold text-primary">
            Week of {new Date(currentWeekStart + 'T00:00:00').toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
          </h2>
          <p className="text-xs text-neutral-theme font-medium uppercase tracking-widest">
            {getWeekLabel()}
          </p>
        </div>
        <button 
          onClick={() => onNavigateWeek(1)}
          className="p-2 hover:bg-background-theme rounded-full transition-colors"
        >
          <ChevronRight className="w-6 h-6 text-neutral-theme hover:text-primary" />
        </button>
      </div>

      <div>
        <button
          onClick={onSuggestRecipe}
          disabled={isSuggestingRecipe}
          className="w-full py-4 bg-primary text-background-theme rounded-2xl font-bold hover:bg-secondary hover:text-primary transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSuggestingRecipe ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Sparkles className="w-5 h-5" />
          )}
          Suggest a Recipe
        </button>
      </div>
    </div>
  );
}