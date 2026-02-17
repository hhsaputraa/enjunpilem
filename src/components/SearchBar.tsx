import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  className?: string;
}

export const SearchBar = ({ className }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setIsFocused(false);
    }
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <form onSubmit={handleSubmit} className="relative group">
        <Search className={cn(
          "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-200",
          isFocused ? "text-primary" : "text-muted-foreground"
        )} />
        
        <Input
          type="search"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          className={cn(
            "pl-10 h-10 w-full transition-all duration-200",
            "bg-muted/50 border-transparent hover:bg-muted/80 focus:bg-background",
            "focus:border-primary/20 focus:ring-2 focus:ring-primary/10",
            "placeholder:text-muted-foreground/70"
          )}
        />
      </form>

      {/* Search Suggestions */}
      {isFocused && query.trim() && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover/95 backdrop-blur-md border border-border/50 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div 
            className="p-3 cursor-pointer hover:bg-accent/50 transition-colors flex items-center gap-3 text-sm"
            onClick={() => {
              navigate(`/search?q=${encodeURIComponent(query)}`);
              setIsFocused(false);
            }}
          >
            <div className="bg-primary/10 p-2 rounded-full">
               <Search className="h-4 w-4 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-foreground">Search for "{query}"</span>
              <span className="text-xs text-muted-foreground">Press enter to see results</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};