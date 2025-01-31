import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';

export const SearchBar = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <Input
        type="search"
        placeholder="Search movies and TV shows..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="bg-secondary"
      />
    </form>
  );
};