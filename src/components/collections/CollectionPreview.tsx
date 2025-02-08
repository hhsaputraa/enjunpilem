
import React from 'react';
import { getImageUrl } from '@/services/tmdb';

interface CollectionItem {
  id: string;
  media_id: number;
  media_type: 'movie' | 'tv';
  title?: string;
  name?: string;
  poster_path?: string;
}

interface CollectionPreviewProps {
  items: CollectionItem[];
}

export const CollectionPreview = ({ items }: CollectionPreviewProps) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="grid grid-cols-3 gap-2 mb-4 h-32">
      {items.slice(0, 3).map((item) => (
        <div key={item.id} className="relative rounded-md overflow-hidden bg-gray-900">
          {item.poster_path ? (
            <img
              src={getImageUrl(item.poster_path)}
              alt={item.title || item.name || ''}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              No Image
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
