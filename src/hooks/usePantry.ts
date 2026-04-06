import { useState, useEffect } from 'react';
import { PantryItem } from '../types';

export function usePantry() {
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPantry = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/pantry');
      const data = await res.json();
      setPantryItems(data);
    } catch (err) {
      console.error('Failed to fetch pantry:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPantry();
  }, []);

  const savePantryItem = async (item: Partial<PantryItem>) => {
    try {
      const capitalizedItem = { ...item };
      if (capitalizedItem.name) {
        capitalizedItem.name = capitalizedItem.name.trim().charAt(0).toUpperCase() + capitalizedItem.name.trim().slice(1);
      }
      await fetch('/api/pantry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(capitalizedItem)
      });
      fetchPantry();
    } catch (err) {
      console.error('Failed to save pantry item:', err);
    }
  };

  const removePantryItem = async (id: number) => {
    try {
      await fetch(`/api/pantry/${id}`, {
        method: 'DELETE'
      });
      fetchPantry();
    } catch (err) {
      console.error('Failed to remove pantry item:', err);
    }
  };

  return {
    pantryItems,
    isLoading,
    savePantryItem,
    removePantryItem,
    refreshPantry: fetchPantry
  };
}
