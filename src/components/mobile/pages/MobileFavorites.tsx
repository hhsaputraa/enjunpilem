import React from 'react';
import { PageLayout } from '../MobileLayout';
import { EmptyFavorites } from '../EmptyState';
import { useNavigate } from 'react-router-dom';

export const MobileFavorites: React.FC = () => {
  const navigate = useNavigate();
  return (
    <PageLayout title="Favorit">
      <div className="flex-1 flex items-center justify-center h-full pt-16">
        <EmptyFavorites onExplore={() => navigate('/explore')} />
      </div>
    </PageLayout>
  );
};
