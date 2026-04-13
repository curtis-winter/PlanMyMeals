import React, { useState, useEffect, useRef } from 'react';

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
  const [ghostText, setGhostText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const search = async () => {
      if (value.length < 1) {
        setSuggestions([]);
        setGhostText('');
        return;
      }
      try {
        const url = `/api/pantry/search?q=${encodeURIComponent(value)}`;
        const res = await fetch(url);
        const data = await res.json();
        setSuggestions(data);
        
        if (data.length > 0 && value.length > 0) {
          const firstMatch = data[0].name;
          if (firstMatch.toLowerCase().startsWith(value.toLowerCase())) {
            setGhostText(firstMatch.slice(value.length));
          } else {
            setGhostText('');
          }
        } else {
          setGhostText('');
        }
      } catch (err) {
        setSuggestions([]);
        setGhostText('');
      }
    };
    const debounce = setTimeout(search, 150);
    return () => clearTimeout(debounce);
  }, [value]);

   const handleKeyDown = (e: React.KeyboardEvent) => {
     switch (e.key) {
       case 'Tab':
         if (ghostText) {
           e.preventDefault();
           if (suggestions.length > 0) {
             onSelect(suggestions[0]);
             setGhostText('');
           }
         }
         break;
       case 'ArrowDown':
         e.preventDefault();
         setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
         break;
       case 'ArrowUp':
         e.preventDefault();
         setSelectedIndex(prev => Math.max(prev - 1, -1));
         break;
       case 'Enter':
         e.preventDefault();
         if (selectedIndex >= 0 && suggestions.length > 0) {
           onSelect(suggestions[selectedIndex]);
           setGhostText('');
         } else if (value.trim()) {
           onSelect({ name: value.trim(), category: '' });
           setGhostText('');
         }
         break;
       case 'Escape':
         setGhostText('');
         setSelectedIndex(-1);
         break;
     }
   };

  return (
    <div className="relative">
      <div className="relative w-full">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full px-4 py-2 rounded-xl bg-surface border border-border-theme focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all outline-none text-sm text-primary font-inherit"
          autoComplete="off"
        />
        {ghostText && (
          <span 
            className="absolute inset-0 pointer-events-none flex items-center text-sm font-inherit"
            aria-hidden="true"
            style={{
              padding: '10px 16px',
              color: 'transparent',
              whiteSpace: 'pre',
            }}
          >
            <span style={{ color: 'transparent' }}>{value}</span>
            <span style={{ color: 'rgba(107, 114, 128, 0.5)' }}>{ghostText}</span>
          </span>
        )}
      </div>
      {suggestions.length > 0 && selectedIndex >= 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-surface border border-border-theme rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((item, idx) => (
            <li key={item.name}>
              <button
                type="button"
                onClick={() => onSelect(item)}
                className={`w-full px-4 py-2 text-left text-sm flex items-center justify-between transition-colors ${
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
        </ul>
      )}
    </div>
  );
};