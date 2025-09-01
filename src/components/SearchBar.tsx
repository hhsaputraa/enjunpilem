import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';

export const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const clearSearch = () => {
    setQuery('');
  };

  return (
    <form onSubmit={handleSubmit} className="relative max-w-md mx-auto group">
      <div className={`relative transition-all duration-300 ${
        isFocused ? 'scale-105' : 'scale-100'
      }`}>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        <div className="relative flex items-center">
          <Search className={`absolute left-3 h-4 w-4 transition-colors duration-300 ${
            isFocused ? 'text-primary' : 'text-gray-400'
          }`} />

          <Input
            type="search"
            placeholder="🔍 Search movies, TV shows..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`pl-10 pr-10 bg-black/40 backdrop-blur-sm border-white/20 text-white placeholder:text-gray-400 rounded-xl transition-all duration-300 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 hover:bg-black/60 ${
              isFocused ? 'shadow-lg shadow-primary/10' : ''
            }`}
          />
        </div>

        {/* Search suggestions placeholder */}
        {isFocused && query && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 animate-fade-in">
            <div className="p-3 text-sm text-gray-400 border-b border-white/10">
              Press Enter to search for "{query}"
            </div>
            <div className="p-2 text-xs text-gray-500 text-center">
              💡 Try searching for popular titles like "Avengers" or "Breaking Bad"
            </div>
          </div>
        )}
      </div>
    </form>
  );
};