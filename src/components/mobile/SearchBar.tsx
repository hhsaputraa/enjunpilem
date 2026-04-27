'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'recent' | 'trending' | 'suggestion';
}

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (query: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  suggestions?: SearchSuggestion[];
  recentSearches?: string[];
  className?: string;
  autoFocus?: boolean;
  showSuggestions?: boolean;
}


export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Cari film, serial TV...",
  value = '',
  onChange,
  onSearch,
  onFocus,
  onBlur,
  suggestions = [],
  recentSearches = [],
  className,
  autoFocus = false,
  showSuggestions = true,
}) => {
  const [query, setQuery] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    onChange?.(newValue);

    // Debounce search
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      if (newValue.trim()) {
        onSearch?.(newValue.trim());
      }
    }, 300);
  };

  const handleFocus = () => {
    setIsFocused(true);
    setShowDropdown(true);
    onFocus?.();
  };

  const handleBlur = () => {
    // Delay to allow clicking on suggestions
    setTimeout(() => {
      setIsFocused(false);
      setShowDropdown(false);
      onBlur?.();
    }, 150);
  };

  const handleClear = () => {
    setQuery('');
    onChange?.('');
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (text: string) => {
    setQuery(text);
    onChange?.(text);
    onSearch?.(text);
    setShowDropdown(false);
    inputRef.current?.blur();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch?.(query.trim());
      setShowDropdown(false);
      inputRef.current?.blur();
    }
  };

  const filteredSuggestions = suggestions.filter(s => 
    s.text.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className={cn("relative w-full", className)}>
      {/* Search Input */}
      <form onSubmit={handleSubmit} className="relative">
        <div className={cn(
          "relative flex items-center",
          "bg-secondary/50 rounded-2xl",
          "border transition-all duration-200",
          isFocused 
            ? "border-primary/50 bg-secondary shadow-lg shadow-primary/10" 
            : "border-border hover:border-border/80"
        )}>
          <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
          
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            className={cn(
              "pl-12 pr-12 py-3 text-base",
              "bg-transparent border-0 focus:ring-0",
              "placeholder:text-muted-foreground"
            )}
          />

          {query && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClear}
              className="absolute right-2 h-8 w-8 rounded-full hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && showDropdown && (
        <div className={cn(
          "absolute top-full left-0 right-0 mt-2 z-50",
          "bg-card/95 backdrop-blur-xl rounded-2xl",
          "border border-border/50 shadow-2xl",
          "max-h-80 overflow-y-auto",
          "animate-slide-down"
        )}>
          {/* Recent Searches */}
          {!query && recentSearches.length > 0 && (
            <div className="p-4 border-b border-border/50">
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pencarian Terakhir
              </h3>
              <div className="space-y-1">
                {recentSearches.slice(0, 5).map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(search)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors text-sm"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Trending/Suggestions */}
          {(query ? filteredSuggestions : suggestions).length > 0 && (
            <div className="p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                {query ? 'Saran' : 'Sedang Tren'}
              </h3>
              <div className="space-y-1">
                {(query ? filteredSuggestions : suggestions).slice(0, 8).map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion.text)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors text-sm flex items-center gap-3"
                  >
                    <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{suggestion.text}</span>
                    {suggestion.type === 'trending' && (
                      <TrendingUp className="h-3 w-3 text-primary flex-shrink-0 ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          
        </div>
      )}
    </div>
  );
};

// Hook for managing search state
export const useSearch = () => {
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const addToRecent = (searchQuery: string) => {
    setRecentSearches(prev => {
      const filtered = prev.filter(item => item !== searchQuery);
      return [searchQuery, ...filtered].slice(0, 10);
    });
  };

  const clearRecent = () => {
    setRecentSearches([]);
  };

  const performSearch = async (searchQuery: string) => {
    setIsSearching(true);
    addToRecent(searchQuery);
    
    try {
      // Perform actual search
      // const results = await searchAPI(searchQuery);
      // return results;
    } finally {
      setIsSearching(false);
    }
  };

  return {
    query,
    setQuery,
    recentSearches,
    isSearching,
    addToRecent,
    clearRecent,
    performSearch,
  };
};
