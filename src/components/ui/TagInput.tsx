import React from 'react';
import { Tag, X } from 'lucide-react';

interface TagInputProps {
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  suggestions?: string[];
  placeholder?: string;
  inputClassName?: string;
  label?: string;
}

export const TagInput: React.FC<TagInputProps> = ({
  tags,
  onAddTag,
  onRemoveTag,
  suggestions = [],
  placeholder = 'Add a tag...',
  inputClassName = '',
  label
}) => {
  const [newTag, setNewTag] = React.useState('');
  const [showSuggestions, setShowSuggestions] = React.useState(false);

  const filteredSuggestions = suggestions.length > 0 
    ? suggestions.filter(s => s.toLowerCase().includes(newTag.toLowerCase()) && !tags.includes(s)).slice(0, 5)
    : [];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredSuggestions.length > 0) {
        onAddTag(filteredSuggestions[0]);
        setNewTag('');
        setShowSuggestions(false);
      } else if (newTag.trim()) {
        onAddTag(newTag.trim());
        setNewTag('');
      }
    }
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      onAddTag(newTag.trim());
      setNewTag('');
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs font-bold text-neutral-theme uppercase tracking-wider">{label}</label>
      )}
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map(tag => (
          <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 text-primary text-xs font-bold">
            <Tag className="w-3 h-3" />
            {tag}
            <button onClick={() => onRemoveTag(tag)} className="hover:text-secondary">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="relative">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => {
              setNewTag(e.target.value);
              setShowSuggestions(suggestions.length > 0);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder={placeholder}
            className={`flex-1 px-4 py-2 rounded-xl bg-surface border-transparent focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all outline-none text-sm text-primary ${inputClassName}`}
          />
          <button
            onClick={handleAddTag}
            className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-xs font-bold hover:bg-primary hover:text-background-theme transition-all"
          >
            Add
          </button>
        </div>
        
        {newTag && showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border-theme rounded-xl shadow-xl z-50 overflow-hidden">
            {filteredSuggestions.map(suggestion => (
              <button
                key={suggestion}
                type="button"
                onClick={() => {
                  onAddTag(suggestion);
                  setNewTag('');
                  setShowSuggestions(false);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-background-theme text-primary transition-colors border-b border-border-theme last:border-0"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};