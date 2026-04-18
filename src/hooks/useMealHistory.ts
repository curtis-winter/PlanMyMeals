import { useState, useEffect } from 'react';

export interface MealHistoryItem {
  id: number;
  date: string;
  day: string;
  recipe_name: string;
  recipe_id: number | null;
  created_at: string;
}

interface SearchOptions {
  search?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export function useMealHistory() {
  const [history, setHistory] = useState<MealHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchHistory = async (options: SearchOptions = {}) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (options.search) params.append('search', options.search);
      if (options.startDate) params.append('startDate', options.startDate);
      if (options.endDate) params.append('endDate', options.endDate);
      if (options.limit) params.append('limit', options.limit.toString());

      const res = await fetch(`/api/meal-history?${params.toString()}`);
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error('Failed to fetch meal history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const addToHistory = async (date: string, day: string, recipeName: string, recipeId?: number) => {
    try {
      const res = await fetch('/api/meal-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, day, recipeName, recipeId })
      });
      const data = await res.json();
      if (data.success) {
        fetchHistory({ search });
      }
      return data;
    } catch (err) {
      console.error('Failed to add to meal history:', err);
      return { success: false };
    }
  };

  const removeFromHistory = async (id: number) => {
    try {
      const res = await fetch(`/api/meal-history/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setHistory(prev => prev.filter(h => h.id !== id));
      }
    } catch (err) {
      console.error('Failed to remove from meal history:', err);
    }
  };

  const searchHistory = (query: string) => {
    setSearch(query);
    fetchHistory({ search: query });
  };

  return {
    history,
    isLoading,
    search,
    setSearch: searchHistory,
    addToHistory,
    removeFromHistory,
    refreshHistory: () => fetchHistory({ search }),
  };
}