import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface AutocompleteItem {
  name: string;
  category?: string;
}

interface AutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (item: AutocompleteItem) => void;
  placeholder?: string;
}

export const Autocomplete: React.FC<AutocompleteProps> = ({
  value,
  onChange,
  onSelect,
  placeholder = 'Search...'
}) => {
  const [suggestions, setSuggestions] = useState<AutocompleteItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const search = async () => {
      if (value.length < 2) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }
      try {
        const url = `/api/pantry/search?q=${encodeURIComponent(value)}`;
        const res = await fetch(url);
        const data = await res.json();
        setSuggestions(data);
        setIsOpen(data.length > 0);
      } catch (err) {
        setSuggestions([]);
        setIsOpen(false);
      }
    };
    const debounce = setTimeout(search, 200);
    return () => clearTimeout(debounce);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && listRef.current && selectedIndex >= 0) {
      const items = listRef.current.querySelectorAll('li');
      const selectedItem = items[selectedIndex] as HTMLElement;
      if (selectedItem) {
        selectedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex, isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropdownHeight = 244;

      let position: 'below' | 'above' = 'below';
      if (dropdownHeight > spaceBelow && spaceAbove > spaceBelow) {
        position = 'above';
      }

      setDropdownStyle({
        position: 'fixed',
        top: position === 'below' ? `${rect.bottom + 4}px` : `${rect.top - 4 - dropdownHeight}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
      });
    }
  }, [isOpen, suggestions]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setIsOpen(true);
        setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions.length > 0) {
          handleSelect(suggestions[selectedIndex]);
        } else if (value.trim()) {
          onSelect({ name: value.trim(), category: undefined });
          setIsOpen(false);
          setSelectedIndex(-1);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
      case 'Tab':
        if (isOpen && selectedIndex >= 0) {
          e.preventDefault();
          handleSelect(suggestions[selectedIndex]);
        }
        break;
    }
  };

  const handleSelect = (item: AutocompleteItem) => {
    onChange(item.name);
    onSelect(item);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleInputChange = (newValue: string) => {
    onChange(newValue);
    setSelectedIndex(-1);
    if (newValue.length >= 2) {
      setIsOpen(true);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (suggestions.length > 0) {
            setIsOpen(true);
          }
        }}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl bg-surface border border-border-theme focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all outline-none text-sm text-primary font-inherit"
        autoComplete="off"
      />
      {isOpen && suggestions.length > 0 && (
        createPortal(
          <ul 
            ref={listRef}
            className="fixed z-[100] mt-1 bg-surface border border-border-theme rounded-xl shadow-lg max-h-60 overflow-y-auto" 
            style={dropdownStyle}
          >
            {suggestions.map((item, idx) => (
              <li key={item.name}>
                <button
                  type="button"
                  onClick={() => handleSelect(item)}
                  className={`w-full px-4 py-3 text-left text-sm flex items-center justify-between transition-colors ${
                    idx === selectedIndex 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-primary hover:bg-background-theme'
                  }`}
                >
                  <span>{item.name}</span>
                  {item.category && (
                    <span className="text-xs text-neutral-theme">{item.category}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>,
          document.body
        )
      )}
    </div>
  );
};