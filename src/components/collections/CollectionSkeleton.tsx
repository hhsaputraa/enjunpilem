
import React from 'react';

export const CollectionSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-48 rounded-lg bg-gray-800 animate-pulse" />
      ))}
    </div>
  );
};
